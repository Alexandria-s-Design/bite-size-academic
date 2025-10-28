// Stripe integration for subscription management
import Stripe from 'stripe'
import { prisma } from './prisma'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Pricing configuration
export const STRIPE_PLANS = {
  premium: {
    monthly: {
      priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      amount: 999, // $9.99
    },
    yearly: {
      priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
      amount: 9999, // $99.99 (2 months free)
    },
  },
  enterprise: {
    monthly: {
      priceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
      amount: 4999, // $49.99
    },
    yearly: {
      priceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!,
      amount: 49999, // $499.99 (2 months free)
    },
  },
}

// Create checkout session
export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  // Get or create Stripe customer
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, stripeCustomerId: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  let customerId = user.stripeCustomerId

  if (!customerId) {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId,
      },
    })
    customerId = customer.id

    // Save customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
    },
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
      trial_period_days: 7, // 7-day free trial
    },
  })

  return session
}

// Create customer portal session
export async function createPortalSession({
  userId,
  returnUrl,
}: {
  userId: string
  returnUrl: string
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    throw new Error('No Stripe customer found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}

// Handle subscription created/updated
export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.userId

  if (!userId) {
    throw new Error('No userId in subscription metadata')
  }

  const priceId = subscription.items.data[0]?.price.id
  let tier = 'free'

  // Determine tier from price ID
  if (priceId === STRIPE_PLANS.premium.monthly.priceId ||
      priceId === STRIPE_PLANS.premium.yearly.priceId) {
    tier = 'premium'
  } else if (priceId === STRIPE_PLANS.enterprise.monthly.priceId ||
             priceId === STRIPE_PLANS.enterprise.yearly.priceId) {
    tier = 'enterprise'
  }

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionTier: tier,
      subscriptionStatus: subscription.status === 'active' ? 'active' : 'cancelled',
      subscriptionStartsAt: new Date(subscription.current_period_start * 1000),
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  // Create or update subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCustomerId: subscription.customer as string,
      tier,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.items.data[0]?.price.currency || 'usd',
      interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  })

  return { userId, tier, status: subscription.status }
}

// Handle subscription deleted
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.userId

  if (!userId) {
    throw new Error('No userId in subscription metadata')
  }

  // Update user to free tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'free',
      subscriptionStatus: 'cancelled',
      stripeSubscriptionId: null,
    },
  })

  // Update subscription record
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  })

  return { userId }
}

// Handle payment succeeded
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  // Log successful payment
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'invoice_payment_succeeded',
      eventData: {
        invoiceId: invoice.id,
        subscriptionId,
        amount: invoice.amount_paid,
        currency: invoice.currency,
      },
    },
  })
}

// Handle payment failed
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { user: true },
  })

  if (!subscription) return

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'past_due' },
  })

  // Send payment failed email (implement in email service)
  // await sendPaymentFailedEmail(subscription.user.email)

  // Log failed payment
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'invoice_payment_failed',
      userId: subscription.userId,
      eventData: {
        invoiceId: invoice.id,
        subscriptionId,
        amount: invoice.amount_due,
        currency: invoice.currency,
      },
    },
  })
}

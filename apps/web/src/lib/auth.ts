// Authentication configuration with NextAuth.js v5 (Auth.js)
import NextAuth, { type DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'
import { z } from 'zod'

// Extend session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      subscriptionTier: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
    subscriptionTier: string
  }
}

// Login schema validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
    verifyRequest: '/verify-email',
    newUser: '/onboarding',
  },
  providers: [
    // Email & Password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials)

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              name: true,
              role: true,
              subscriptionTier: true,
              emailVerified: true,
              isActive: true,
            },
          })

          if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials')
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error('Account has been deactivated')
          }

          // Verify password
          const isValid = await compare(password, user.passwordHash)
          if (!isValid) {
            throw new Error('Invalid credentials')
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),

    // Google OAuth (optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.subscriptionTier = user.subscriptionTier
      }

      // Update session trigger
      if (trigger === 'update' && session) {
        token = { ...token, ...session.user }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.subscriptionTier = token.subscriptionTier as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow email verification to proceed
      if (account?.provider === 'email') {
        return true
      }

      // For OAuth, check if email is verified
      if (account?.provider === 'google') {
        // Auto-verify OAuth emails
        await prisma.user.update({
          where: { email: user.email! },
          data: { emailVerified: new Date() },
        })
        return true
      }

      return true
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Track sign-in event
      if (user.id) {
        await prisma.analyticsEvent.create({
          data: {
            eventType: isNewUser ? 'user_registered' : 'user_login',
            userId: user.id,
            eventData: {
              provider: 'credentials',
              timestamp: new Date().toISOString(),
            },
          },
        })
      }
    },
  },
})

// Helper function to get current session
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

// Helper function to require authentication
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Helper function to require admin role
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}

// Helper function to check subscription tier
export function hasSubscription(
  user: { subscriptionTier: string },
  requiredTier: 'free' | 'premium' | 'enterprise'
) {
  const tierHierarchy = { free: 0, premium: 1, enterprise: 2 }
  const userTierLevel = tierHierarchy[user.subscriptionTier as keyof typeof tierHierarchy] || 0
  const requiredTierLevel = tierHierarchy[requiredTier]
  return userTierLevel >= requiredTierLevel
}

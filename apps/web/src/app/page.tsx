'use client'

import * as React from 'react'
import { CheckCircle, Clock, Users, Headphones, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldSelector } from '@/components/field-selector'
import { SignupForm } from '@/components/signup-form'

export default function HomePage() {
  const [selectedField, setSelectedField] = React.useState<string>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId)
  }

  const handleSignup = async (data: { email: string; field: string }) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false)
        setSelectedField(undefined)
      }, 5000)
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🧬</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bite Size Academic</h1>
                <p className="text-xs text-gray-600">Stay current in 15 minutes per week</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="/premium" className="text-gray-600 hover:text-gray-900">
                Premium
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Stay Current with
              <span className="text-brand-blue"> Academic Research</span>
              <br />
              Without the Overwhelm
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get weekly curated digests of 3-5 cutting-edge research papers in your field.
              Each summary includes key findings, context, and why it matters—delivered in
              under 15 minutes of reading time.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>1,000+ academics</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>15 min/week</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="max-w-md mx-auto mb-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Welcome to Bite Size Academic!
              </h3>
              <p className="text-green-700">
                Check your email for a confirmation link. Your first digest arrives this Friday!
              </p>
            </div>
          )}

          {/* Field Selection */}
          <FieldSelector
            selectedField={selectedField}
            onFieldSelect={handleFieldSelect}
            className="mb-12"
          />

          {/* Signup Form */}
          <SignupForm
            selectedField={selectedField}
            onFieldSelect={handleFieldSelect}
            onSubmit={handleSignup}
            isLoading={isSubmitting}
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Current
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We handle the information overload so you can focus on what matters most in your research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-brand-blue/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-brand-blue" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Expertly Curated
              </h3>
              <p className="text-gray-600">
                Our team selects the most important papers from top journals and preprint servers.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Time Efficient
              </h3>
              <p className="text-gray-600">
                Get up to speed in just 15 minutes per week with reading time estimates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Field Specific
              </h3>
              <p className="text-gray-600">
                Choose from 5 academic fields to get content tailored to your interests.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Headphones className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Audio Available
              </h3>
              <p className="text-gray-600">
                Premium subscribers get weekly podcast episodes for listening on the go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with Bite Size Academic takes less than 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg border-2 border-brand-blue">
                <span className="text-2xl font-bold text-brand-blue">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Choose Your Field
              </h3>
              <p className="text-gray-600">
                Select from Life Sciences, AI & Computing, Humanities & Culture, Policy & Governance, or Climate & Earth Systems.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg border-2 border-brand-blue">
                <span className="text-2xl font-bold text-brand-blue">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Confirm Your Email
              </h3>
              <p className="text-gray-600">
                Check your email for a confirmation link to activate your subscription.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg border-2 border-brand-blue">
                <span className="text-2xl font-bold text-brand-blue">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Receive Weekly Digests
              </h3>
              <p className="text-gray-600">
                Get your curated email digest every Friday with the latest research in your field.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="brand" size="lg" className="text-lg px-8">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Academics Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what researchers are saying about Bite Size Academic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="bg-brand-blue text-white rounded-full p-2 w-10 h-10 mr-3 flex items-center justify-center">
                  <span className="font-bold">SC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Dr. Sarah Chen</h4>
                  <p className="text-sm text-gray-600">Neuroscience Postdoc</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Bite Size Academic has been a game-changer for keeping up with research outside my immediate subfield. The summaries are spot-on and save me hours every week."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 text-white rounded-full p-2 w-10 h-10 mr-3 flex items-center justify-center">
                  <span className="font-bold">MJ</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Prof. Mark Johnson</h4>
                  <p className="text-sm text-gray-600">Computer Science</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The AI & Computing digest helps me stay current with machine learning advances while focusing on my teaching. It's exactly what I needed."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 text-white rounded-full p-2 w-10 h-10 mr-3 flex items-center justify-center">
                  <span className="font-bold">ER</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Dr. Emily Rodriguez</h4>
                  <p className="text-sm text-gray-600">Policy Researcher</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "I love the podcast feature! I listen during my commute and arrive at work already up-to-date with the latest policy research."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-blue to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Stay Current Without the Overwhelm?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of academics who trust Bite Size Academic to keep them informed.
          </p>
          <Button variant="secondary" size="lg" className="text-lg px-8 bg-white text-brand-blue hover:bg-gray-50">
            Start Your Free Subscription
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-white/80 mt-4">
            No credit card required • Cancel anytime • Always free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">🧬</div>
                <div>
                  <h3 className="text-xl font-bold">Bite Size Academic</h3>
                  <p className="text-sm text-gray-400">Stay current in 15 minutes per week</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                We help academics stay current with cutting-edge research without the information overload.
                Curated weekly digests delivered to your inbox.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white">Features</a></li>
                <li><a href="/premium" className="hover:text-white">Premium</a></li>
                <li><a href="/fields" className="hover:text-white">Academic Fields</a></li>
                <li><a href="/api" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Bite Size Academic. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
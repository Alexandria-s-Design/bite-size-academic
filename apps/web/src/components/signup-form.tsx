'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateEmail } from '@/lib/utils'

const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  field: z.string().min(1, 'Please select an academic field'),
})

type SignupForm = z.infer<typeof signupSchema>

interface SignupFormProps {
  selectedField?: string
  onFieldSelect: (fieldId: string) => void
  onSubmit: (data: SignupForm) => Promise<void>
  isLoading?: boolean
  className?: string
}

export function SignupForm({
  selectedField,
  onFieldSelect,
  onSubmit,
  isLoading = false,
  className,
}: SignupFormProps) {
  const [email, setEmail] = React.useState('')
  const [emailError, setEmailError] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      field: selectedField || '',
    },
  })

  // Update form when selectedField changes
  React.useEffect(() => {
    if (selectedField) {
      setValue('field', selectedField)
      trigger('field')
    }
  }, [selectedField, setValue, trigger])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setValue('email', value)

    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
    trigger('email')
  }

  const handleFormSubmit = async (data: SignupForm) => {
    try {
      await onSubmit(data)
    } catch (error) {
      // Error handling is managed by the parent component
      console.error('Signup error:', error)
    }
  }

  const isSubmitDisabled = !isValid || isLoading || !selectedField

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={handleEmailChange}
              className={`pl-10 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
          {emailError && !errors.email && (
            <p className="text-sm text-red-600">{emailError}</p>
          )}
          <p className="text-xs text-gray-500">
            We'll send a confirmation email to this address
          </p>
        </div>

        {/* Field Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900">
            Academic Field
          </Label>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {selectedField ? getFieldEmoji(selectedField) : '📚'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedField ? getFieldName(selectedField) : 'No field selected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedField ? getFieldDescription(selectedField) : 'Choose your field below'}
                  </p>
                </div>
              </div>
              {!selectedField && (
                <div className="text-brand-blue font-medium text-sm">
                  Required
                </div>
              )}
            </div>
          </div>
          {errors.field && (
            <p className="text-sm text-red-600">{errors.field.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          variant="brand"
          disabled={isSubmitDisabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating your account...
            </>
          ) : (
            'Sign Up for Free Weekly Digest'
          )}
        </Button>

        {/* Terms and Privacy */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>
            By signing up, you agree to receive weekly research digests via email.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/privacy" className="text-brand-blue hover:underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="text-brand-blue hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

// Helper functions for field information
function getFieldEmoji(field: string): string {
  const emojis = {
    'life-sciences': '🧬',
    'ai-computing': '🤖',
    'humanities-culture': '📚',
    'policy-governance': '🏛️',
    'climate-earth-systems': '🌍',
  }
  return emojis[field] || '📚'
}

function getFieldName(field: string): string {
  const names = {
    'life-sciences': 'Life Sciences',
    'ai-computing': 'AI & Computing',
    'humanities-culture': 'Humanities & Culture',
    'policy-governance': 'Policy & Governance',
    'climate-earth-systems': 'Climate & Earth Systems',
  }
  return names[field] || 'Academic Research'
}

function getFieldDescription(field: string): string {
  const descriptions = {
    'life-sciences': 'Biology, genetics, neuroscience, and health sciences',
    'ai-computing': 'Machine learning, AI, and computational systems',
    'humanities-culture': 'Cultural studies, history, philosophy, and literature',
    'policy-governance': 'Public policy, governance, and political science',
    'climate-earth-systems': 'Climate science, environmental studies, and sustainability',
  }
  return descriptions[field] || 'Academic research and scholarship'
}
'use client'

import * as React from 'react'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AcademicField {
  id: string
  name: string
  emoji: string
  description: string
  color: string
  exampleTopics: string[]
}

const academicFields: AcademicField[] = [
  {
    id: 'life-sciences',
    name: 'Life Sciences',
    emoji: '🧬',
    description: 'Research covering living organisms, biological processes, and health sciences',
    color: 'green',
    exampleTopics: ['Genetics', 'Neuroscience', 'Immunology', 'Molecular Biology'],
  },
  {
    id: 'ai-computing',
    name: 'AI & Computing',
    emoji: '🤖',
    description: 'Advances in artificial intelligence, computer science, and computational systems',
    color: 'blue',
    exampleTopics: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Robotics'],
  },
  {
    id: 'humanities-culture',
    name: 'Humanities & Culture',
    emoji: '📚',
    description: 'Scholarly work exploring human expression, cultural phenomena, and historical contexts',
    color: 'purple',
    exampleTopics: ['Cultural Studies', 'History', 'Philosophy', 'Literature'],
  },
  {
    id: 'policy-governance',
    name: 'Policy & Governance',
    emoji: '🏛️',
    description: 'Research on public policy, governance systems, and regulatory frameworks',
    color: 'amber',
    exampleTopics: ['Public Policy', 'Political Science', 'Economics Policy', 'Governance'],
  },
  {
    id: 'climate-earth-systems',
    name: 'Climate & Earth Systems',
    emoji: '🌍',
    description: 'Integrated research on Earth\'s climate system, environmental changes, and sustainability',
    color: 'cyan',
    exampleTopics: ['Climate Science', 'Environmental Policy', 'Sustainability', 'Earth Systems'],
  },
]

interface FieldSelectorProps {
  selectedField?: string
  onFieldSelect: (fieldId: string) => void
  className?: string
}

export function FieldSelector({ selectedField, onFieldSelect, className }: FieldSelectorProps) {
  const [hoveredField, setHoveredField] = React.useState<string | null>(null)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Choose Your Academic Field
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the field that best matches your research interests. You'll receive a curated weekly digest
          with the most important developments in your chosen area.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {academicFields.map((field) => {
          const isSelected = selectedField === field.id
          const isHovered = hoveredField === field.id

          return (
            <div
              key={field.id}
              className={cn(
                'relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200',
                isSelected
                  ? 'border-brand-blue bg-blue-50 shadow-brand'
                  : isHovered
                  ? 'border-gray-300 bg-gray-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
              onClick={() => onFieldSelect(field.id)}
              onMouseEnter={() => setHoveredField(field.id)}
              onMouseLeave={() => setHoveredField(null)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-brand-blue" />
                </div>
              )}

              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">{field.emoji}</div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {field.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {field.description}
                </p>

                <div className="w-full">
                  <p className="text-xs font-medium text-gray-500 mb-2">Example Topics:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {field.exampleTopics.map((topic) => (
                      <span
                        key={topic}
                        className={cn(
                          'inline-block px-2 py-1 text-xs rounded-full',
                          isSelected
                            ? 'bg-brand-blue text-white'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        <p>
          Not sure which field to choose? You can always update your preferences later.
        </p>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { KatexFormula } from '@/components/KatexFormula'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DisplayLaw {
  name: string
  katexFormula: string
  description?: string
}

interface LawCategory {
  id: string
  title: string
  description?: string
  laws: DisplayLaw[]
}

interface TabGroup {
  name: string
  categories: LawCategory[]
}

// Group the tabs into logical sections
const groupedGuideContent: TabGroup[] = [
  {
    name: 'Basic Operations',
    categories: [
      {
        id: 'operators',
        title: 'Operators',
        description: 'Core operators and their notation used in the simplifier.',
        laws: [
          { name: 'NOT (Negation)', katexFormula: '\\lnot A', description: 'Standard: !A, ¬A' },
          {
            name: 'AND (Conjunction)',
            katexFormula: 'A \\land B',
            description: 'Standard: A*B, A&B, A∧B',
          },
          {
            name: 'OR (Disjunction)',
            katexFormula: 'A \\lor B',
            description: 'Standard: A+B, A|B, A∨B',
          },
          {
            name: 'XOR (Exclusive OR)',
            katexFormula: 'A \\oplus B',
            description: 'Standard: A^B, A⊕B. Equivalent to (A ∧ ¬B) ∨ (¬A ∧ B)',
          },
          {
            name: 'NAND',
            katexFormula: 'A \\uparrow B',
            description: 'Standard: A@B, A↑B. Equivalent to ¬(A ∧ B)',
          },
          {
            name: 'NOR',
            katexFormula: 'A \\downarrow B',
            description: 'Standard: A#B, A↓B. Equivalent to ¬(A ∨ B)',
          },
          {
            name: 'XNOR (Equivalence)',
            katexFormula: 'A \\leftrightarrow B',
            description: 'Standard: A<=>B, A↔B. Equivalent to (A ∧ B) ∨ (¬A ∧ ¬B)',
          },
          {
            name: 'Constants',
            katexFormula: '1(\\text{True}), 0(\\text{False})',
            description: 'Logical constants.',
          },
        ],
      },
      {
        id: 'derivedOperators',
        title: 'Derived Operators',
        description: 'Key properties and simplifications for XOR, XNOR, NAND, and NOR.',
        laws: [
          { name: 'XOR with 0 (Identity)', katexFormula: 'A \\oplus 0 = A' },
          { name: 'XOR with 1', katexFormula: 'A \\oplus 1 = \\lnot A' },
          { name: 'XOR with Self', katexFormula: 'A \\oplus A = 0' },
          { name: 'XOR with Complement', katexFormula: 'A \\oplus \\lnot A = 1' },
          { name: 'NAND with 0', katexFormula: 'A \\uparrow 0 = 1' },
          { name: 'NAND with 1', katexFormula: 'A \\uparrow 1 = \\lnot A' },
          { name: 'NAND with Self', katexFormula: 'A \\uparrow A = \\lnot A' },
          { name: 'Double NAND (¬(A ↑ B))', katexFormula: '\\lnot(A \\uparrow B) = A \\land B' },
          { name: 'NOR with 0', katexFormula: 'A \\downarrow 0 = \\lnot A' },
          { name: 'NOR with 1', katexFormula: 'A \\downarrow 1 = 0' },
          { name: 'NOR with Self', katexFormula: 'A \\downarrow A = \\lnot A' },
          { name: 'Double NOR (¬(A ↓ B))', katexFormula: '\\lnot(A \\downarrow B) = A \\lor B' },
          { name: 'XNOR with 1 (Identity)', katexFormula: 'A \\leftrightarrow 1 = A' },
          { name: 'XNOR with 0', katexFormula: 'A \\leftrightarrow 0 = \\lnot A' },
          { name: 'XNOR with Self', katexFormula: 'A \\leftrightarrow A = 1' },
          { name: 'XNOR with Complement', katexFormula: 'A \\leftrightarrow \\lnot A = 0' },
        ],
      },
      {
        id: 'fundamental',
        title: 'Fundamental',
        description: 'Basic properties underpinning Boolean algebra.',
        laws: [
          {
            name: 'Identity (AND)',
            katexFormula: 'A \\land 1 = A',
            description: 'A variable ANDed with true remains unchanged.',
          },
          {
            name: 'Identity (OR)',
            katexFormula: 'A \\lor 0 = A',
            description: 'A variable ORed with false remains unchanged.',
          },
          {
            name: 'Domination (AND)',
            katexFormula: 'A \\land 0 = 0',
            description: 'Anything ANDed with false is false.',
          },
          {
            name: 'Domination (OR)',
            katexFormula: 'A \\lor 1 = 1',
            description: 'Anything ORed with true is true.',
          },
          {
            name: 'Idempotence (AND)',
            katexFormula: 'A \\land A = A',
            description: 'ANDing a variable with itself yields the variable.',
          },
          {
            name: 'Idempotence (OR)',
            katexFormula: 'A \\lor A = A',
            description: 'ORing a variable with itself yields the variable.',
          },
          {
            name: 'Complementation (AND)',
            katexFormula: 'A \\land \\lnot A = 0',
            description: 'A variable ANDed with its negation is false (Contradiction).',
          },
          {
            name: 'Complementation (OR)',
            katexFormula: 'A \\lor \\lnot A = 1',
            description: 'A variable ORed with its negation is true (Tautology).',
          },
          {
            name: 'Double Negation',
            katexFormula: '\\lnot (\\lnot A) = A',
            description: 'Negating a negation returns the original variable.',
          },
        ],
      },
    ],
  },
  {
    name: 'Advanced Operations',
    categories: [
      {
        id: 'commutativeAssociative',
        title: 'Order & Grouping',
        description:
          'Laws governing the order and grouping of operations (Commutative & Associative).',
        laws: [
          { name: 'Commutative (AND)', katexFormula: 'A \\land B = B \\land A' },
          { name: 'Commutative (OR)', katexFormula: 'A \\lor B = B \\lor A' },
          {
            name: 'Associative (AND)',
            katexFormula: '(A \\land B) \\land C = A \\land (B \\land C)',
          },
          { name: 'Associative (OR)', katexFormula: '(A \\lor B) \\lor C = A \\lor (B \\lor C)' },
        ],
      },
      {
        id: 'distributiveAbsorption',
        title: 'Distribution & Absorption',
        description: 'Expanding, factoring, and simplifying expressions.',
        laws: [
          {
            name: 'Distributive (AND over OR)',
            katexFormula: 'A \\land (B \\lor C) = (A \\land B) \\lor (A \\land C)',
          },
          {
            name: 'Distributive (OR over AND)',
            katexFormula: 'A \\lor (B \\land C) = (A \\lor B) \\land (A \\lor C)',
          },
          { name: 'Absorption (OR)', katexFormula: 'A \\lor (A \\land B) = A' },
          { name: 'Absorption (AND)', katexFormula: 'A \\land (A \\lor B) = A' },
        ],
      },
      {
        id: 'factorization',
        title: 'Factorization',
        description: 'Factoring common terms (reverse of distribution).',
        laws: [
          {
            name: 'Factorization (AND from OR)',
            katexFormula: '(A \\land B) \\lor (A \\land C) = A \\land (B \\lor C)',
          },
          {
            name: 'Factorization (OR from AND)',
            katexFormula: '(A \\lor B) \\land (A \\lor C) = A \\lor (B \\land C)',
          },
        ],
      },
    ],
  },
  {
    name: 'Simplification Techniques',
    categories: [
      {
        id: 'redundancy',
        title: 'Redundancy',
        description: 'Laws for removing redundant terms.',
        laws: [
          {
            name: 'Redundancy (Form 1)',
            katexFormula: '(A \\land B) \\lor (A \\land \\lnot B) = A',
          },
          {
            name: 'Redundancy (Form 2)',
            katexFormula: '(A \\lor B) \\land (A \\lor \\lnot B) = A',
          },
        ],
      },
      {
        id: 'deMorganConsensus',
        title: 'De Morgan & Consensus',
        description: 'Advanced simplification techniques.',
        laws: [
          {
            name: "De Morgan's (AND)",
            katexFormula: '\\lnot (A \\land B) = \\lnot A \\lor \\lnot B',
          },
          {
            name: "De Morgan's (OR)",
            katexFormula: '\\lnot (A \\lor B) = \\lnot A \\land \\lnot B',
          },
          {
            name: 'Consensus (OR form)',
            katexFormula:
              '(A \\land B) \\lor (\\lnot A \\land C) \\lor (B \\land C) = (A \\land B) \\lor (\\lnot A \\land C)',
          },
          {
            name: 'Consensus (AND form)',
            katexFormula:
              '(A \\lor B) \\land (\\lnot A \\lor C) \\land (B \\lor C) = (A \\lor B) \\land (\\lnot A \\lor C)',
          },
        ],
      },
    ],
  },
]

// Flatten all categories for content lookup
const allCategories = groupedGuideContent.flatMap(group => group.categories)

export function Guide() {
  // State for managing expanded groups in the sidebar
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    // Initially expand the first group
    [groupedGuideContent[0].name]: true,
  })
  // Determine the first category ID for initial active state
  const firstCategoryId = groupedGuideContent[0].categories[0]?.id || 'operators'
  // State for managing the active tab (category)
  const [activeTab, setActiveTab] = useState(firstCategoryId)

  // Toggle expansion of a group in the sidebar
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  // Handle tab (category) changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Find which group this tab belongs to and ensure it is expanded
    for (const group of groupedGuideContent) {
      const foundCategory = group.categories.find(cat => cat.id === value)
      if (foundCategory) {
        // Ensure the group is expanded when a category within it is selected
        setExpandedGroups(prev => ({
          ...prev,
          [group.name]: true,
        }))
        break
      }
    }
  }

  // Get the content for the currently active category
  const activeCategory = allCategories.find(category => category.id === activeTab)

  return (
    <div className="flex h-full space-x-4">
      <div className="w-fit pr-4 border-r border-gray-200 overflow-y-auto">
        <nav className="py-2">
          {groupedGuideContent.map(group => (
            <div key={group.name} className="mb-1">
              <Button
                variant="ghost"
                onClick={() => toggleGroup(group.name)}
                className="flex text-left w-full justify-between"
              >
                {group.name}
                {expandedGroups[group.name] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expandedGroups[group.name] && (
                <div className="ml-4">
                  {group.categories.map(category => (
                    <Button
                      variant="ghost"
                      key={category.id}
                      onClick={() => handleTabChange(category.id)}
                      className="flex text-left"
                    >
                      {category.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right content area */}
      <div className="flex-1 overflow-y-auto">
        {activeCategory && (
          <div>
            <h2 className="text-lg font-medium mb-2">{activeCategory.title}</h2>
            {activeCategory.description && (
              <p className="text-sm text-gray-500 mb-4">{activeCategory.description}</p>
            )}

            <div className="space-y-4">
              {activeCategory.laws.map((law, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{law.name}</h3>
                      {law.description && (
                        <p className="text-xs text-gray-500 mt-1">{law.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <KatexFormula formula={law.katexFormula} block={false} className="text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

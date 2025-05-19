'use client'

import { useState, Suspense } from 'react'
// import { KatexFormula } from '@/components/KatexFormula'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { groupedGuideContent, allCategories } from './guide-content'
import dynamic from 'next/dynamic'

const KatexFormulaComponent = dynamic(
  () => import('@/components/KatexFormula').then(mod => mod.KatexFormula),
  {
    loading: () => null,
    ssr: false,
  }
)

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
    <div className="flex w-full h-full space-x-4">
      <div className="w-fit pr-4 border-r border-[var(--border)]">
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
      <div className="flex-1 w-full">
        {activeCategory && (
          <div>
            <h2 className="text-lg font-medium mb-2">{activeCategory.title}</h2>
            {activeCategory.description && (
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                {activeCategory.description}
              </p>
            )}

            <div className="space-y-4">
              {activeCategory.laws.map(law => (
                <div
                  key={law.name}
                  className="border-b border-[var(--border)] pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm whitespace-nowrap">{law.name}</h3>
                      {law.description && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {law.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Suspense fallback={null}>
                        <KatexFormulaComponent
                          formula={law.katexFormula}
                          block={false}
                          className="text-sm"
                        />
                      </Suspense>
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

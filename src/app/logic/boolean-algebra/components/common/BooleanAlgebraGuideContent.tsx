'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import {
  GuideWrapper,
  GuideSidebar,
  GuideGroup,
  GuideItem,
  GuideContent,
  GuideContentTitle,
  GuideContentDescription,
  GuideContentItem,
  GuideContentItemTitle,
  GuideContentItemDescription,
} from '@/components/guide-dialogs'
import { groupedGuideContent, allCategories } from './guide-content'

const KatexFormulaComponent = dynamic(
  () => import('@/components/KatexFormula').then(mod => mod.KatexFormula),
  {
    loading: () => <div className="text-sm text-[var(--muted-foreground)]">Loading...</div>,
    ssr: false,
  }
)

export function BooleanAlgebraGuideContent() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    if (groupedGuideContent.length > 0) {
      initialState[groupedGuideContent[0].name] = true
    }
    return initialState
  })

  const firstCategoryId = groupedGuideContent[0]?.categories[0]?.id || allCategories[0]?.id || ''
  const [activeTab, setActiveTab] = useState<string>(firstCategoryId)

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    for (const group of groupedGuideContent) {
      const foundCategory = group.categories.find(cat => cat.id === value)
      if (foundCategory) {
        setExpandedGroups(prev => ({
          ...prev,
          [group.name]: true,
        }))
        break
      }
    }
  }

  const activeCategory = allCategories.find(category => category.id === activeTab)

  return (
    <GuideWrapper>
      <GuideSidebar>
        {groupedGuideContent.map(group => (
          <GuideGroup
            key={group.name}
            name={group.name}
            expanded={!!expandedGroups[group.name]}
            onToggle={() => toggleGroup(group.name)}
          >
            {group.categories.map(category => (
              <GuideItem
                key={category.id}
                onClick={() => handleTabChange(category.id)}
                active={activeTab === category.id}
              >
                {category.title}
              </GuideItem>
            ))}
          </GuideGroup>
        ))}
      </GuideSidebar>

      <GuideContent>
        {activeCategory && (
          <>
            <GuideContentTitle>{activeCategory.title}</GuideContentTitle>
            {activeCategory.description && (
              <GuideContentDescription>{activeCategory.description}</GuideContentDescription>
            )}

            <div className="space-y-4">
              {activeCategory.laws.map(law => (
                <GuideContentItem key={law.name}>
                  <GuideContentItemTitle>{law.name}</GuideContentItemTitle>
                  {law.description && (
                    <GuideContentItemDescription>{law.description}</GuideContentItemDescription>
                  )}
                  <div className="ml-auto pl-4 flex-shrink-0">
                    {' '}
                    {/* Ensure KatexFormula is on the right */}
                    <Suspense
                      fallback={
                        <div className="text-sm text-[var(--muted-foreground)]">Rendering...</div>
                      }
                    >
                      <KatexFormulaComponent
                        formula={law.katexFormula}
                        block={false}
                        className="text-sm"
                      />
                    </Suspense>
                  </div>
                </GuideContentItem>
              ))}
            </div>
          </>
        )}
        {!activeCategory && (
          <p className="text-sm text-[var(--muted-foreground)]">
            Select a category to see the content.
          </p>
        )}
      </GuideContent>
    </GuideWrapper>
  )
}

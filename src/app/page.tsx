'use client'

import { BentoGrid, BentoCard } from '@/components/magicui/bento-grid'
import { Lightbulb } from 'lucide-react'
import { cardComponents } from '@/components/card-preview'

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-6rem)] justify-center items-center sm:py-12">
      <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-4">
        {cardComponents.map(feature => (
          <BentoCard
            key={feature.name}
            name={feature.name}
            className={feature.className}
            background={feature.background}
            Icon={feature.Icon || Lightbulb}
            description={feature.description}
            href={feature.href}
            cta={feature.cta}
          />
        ))}
      </BentoGrid>
    </div>
  )
}

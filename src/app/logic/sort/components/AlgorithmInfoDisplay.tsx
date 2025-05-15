'use client'

import React, { useState, useEffect } from 'react'
import type { SortAlgorithm } from '../engine/algorithmRegistry'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AUTHOR_RESPECT_QUOTES } from '../constants/authorQuotes'

interface AlgorithmInfoDisplayProps {
  selectedAlgorithm: SortAlgorithm | undefined
}

export function AlgorithmInfoDisplay({
  selectedAlgorithm,
}: AlgorithmInfoDisplayProps): React.JSX.Element {
  const [randomQuote, setRandomQuote] = useState<string>(
    'Honoring the brilliant minds behind these fundamental sorting algorithms.'
  )

  // console.log('AlgorithmInfoDisplay: Rendering. Selected Algorithm ID:', selectedAlgorithm?.id); // Covered by useEffect

  useEffect(() => {
    if (selectedAlgorithm) {
      const randomIndex = Math.floor(Math.random() * AUTHOR_RESPECT_QUOTES.length)
      setRandomQuote(AUTHOR_RESPECT_QUOTES[randomIndex])
    } else {
      setRandomQuote('Select an algorithm to see its details.')
    }
  }, [selectedAlgorithm])

  if (!selectedAlgorithm) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <CardTitle>Algorithm Details</CardTitle>
          <CardDescription>{randomQuote}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Select an algorithm to see its details.</p>
        </CardContent>
      </Card>
    )
  }

  const { name, description, origin, complexity, img } = selectedAlgorithm
  const displayImgSrc = img && img.trim() !== '' ? img : '/unknow-person.png'

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{randomQuote}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pt-0 text-sm flex flex-col space-y-6 no-scrollbar">
        {/* Upper Section: Description, Image, Info */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">
          {/* Left Column: Description */}
          <div className="md:col-span-3 space-y-1">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          {/* Right Column: Image and Origin */}
          <div className="flex flex-col items-center md:items-start md:col-span-2 space-y-4">
            {displayImgSrc && (
              <div className="relative w-full max-w-[240px] sm:max-w-[280px] md:max-w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg group">
                <Image
                  src={displayImgSrc}
                  alt={origin?.name ? `Photo of ${origin.name}` : `${name} author`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, (max-width: 1024px) 30vw, 20vw"
                />
              </div>
            )}
            {origin && (
              <div className="w-full pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">Information</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="grid grid-cols-[min-content_1fr] items-start gap-x-2">
                    <span className="font-medium text-foreground/80 whitespace-nowrap">
                      Author(s):
                    </span>
                    <span className="text-foreground text-left">{origin.name}</span>
                  </div>
                  {origin.year && (
                    <div className="grid grid-cols-[min-content_1fr] items-start gap-x-2">
                      <span className="font-medium text-foreground/80 whitespace-nowrap">
                        Year:
                      </span>
                      <span className="text-foreground text-left">
                        {typeof origin.year === 'number' ? `c. ${origin.year}` : origin.year}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lower Section: Complexity Analysis */}
        {complexity && (
          <div className="space-y-2 pt-4">
            <h2 className="text-lg font-semibold text-foreground mb-1">Complexity Analysis</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Aspect</TableHead>
                    <TableHead>Best</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Worst</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Time Complexity</TableCell>
                    <TableCell>{complexity.time.best}</TableCell>
                    <TableCell>{complexity.time.average}</TableCell>
                    <TableCell>{complexity.time.worst}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Space Complexity</TableCell>
                    <TableCell colSpan={3}>{complexity.space}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

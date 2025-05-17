'use client'

import React, { memo, useState, useEffect } from 'react'
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

const MemoizedAlgorithmInfoDisplay = memo(function AlgorithmInfoDisplay({
  selectedAlgorithm,
}: AlgorithmInfoDisplayProps): React.JSX.Element {
  const [randomQuote, setRandomQuote] = useState<string>(
    'Honoring the brilliant minds behind these fundamental sorting algorithms.'
  )

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
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Details</CardTitle>
          <CardDescription>{randomQuote}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an algorithm to see its details.</p>
        </CardContent>
      </Card>
    )
  }

  const { name, description, origin, complexity, img } = selectedAlgorithm
  const displayImgSrc = img && img.trim() !== '' ? img : '/unknow-person.png'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{randomQuote}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg font-semibold text-foreground mb-1">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
              {description}
            </p>

            {complexity && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground mb-1">Complexity Analysis</h3>
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
          </div>

          <div className="flex flex-col items-center md:items-start md:col-span-1 space-y-4">
            {displayImgSrc && (
              <div className="relative w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px] aspect-[3/4] rounded-lg overflow-hidden shadow-lg group">
                <Image
                  src={displayImgSrc}
                  alt={origin?.name ? `Photo of ${origin.name}` : `${name} author`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, 200px"
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
      </CardContent>
    </Card>
  )
})

export { MemoizedAlgorithmInfoDisplay as AlgorithmInfoDisplay }

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
    <Card className="w-full h-full flex flex-col ">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{randomQuote}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-4 flex-grow overflow-y-auto pt-0 text-sm">
        {/* Left Column: Description & Complexity (md:col-span-2) */}
        <div className="md:col-span-3 space-y-4 ">
          <div>
            <h3 className="text-md font-semibold text-foreground">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-xs whitespace-pre-line">
              {description}
            </p>
          </div>

          {complexity && (
            <div>
              <h2 className="text-md font-semibold mb-2 text-foreground ">Complexity Analysis</h2>
              <Table className="text-xs">
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
          )}
        </div>

        {/* Right Column: Image and Origin (md:col-span-1) */}
        <div className="md:col-span-2 space-y-4">
          {displayImgSrc && (
            <div className="relative h-48 aspect-square md:h-60 md:w-full md:aspect-none rounded-md overflow-hidden shadow-sm">
              <Image
                src={displayImgSrc}
                alt={`${name} visualization`}
                fill={true}
                className="rounded-md object-cover"
                priority
              />
            </div>
          )}
          {origin && (
            <div>
              <h3 className="text-md font-semibold mb-2 text-foreground">Information</h3>
              <div className="space-y-1 text-xs">
                <div className="flex">
                  <h2 className="font-medium text-foreground/80 w-20 shrink-0">Authors: </h2>
                  <h2>{origin.name}</h2>
                </div>
                {origin.year && (
                  <div className="flex">
                    <h2 className="font-medium text-foreground/80 w-20 shrink-0">Year:</h2>
                    <h2>{typeof origin.year === 'number' ? `c. ${origin.year}` : origin.year}</h2>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

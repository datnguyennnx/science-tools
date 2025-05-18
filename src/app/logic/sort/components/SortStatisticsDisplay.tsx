import { memo } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortStats } from '../engine/types'

interface SortStatisticsDisplayProps {
  stats: Readonly<SortStats>
}

const formatNum = (n?: number) => (n != null ? n.toLocaleString() : '-')
const formatPercent = (p?: number) => (p != null ? `${p}%` : '-')

const descriptions: Record<string, string> = {
  'Num Elements': 'Total number of elements in the array being sorted.',
  'Unique Elements': 'Number of unique values in the array being sorted.',
  Comparisons: 'Total number of times two elements were compared during the sort.',
  Swaps: 'Total number of times two elements were exchanged in the main array.',
  Reversals: 'Total number of times a segment of the array was reversed (e.g., in Pancake Sort).',
  'Main Array Writes':
    'Total number of write operations performed on the primary array being sorted.',
  'Aux Array Writes':
    'Total number of write operations performed on any auxiliary arrays used by the algorithm (e.g., in Merge Sort, Bucket Sort).',
  'External Array Items':
    'Number of items managed in external storage (not applicable for most in-memory algorithms).',
  'Percent Sorted':
    'An estimation of how sorted the array is at a given point (requires a specific metric like inversions; not universally implemented).',
  Segments:
    'Number of distinct sorted or unsorted segments identified or processed by the algorithm (e.g., runs in Tim Sort; not universally implemented).',
}

const MemoizedSortStatisticsDisplay = memo(function SortStatisticsDisplay({
  stats,
}: SortStatisticsDisplayProps) {
  const combinedMetrics = [
    {
      label: 'Num Elements',
      value: formatNum(stats.numElements),
      description: descriptions['Num Elements'],
    },
    {
      label: 'Unique Elements',
      value: formatNum(stats.numUniqueElements),
      description: descriptions['Unique Elements'],
    },
    {
      label: 'Comparisons',
      value: formatNum(stats.comparisons),
      description: descriptions.Comparisons,
    },
    {
      label: 'Swaps',
      value: formatNum(stats.swaps),
      description: descriptions.Swaps,
    },
    {
      label: 'Main Array Writes',
      value: formatNum(stats.mainArrayWrites),
      description: descriptions['Main Array Writes'],
    },
    {
      label: 'Aux Array Writes',
      value: formatNum(stats.auxiliaryArrayWrites),
      description: descriptions['Aux Array Writes'],
    },
    {
      label: 'Reversals',
      value: formatNum(stats.reversals),
      description: descriptions.Reversals,
    },
    {
      label: 'External Array Items',
      value: formatNum(stats.externalArrayItems),
      description: descriptions['External Array Items'],
    },
    {
      label: 'Percent Sorted',
      value: formatPercent(stats.percentSorted),
      description: descriptions['Percent Sorted'],
    },
    {
      label: 'Segments',
      value: formatNum(stats.segments),
      description: descriptions.Segments,
    },
  ]

  const validCombinedMetrics = combinedMetrics.filter(metric => metric.value !== '-')

  if (validCombinedMetrics.length === 0) {
    return (
      <section className="p-4 text-sm text-muted-foreground">
        No statistics available for this algorithm.
      </section>
    )
  }

  return (
    <section>
      {validCombinedMetrics.length > 0 && (
        <>
          <h3 className="font-medium">Algorithm Performance</h3>
          <Table>
            <TableHeader>
              <TableRow>
                {validCombinedMetrics.map(metric => (
                  <TableHead key={metric.label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{metric.label}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {validCombinedMetrics.map(metric => (
                  <TableCell key={metric.label}>{metric.value}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </>
      )}
    </section>
  )
})

export { MemoizedSortStatisticsDisplay as SortStatisticsDisplay }

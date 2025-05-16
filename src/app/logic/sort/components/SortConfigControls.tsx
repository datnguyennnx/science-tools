import React, { useOptimistic, startTransition } from 'react'
import type {
  SortAlgorithm,
  TimeComplexityCategory,
  SpaceComplexityCategory,
} from '..//engine/algorithmRegistry'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ALL_CATEGORIES_VALUE = 'all'

interface SortConfigControlsProps {
  arraySize: number
  setArraySize: (value: number) => void
  MIN_ARRAY_SIZE: number
  MAX_ARRAY_SIZE: number
  speed: number
  setSpeed: (value: number) => void
  MIN_SPEED: number
  MAX_SPEED: number
  selectedAlgorithmId: string
  setSelectedAlgorithmId: (id: string) => void
  algorithms: ReadonlyArray<SortAlgorithm>
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void
  timeCategories: typeof TimeComplexityCategory
  selectedTimeCategory: string
  handleTimeCategoryChange: (category: string) => void
  spaceCategories: typeof SpaceComplexityCategory
  selectedSpaceCategory: string
  handleSpaceCategoryChange: (category: string) => void
}

export function SortConfigControls({
  arraySize,
  setArraySize,
  MIN_ARRAY_SIZE,
  MAX_ARRAY_SIZE,
  speed,
  setSpeed,
  MIN_SPEED,
  MAX_SPEED,
  selectedAlgorithmId,
  setSelectedAlgorithmId,
  algorithms,
  sortDirection,
  setSortDirection,
  timeCategories,
  selectedTimeCategory,
  handleTimeCategoryChange,
  spaceCategories,
  selectedSpaceCategory,
  handleSpaceCategoryChange,
}: SortConfigControlsProps): React.JSX.Element {
  // Optimistic state for arraySize
  const [optimisticArraySize, addOptimisticArraySize] = useOptimistic(
    arraySize,
    (currentSize, newSize: number) => newSize
  )

  const handleArraySizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      const clampedValue = Math.max(MIN_ARRAY_SIZE, Math.min(value, MAX_ARRAY_SIZE))
      startTransition(() => {
        addOptimisticArraySize(clampedValue)
        setArraySize(clampedValue)
      })
    }
    // If parseInt results in NaN (e.g., user types non-numeric or clears input),
    // setArraySize is not called. The input field, being controlled by `arraySize` prop,
    // will revert to its last valid state.
  }

  const handleSpeedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      const clampedValue = Math.max(MIN_SPEED, Math.min(value, MAX_SPEED))
      setSpeed(clampedValue)
    }
    // If parseInt results in NaN, setSpeed is not called.
    // The input field will revert to its last valid state.
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
      {/* Algorithm */}
      <div className="space-y-2">
        <Label htmlFor="algorithm-select-visualizer" className="font-bold">
          Algorithm
        </Label>
        <Select
          value={selectedAlgorithmId}
          onValueChange={setSelectedAlgorithmId}
          name="algorithm-select-visualizer"
        >
          <SelectTrigger className="space-x-2">
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="font-bold">Distribution & Special Purpose</SelectLabel>
              {algorithms
                .filter(algo => algo.hasAdvancedAuxiliaryVisuals)
                .map(algo => (
                  <SelectItem key={algo.id} value={algo.id}>
                    {algo.name}
                  </SelectItem>
                ))}
            </SelectGroup>

            <SelectGroup>
              <SelectLabel className="font-bold">Comparison-Based & Others</SelectLabel>
              {algorithms
                .filter(algo => !algo.hasAdvancedAuxiliaryVisuals)
                .map(algo => (
                  <SelectItem key={algo.id} value={algo.id}>
                    {algo.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label htmlFor="arraySizeInputVisualizer" className="font-bold">
          Size
        </Label>
        <Input
          id="arraySizeInputVisualizer"
          type="number"
          min={MIN_ARRAY_SIZE}
          max={MAX_ARRAY_SIZE}
          value={optimisticArraySize}
          onChange={handleArraySizeInputChange}
          className="w-full "
        />
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <Label htmlFor="speedInputVisualizer" className="font-bold">
          Speed
        </Label>
        <Input
          id="speedInputVisualizer"
          type="number"
          min={MIN_SPEED}
          max={MAX_SPEED}
          value={speed}
          onChange={handleSpeedInputChange}
          className="w-full "
        />
      </div>

      {/* Direction */}
      <div className="space-y-2">
        <Label htmlFor="sort-direction-select-visualizer" className="font-bold">
          Direction
        </Label>
        <Select
          value={sortDirection}
          onValueChange={setSortDirection}
          name="sort-direction-select-visualizer"
        >
          <SelectTrigger className="w-full space-x-2 ">
            <SelectValue placeholder="Select direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Filter */}
      <div className="space-y-2">
        <Label htmlFor="time-complexity-filter" className="font-bold">
          Time Filter
        </Label>
        <Select
          value={selectedTimeCategory}
          onValueChange={handleTimeCategoryChange}
          name="time-complexity-filter"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Time Complexity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>All Time Complexities</SelectItem>
            {Object.entries(timeCategories).map(([key, label]) => (
              <SelectItem key={`${key}-${label}`} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Space Filter */}
      <div className="space-y-2">
        <Label htmlFor="space-complexity-filter" className="font-bold">
          Space Filter
        </Label>
        <Select
          value={selectedSpaceCategory}
          onValueChange={handleSpaceCategoryChange}
          name="space-complexity-filter"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Space Complexity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>All Space Complexities</SelectItem>
            {Object.entries(spaceCategories).map(([key, label]) => (
              <SelectItem key={`${key}-${label}`} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

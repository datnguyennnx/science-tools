import { memo, useOptimistic, startTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  algorithms: ReadonlyArray<{ id: string; name: string }>
  sortDirection: 'asc' | 'desc'
  setSortDirection: (direction: 'asc' | 'desc') => void
}

const MemoizedSortConfigControls = memo(function SortConfigControls({
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
}: SortConfigControlsProps): React.JSX.Element {
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
  }

  const handleSpeedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      const clampedValue = Math.max(MIN_SPEED, Math.min(value, MAX_SPEED))
      setSpeed(clampedValue)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
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
            {algorithms.map(algo => (
              <SelectItem key={algo.id} value={algo.id}>
                {algo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </div>
  )
})

export { MemoizedSortConfigControls as SortConfigControls }

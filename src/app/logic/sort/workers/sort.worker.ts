import type { SortStep, SortResult, SortStats } from '../engine/types'
import type { SortGenerator } from '../engine/types'
import { SORT_ALGORITHMS } from '../engine/algorithmRegistry'

// Map algorithm IDs to their generator functions dynamically
const generators: Record<string, SortGenerator> = Object.fromEntries(
  SORT_ALGORITHMS.map(algo => [algo.id, algo.generator])
)

let currentSortGenerator: ReturnType<SortGenerator> | null = null
let isRunning = false
let shouldPause = false
let isStopping = false // Flag to indicate a stop request is in progress
let currentDelay = 250 // Default delay if not set

const calculateDelay = (speed: number): number => {
  const MIN_UI_SPEED = 1
  const MAX_UI_SPEED = 10
  const MIN_DELAY_MS = 50 // Fastest
  const MAX_DELAY_MS = 500 // Slowest

  if (speed <= MIN_UI_SPEED) return MAX_DELAY_MS
  if (speed >= MAX_UI_SPEED) return MIN_DELAY_MS

  // Linear interpolation
  const delay =
    MAX_DELAY_MS -
    ((speed - MIN_UI_SPEED) * (MAX_DELAY_MS - MIN_DELAY_MS)) / (MAX_UI_SPEED - MIN_UI_SPEED)
  return Math.max(MIN_DELAY_MS, Math.min(MAX_DELAY_MS, delay))
}

self.onmessage = async (event: MessageEvent) => {
  // Explicitly cast event.data, rename array to initialArray for clarity in this scope
  const {
    type,
    algorithmId,
    array: initialArray,
    direction,
    speed,
  } = event.data as {
    type: 'start' | 'pause' | 'resume' | 'stop' | 'setError'
    algorithmId?: string
    array?: number[] // This is the initialArray for a 'start' command
    direction?: 'asc' | 'desc'
    speed?: number
  }

  if (type === 'start') {
    if (isRunning) {
      self.postMessage({ type: 'error', message: 'Sort is already running.' })
      return
    }
    if (!algorithmId || !initialArray || !direction) {
      if (!algorithmId)
        self.postMessage({ type: 'error', message: 'Algorithm ID missing for start.' })
      if (!initialArray) self.postMessage({ type: 'error', message: 'Array missing for start.' })
      if (!direction) self.postMessage({ type: 'error', message: 'Direction missing for start.' })
      return
    }

    const generatorFn = generators[algorithmId]
    if (!generatorFn) {
      self.postMessage({ type: 'error', message: `Algorithm "${algorithmId}" not found.` })
      return
    }

    currentSortGenerator = generatorFn(initialArray, direction)
    isRunning = true
    shouldPause = false
    isStopping = false // Reset for new sort
    if (speed !== undefined) {
      currentDelay = calculateDelay(speed)
    }
    self.postMessage({ type: 'started' }) // Notify main thread that processing has started

    try {
      let result = await currentSortGenerator.next()
      while (!result.done) {
        if (isStopping) break

        if (shouldPause) {
          self.postMessage({ type: 'paused' })
          await new Promise<void>(resolve => {
            const checkResumeOrStop = () => {
              if (isStopping || !shouldPause) {
                resolve()
              } else {
                setTimeout(checkResumeOrStop, 50)
              }
            }
            checkResumeOrStop()
          })
          if (isStopping) break
          self.postMessage({ type: 'resumed' })
        }

        self.postMessage({
          type: 'step',
          step: result.value as SortStep, // Assuming result.value is always SortStep when not done
        })
        if (currentDelay > 0 && !isStopping) {
          await new Promise(resolve => setTimeout(resolve, currentDelay))
        }
        if (isStopping) break
        result = await currentSortGenerator.next() // Process next step
      }

      if (!isStopping && result.done) {
        self.postMessage({
          type: 'complete',
          result: result.value as SortResult, // Assuming result.value is SortResult when done
        })
      }
    } catch (e: unknown) {
      if (!isStopping) {
        let errorMessage = 'Error in sort generator'
        if (e instanceof Error) {
          errorMessage = e.message
        }
        self.postMessage({ type: 'error', message: errorMessage })
      }
    } finally {
      if (currentSortGenerator && typeof currentSortGenerator.return === 'function' && isStopping) {
        try {
          const arrForReturn = initialArray || []
          const minimalStats: SortStats = {
            algorithmName: algorithmId,
            numElements: arrForReturn.length,
            comparisons: 0,
            swaps: 0,
            mainArrayWrites: 0,
            auxiliaryArrayWrites: 0,
            // Assuming SortStats might have these from typical structures, otherwise they might not be needed
            // If SortStats is simpler, these can be removed if they cause issues.
            // visualTime: '0s',
            // sortTime: '0s'
          }
          const minimalResult: SortResult = {
            finalArray: arrForReturn,
            stats: minimalStats,
            // finalStep: undefined, // If SortResult can have an optional finalStep
          }
          await currentSortGenerator.return(minimalResult)
        } catch {
          /* Prefixed with underscore, ignore errors during forced return */
        }
      }
      currentSortGenerator = null
      isRunning = false
      shouldPause = false
      isStopping = false // Ensure isStopping is reset
      self.postMessage({ type: 'stopped_ack' }) // Signal that cleanup is complete
    }
  } else if (type === 'pause') {
    if (isRunning && !isStopping) {
      shouldPause = true
    }
  } else if (type === 'resume') {
    if (isRunning && shouldPause && !isStopping) {
      shouldPause = false
    }
  } else if (type === 'stop') {
    // Check if we are in a state where stopping makes sense
    if (!isRunning && !currentSortGenerator && !isStopping) {
      self.postMessage({ type: 'stopped' }) // Already stopped or idle
      return
    }
    isStopping = true // Signal the loop to stop and clean up
    shouldPause = false // If paused, unpause it so it can hit the isStopping check
    // The main loop's finally block will now handle cleanup.
    // This handler ensures the 'stopped' message is sent back.
    self.postMessage({ type: 'stopped' })
  } else if (type === 'setError') {
    // Placeholder for potential future use where main thread informs worker of an error.
    // console.error("Worker received setError message:", event.data.error);
  }
}

// Optional: Add an error handler for unhandled rejections or errors within the worker
self.onerror = event => {
  let errorMessage = 'Unhandled worker error'
  if (event instanceof ErrorEvent) {
    errorMessage = `Unhandled worker error: ${event.message}`
  } else if (typeof event === 'string') {
    errorMessage = `Unhandled worker error: ${event}`
  }
  // Avoid sending error if we are in the process of stopping, as it might be an expected consequence
  if (!isStopping) {
    self.postMessage({ type: 'error', message: errorMessage })
  }
}

self.onunhandledrejection = event => {
  // Avoid sending error if we are in the process of stopping
  if (!isStopping) {
    self.postMessage({
      type: 'error',
      message: `Unhandled promise rejection in worker: ${event.reason}`,
    })
  }
}

import type { SortStep, SortResult, SortStats } from '../engine/types'
import type { SortGenerator } from '../engine/types'
import { getSortGenerator } from '../engine/algorithmGenerators'

let currentSortGenerator: ReturnType<SortGenerator> | null = null
let isRunning = false
let shouldPause = false
let isStopping = false
let stepModeActive = false
let currentDelay = 250

const calculateDelay = (speed: number): number => {
  const MIN_UI_SPEED = 1
  const MAX_UI_SPEED = 10
  const MIN_DELAY_MS = 50
  const MAX_DELAY_MS = 500

  if (speed <= MIN_UI_SPEED) return MAX_DELAY_MS
  if (speed >= MAX_UI_SPEED) return MIN_DELAY_MS

  const delay =
    MAX_DELAY_MS -
    ((speed - MIN_UI_SPEED) * (MAX_DELAY_MS - MIN_DELAY_MS)) / (MAX_UI_SPEED - MIN_UI_SPEED)
  return Math.max(MIN_DELAY_MS, Math.min(MAX_DELAY_MS, delay))
}

// Promise resolver for the main pause loop, allows external trigger for stepping
let resolvePausePromise: (() => void) | null = null

self.onmessage = async (event: MessageEvent) => {
  const {
    type,
    algorithmId,
    array: initialArray,
    direction,
    speed,
    initialStepMode, // For 'start' command
  } = event.data as {
    type: 'start' | 'pause' | 'resume' | 'stop' | 'setError' | 'request_one_step'
    algorithmId?: string
    array?: number[]
    direction?: 'asc' | 'desc'
    speed?: number
    initialStepMode?: boolean
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

    let generatorFn: SortGenerator | undefined
    try {
      generatorFn = await getSortGenerator(algorithmId)
    } catch (e) {
      console.error(`Worker: Failed to load algorithm module for "${algorithmId}":`, e)
      let errorMessage = `Failed to load algorithm "${algorithmId}".`
      if (e instanceof Error) {
        errorMessage = `Failed to load algorithm "${algorithmId}": ${e.message}`
      }
      self.postMessage({ type: 'error', message: errorMessage })
      return
    }

    if (!generatorFn) {
      self.postMessage({
        type: 'error',
        message: `Algorithm "${algorithmId}" not found or failed to load.`,
      })
      return
    }

    currentSortGenerator = generatorFn(initialArray, direction)
    isRunning = true
    shouldPause = false // Initialize to false
    isStopping = false
    stepModeActive = initialStepMode || false

    if (speed !== undefined) currentDelay = calculateDelay(speed)
    self.postMessage({ type: 'started' })

    if (stepModeActive) {
      shouldPause = true // For step mode, intend to pause after the first step.
    }

    // Main sort loop
    try {
      let result = await currentSortGenerator.next()
      while (!result.done) {
        if (isStopping) break

        self.postMessage({ type: 'step', step: result.value as SortStep })

        if (shouldPause) {
          self.postMessage({ type: 'paused' })
          await new Promise<void>(resolve => {
            resolvePausePromise = resolve // Expose resolver
          })
          resolvePausePromise = null // Clear resolver after use
          if (isStopping) break
          // If execution continues past pause, it's 'resumed' implicitly or for a next step
          if (!isStopping) self.postMessage({ type: 'resumed' })
        }

        // After a step in stepMode, ensure we are set to pause for the next cycle, unless already stopping.
        if (stepModeActive && !isStopping) {
          shouldPause = true
        }

        // Delay for continuous mode (not in step mode and not about to pause)
        if (!stepModeActive && !shouldPause && currentDelay > 0 && !isStopping) {
          await new Promise(resolve => setTimeout(resolve, currentDelay))
        }

        if (isStopping) break
        result = await currentSortGenerator.next()
      }

      if (!isStopping && result.done) {
        self.postMessage({ type: 'complete', result: result.value as SortResult })
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
      isStopping = false // Ensure fully stopped here
      stepModeActive = false // Reset step mode on any exit
      self.postMessage({ type: 'stopped_ack' })
    }
  } else if (type === 'pause') {
    if (isRunning && !isStopping) {
      shouldPause = true
      // Pausing does not necessarily turn off stepModeActive.
      // If user pauses during step mode, then hits step, it should still step.
    }
  } else if (type === 'resume') {
    // Resume to continuous run
    if (isRunning && shouldPause && !isStopping) {
      stepModeActive = false // Explicitly turn off step mode for continuous run
      shouldPause = false
      if (resolvePausePromise) resolvePausePromise() // Unblock the loop
    }
  } else if (type === 'request_one_step') {
    if (isRunning && !isStopping) {
      stepModeActive = true // Ensure step mode is active
      shouldPause = false // Allow one step to proceed
      if (resolvePausePromise) resolvePausePromise() // Unblock the loop for one step
    } else if (!isRunning && !isStopping) {
      // self.postMessage({ type: 'error', message: 'Sort not started. Cannot step.' }); // Cleaned, handled by UI logic potentially
    }
  } else if (type === 'stop') {
    if (!isRunning && !currentSortGenerator && !isStopping) {
      self.postMessage({ type: 'stopped' })
      return
    }
    isStopping = true
    shouldPause = false // Allow loop to exit cleanly
    stepModeActive = false // Turn off step mode
    if (resolvePausePromise) resolvePausePromise() // Unblock loop if paused
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

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { SortStep, SortStats } from '../types' // Re-add SortStats

export interface UseSortWorkerReturn {
  currentStep: SortStep | null
  isRunning: boolean
  isPaused: boolean
  isStopping: boolean
  startSort: (
    algorithmId: string,
    array: number[],
    direction: 'asc' | 'desc',
    speed: number
  ) => void
  pauseSort: () => void
  resumeSort: () => void
  stopSort: () => void // Added for explicit stopping/resetting from UI
  cleanupWorker: () => void
  error: string | null
}

export function useSortWorker(): UseSortWorkerReturn {
  const [currentStep, setCurrentStep] = useState<SortStep | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)

  const initializeWorker = useCallback(() => {
    // Ensure this only runs in the client environment
    if (typeof window === 'undefined') return

    if (workerRef.current) {
      // Terminate existing worker before creating a new one if re-initializing
      workerRef.current.terminate()
      workerRef.current = null
    }

    // Make sure the path to the worker is correct based on your project structure
    // This URL should be relative to the public directory or handled by your bundler.
    // For Next.js, placing the worker in `public/workers/sort.worker.js` might be one approach,
    // or using a bundler-specific setup.
    // The `new URL('../../workers/sort.worker.ts', import.meta.url)` pattern is for specific bundler configs.
    // Let's assume a direct path for now, or adjust if using import.meta.url with a bundler that supports it.

    // IMPORTANT: The worker path needs to resolve correctly.
    // If sort.worker.ts is compiled to sort.worker.js in the same directory structure under /dist or similar,
    // the path might be relative from the consuming page, or a fixed public path.
    // For development with Next.js, the `new URL` approach with `import.meta.url` is often best.
    try {
      // Assuming sort.worker.ts is in src/app/logic/sort/workers/sort.worker.ts
      // And the hook is in src/app/logic/sort/engine/hooks/useSortWorker.ts
      // The relative path from hook to worker is `../../workers/sort.worker.ts`
      workerRef.current = new Worker(new URL('../../workers/sort.worker.ts', import.meta.url), {
        type: 'module',
      })

      workerRef.current.onmessage = (event: MessageEvent) => {
        const { type, step, result, message } = event.data as {
          type: string
          step?: SortStep
          result?: { finalArray: number[]; stats: SortStats; finalStep?: SortStep }
          message?: string
        }
        setError(null) // Clear previous errors on new message

        if (type === 'step') {
          setCurrentStep(step as SortStep)
        } else if (type === 'complete') {
          if (result && result.finalArray) {
            setCurrentStep({
              array: result.finalArray,
              sortedIndices: result.finalArray.map((_: unknown, i: number) => i),
              message: 'Sort Complete (from worker)',
              currentStats: result.stats,
            } as SortStep)
          }
          setIsRunning(false)
          setIsPaused(false)
          setIsStopping(false)
        } else if (type === 'paused') {
          setIsPaused(true)
        } else if (type === 'stopped_ack') {
          setIsStopping(false)
          setIsRunning(false)
          setIsPaused(false)
        } else if (type === 'error' || type === 'worker_error') {
          console.error('Error from sort worker:', message)
          setError(message || 'An unknown error occurred in the worker.')
          setIsRunning(false)
          setIsPaused(false)
          setIsStopping(false)
        }
      }

      workerRef.current.onerror = err => {
        console.error('Unhandled worker error:', err)
        setError(`Worker failed: ${err.message}`)
        setIsRunning(false)
        setIsPaused(false)
        setIsStopping(false)
      }
    } catch (e) {
      console.error('Failed to initialize worker:', e)
      setError(
        'Failed to load the sort worker. Ensure the path is correct and the worker file exists.'
      )
    }
  }, [])

  useEffect(() => {
    // Initialize worker on mount if in client environment
    if (typeof window !== 'undefined') {
      initializeWorker()
    }
    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [initializeWorker])

  const startSort = useCallback(
    (algorithmId: string, array: number[], direction: 'asc' | 'desc', speed: number) => {
      if (isRunning || isStopping) {
        const errMessage = `Sort cannot start: ${isRunning ? 'already running' : 'currently stopping'}.`
        console.warn(errMessage)
        setError(errMessage)
        return
      }

      if (!workerRef.current) {
        initializeWorker()
        if (!workerRef.current) {
          setError('Worker not available. Cannot start sort.')
          console.error('Worker not available when trying to start sort.')
          return
        }
      }

      setCurrentStep(null)
      setError(null)
      setIsRunning(true)
      setIsPaused(false)
      workerRef.current.postMessage({
        type: 'start',
        algorithmId,
        array,
        direction,
        speed,
      })
    },
    [isRunning, isStopping, initializeWorker]
  )

  const pauseSort = useCallback(() => {
    if (!workerRef.current || !isRunning || isPaused) return
    workerRef.current.postMessage({ type: 'pause' })
    setIsPaused(true) // Optimistically set paused state
  }, [isRunning, isPaused])

  const resumeSort = useCallback(() => {
    if (!workerRef.current || !isRunning || !isPaused) return
    workerRef.current.postMessage({ type: 'resume' })
    setIsPaused(false) // Optimistically set running state
  }, [isRunning, isPaused])

  const stopSort = useCallback(() => {
    if (workerRef.current) {
      if (!isStopping && (isRunning || isPaused)) {
        setIsStopping(true)
      }
      workerRef.current.postMessage({ type: 'stop' })
    }
    setIsRunning(false)
    setIsPaused(false)
  }, [isRunning, isPaused, isStopping])

  const cleanupWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
    setIsRunning(false)
    setIsPaused(false)
    setIsStopping(false)
    setCurrentStep(null)
    setError(null)
  }, [])

  return {
    currentStep,
    isRunning,
    isPaused,
    isStopping,
    startSort,
    pauseSort,
    resumeSort,
    stopSort,
    cleanupWorker,
    error,
  }
}

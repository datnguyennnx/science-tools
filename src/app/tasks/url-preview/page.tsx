'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UrlInput } from './components/url-input'
import { PreviewGrid } from './components/preview-grid'
import { ErrorMessage } from './components/error-message'
import type { SeoData } from './engine/types'
import { crawlUrlAction } from './actions'
import './styles.css'

export default function UrlPreviewPage() {
  const [seoData, setSeoData] = useState<SeoData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitial, setIsInitial] = useState(true)

  const handleUrlSubmit = async (submittedUrl: string) => {
    if (!submittedUrl) return

    setIsInitial(false)
    setIsLoading(true)
    setError(null)
    setSeoData([])

    try {
      const data = await crawlUrlAction(submittedUrl)
      if (data[0]?.domain === 'error') {
        setError(data[0].description || 'An unknown error occurred.')
        setSeoData([])
      } else {
        setSeoData(data)
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'A server error occurred.'
      setError(errorMessage)
      setSeoData([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setSeoData([])
    setError(null)
    setIsInitial(true)
  }

  return (
    <motion.div
      layout
      className={`w-full min-h-screen bg-background text-foreground transition-all duration-500 ${
        isInitial ? 'flex items-center justify-center' : 'pt-8 md:pt-12'
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-[80%] mx-auto p-4 transition-all duration-500">
        <motion.div layout="position" className="w-full max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {isInitial && (
              <motion.div
                className="text-center space-y-2"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <h1 className="text-4xl font-bold tracking-tight">URL Previewer</h1>
                <p className="text-muted-foreground">
                  See how your links will appear on different social platforms.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} onClear={handleClear} />
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ErrorMessage message={error} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {seoData.length > 0 && !error && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              exit={{ opacity: 0, y: 20 }}
            >
              <PreviewGrid seoData={seoData} isLoading={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

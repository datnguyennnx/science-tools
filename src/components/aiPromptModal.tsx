'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from '@/components/shadcn-io/ai/prompt-input'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

import { AIProvider } from '@/lib/ai/types'
import { useAIStore } from '@/stores/ai.store'

interface AIPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (prompt: string, model: string, provider?: AIProvider) => void
}

// Animation variants for smooth transitions
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
}

const formItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
  },
}

export function AIPromptModal({ isOpen, onClose, onGenerate }: AIPromptModalProps) {
  // Use global AI store
  const {
    modelOptions,
    loading,
    error,
    selectedModel,
    setSelectedModel,
    clearError,
    configuredProviders,
  } = useAIStore()

  const [prompt, setPrompt] = useState('')

  // Clear error when modal opens
  useEffect(() => {
    if (isOpen && error) {
      clearError()
    }
  }, [isOpen, error, clearError])

  // Check if user has configured API keys
  const hasConfiguredProviders = configuredProviders.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      toast('Please enter a description for the JSON you want to generate')
      return
    }

    // Extract provider and model from selected model in store
    const selectedModelOption = modelOptions.find(option => option.value === selectedModel)
    if (!selectedModelOption) {
      toast('Please select a model')
      return
    }

    onGenerate(prompt.trim(), selectedModelOption.model, selectedModelOption.provider)
    setPrompt('')
    onClose()
  }

  const handleClose = () => {
    setPrompt('')
    onClose()
  }

  // ESC key detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPrompt('')
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {/* Background blur overlay */}
          <motion.div
            className="absolute inset-0 bg-background/30 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-3xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: 0.2,
              ease: 'easeOut',
              staggerChildren: 0.05,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!hasConfiguredProviders ? (
              <div className="p-6 bg-card border rounded-lg shadow-lg">
                <div className="text-center space-y-4">
                  <div className="text-2xl">🔑</div>
                  <h3 className="text-lg font-semibold">API Keys Required</h3>
                  <p className="text-muted-foreground">
                    You need to configure at least one AI provider API key to use this feature.
                    Please set up your API keys in the settings.
                  </p>
                  <Button onClick={handleClose} className="mt-4">
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <PromptInput onSubmit={handleSubmit} className="p-2">
                <motion.div
                  variants={formItemVariants}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <PromptInputTextarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe the JSON you want to generate..."
                  />
                </motion.div>
                <PromptInputToolbar>
                  <PromptInputTools>
                    {/* Combined Provider/Model Selection */}
                    <motion.div
                      variants={formItemVariants}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <PromptInputModelSelect
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                        disabled={loading || modelOptions.length === 0}
                      >
                        <PromptInputModelSelectTrigger>
                          <PromptInputModelSelectValue>
                            {selectedModel &&
                              (() => {
                                const selectedModelOption = modelOptions.find(
                                  option => option.value === selectedModel
                                )
                                if (selectedModelOption) {
                                  const IconComponent = selectedModelOption.icon
                                  return (
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="h-4 w-4" />
                                      <span>{selectedModelOption.label}</span>
                                    </div>
                                  )
                                }
                                return null
                              })()}
                          </PromptInputModelSelectValue>
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {modelOptions.map(option => {
                            const IconComponent = option.icon
                            return (
                              <PromptInputModelSelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <span>{option.label}</span>
                                </div>
                              </PromptInputModelSelectItem>
                            )
                          })}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    </motion.div>
                  </PromptInputTools>
                  <motion.div
                    variants={formItemVariants}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <PromptInputSubmit disabled={!prompt.trim()}></PromptInputSubmit>
                  </motion.div>
                </PromptInputToolbar>
              </PromptInput>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AIPromptModal

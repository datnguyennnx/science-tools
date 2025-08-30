import mermaid from 'mermaid'
import type { MermaidConfig } from './index'

export const defaultMermaidConfig: MermaidConfig = {
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'var(--font-sans)',
}

let isMermaidInitialized = false
let currentConfig: MermaidConfig = defaultMermaidConfig

export const initializeMermaid = (config: Partial<MermaidConfig> = {}) => {
  const mergedConfig = { ...defaultMermaidConfig, ...config }
  if (isMermaidInitialized && JSON.stringify(currentConfig) === JSON.stringify(mergedConfig)) return

  try {
    mermaid.initialize({
      startOnLoad: true,
      theme: mergedConfig.theme,
      securityLevel: mergedConfig.securityLevel,
      fontFamily: mergedConfig.fontFamily,
    })
    isMermaidInitialized = true
    currentConfig = mergedConfig
  } catch (error) {
    console.error('Failed to initialize Mermaid:', error)
    isMermaidInitialized = false
  }
}

export const renderMermaidDiagrams = async (selector = '.mermaid') => {
  if (!isMermaidInitialized) {
    console.warn('Mermaid not initialized, skipping render')
    return
  }

  try {
    const mermaidElements = document.querySelectorAll(selector)
    if (mermaidElements.length === 0) return

    await mermaid.run({ querySelector: selector })
  } catch (error) {
    console.error('Failed to render Mermaid diagrams:', error)
    throw error
  }
}

export const forceMermaidRender = async () => {
  try {
    await mermaid.run()
  } catch (error) {
    console.error('Failed to force render Mermaid diagrams:', error)
  }
}

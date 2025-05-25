'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MermaidFullscreenProps {
  diagramId: string
}

export function MermaidFullscreen({ diagramId }: MermaidFullscreenProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1.5)
  const fullscreenDiagramRef = useRef<HTMLDivElement>(null)

  // Memoize the diagram ID to prevent useEffect dependency issues
  const memoizedDiagramId = useRef(diagramId).current

  // Function to clone the mermaid diagram for fullscreen view
  const cloneDiagram = useCallback(() => {
    if (!fullscreenDiagramRef.current) return

    // Find the original diagram by ID
    const originalDiagram = document.getElementById(memoizedDiagramId)
    if (!originalDiagram) return

    // Clone the diagram content
    const clonedContent = originalDiagram.cloneNode(true) as HTMLElement

    // Clear previous content and append the clone
    fullscreenDiagramRef.current.innerHTML = ''
    fullscreenDiagramRef.current.appendChild(clonedContent)

    // Find SVG in the cloned content and adjust its size
    const svgElement = fullscreenDiagramRef.current.querySelector('svg')
    if (svgElement) {
      // Remove any fixed width/height to allow responsive sizing
      svgElement.removeAttribute('width')
      svgElement.removeAttribute('height')
      svgElement.style.width = '100%'
      svgElement.style.maxWidth = '100%'
      svgElement.style.height = 'auto'
      svgElement.style.maxHeight = '100%'
      svgElement.style.display = 'block'
      svgElement.style.margin = '0 auto'
    }
  }, [memoizedDiagramId])

  // Apply zoom level to the fullscreen diagram
  useEffect(() => {
    if (!fullscreenDiagramRef.current || !isOpen) return

    fullscreenDiagramRef.current.style.transform = `scale(${zoomLevel})`
    fullscreenDiagramRef.current.style.transformOrigin = 'center center'

    // Make sure the SVG inside the fullscreen diagram fits properly
    const svgElement = fullscreenDiagramRef.current.querySelector('svg')
    if (svgElement) {
      svgElement.style.maxWidth = '100%'
      svgElement.style.height = 'auto'
      svgElement.style.display = 'block'
      svgElement.style.margin = '0 auto'
    }
  }, [zoomLevel, isOpen])

  // Clone the diagram when opening the dialog
  useEffect(() => {
    if (isOpen) {
      // Reset zoom level when opening
      setZoomLevel(1)

      // Add overflow hidden to body to prevent scrolling
      document.body.style.overflow = 'hidden'

      // Small delay to ensure the fullscreen view is rendered
      const timer = setTimeout(() => {
        cloneDiagram()
      }, 100)

      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, cloneDiagram])

  // Zoom in function
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.2, 5)) // Max zoom 3x
  }, [])

  // Zoom out function
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5)) // Min zoom 0.5x
  }, [])

  // Reset zoom function
  const handleResetZoom = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Handle closing the modal
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Handle background click
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 z-10 bg-background/80 hover:bg-background/90 rounded-md border p-1 h-8 w-8"
        onClick={() => setIsOpen(true)}
        aria-label="View diagram in fullscreen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleBackgroundClick}
        >
          <div className="relative bg-background rounded-lg shadow-lg max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh] p-6 animate-in zoom-in-95 duration-200">
            <div className="absolute top-4 right-4 flex gap-2 z-50">
              <Button variant="outline" onClick={handleResetZoom} aria-label="Reset zoom">
                {zoomLevel.toFixed(1)}x
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn} aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut} aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={handleClose} aria-label="Close fullscreen">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center w-full h-full overflow-auto p-4">
              <div
                ref={fullscreenDiagramRef}
                className="mermaid-fullscreen transition-transform duration-200 flex items-center justify-center"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

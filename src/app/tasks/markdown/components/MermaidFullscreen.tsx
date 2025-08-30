import React, { useState, useRef, useEffect } from 'react'
import { Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MermaidFullscreenProps {
  diagramId: string
}

export const MermaidFullscreen = React.forwardRef<HTMLDivElement, MermaidFullscreenProps>(
  ({ diagramId, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(1.5)
    const fullscreenDiagramRef = useRef<HTMLDivElement>(null)
    const cloneDiagramRef = useRef<(() => void) | null>(null)

    const cloneDiagram = () => {
      if (!fullscreenDiagramRef.current) return
      const originalDiagram = document.getElementById(diagramId)
      if (!originalDiagram) return

      const clonedContent = originalDiagram.cloneNode(true) as HTMLElement
      fullscreenDiagramRef.current.innerHTML = ''
      fullscreenDiagramRef.current.appendChild(clonedContent)

      const svgElement = fullscreenDiagramRef.current.querySelector('svg')
      if (svgElement) {
        svgElement.removeAttribute('width')
        svgElement.removeAttribute('height')
        svgElement.style.width = '100%'
        svgElement.style.maxWidth = '100%'
        svgElement.style.height = 'auto'
        svgElement.style.maxHeight = '100%'
        svgElement.style.display = 'block'
        svgElement.style.margin = '0 auto'
      }
    }

    cloneDiagramRef.current = cloneDiagram

    useEffect(() => {
      if (!fullscreenDiagramRef.current || !isOpen) return
      fullscreenDiagramRef.current.style.transform = `scale(${zoomLevel})`
      fullscreenDiagramRef.current.style.transformOrigin = 'center center'

      const svgElement = fullscreenDiagramRef.current.querySelector('svg')
      if (svgElement) {
        svgElement.style.maxWidth = '100%'
        svgElement.style.height = 'auto'
        svgElement.style.display = 'block'
        svgElement.style.margin = '0 auto'
      }
    }, [zoomLevel, isOpen])

    useEffect(() => {
      if (isOpen) {
        setZoomLevel(1)
        document.body.style.overflow = 'hidden'
        const timer = setTimeout(() => cloneDiagramRef.current?.(), 100)
        return () => {
          clearTimeout(timer)
          document.body.style.overflow = ''
        }
      }
    }, [isOpen, diagramId])

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) setIsOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 5))
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
    const handleResetZoom = () => setZoomLevel(1)
    const handleClose = () => setIsOpen(false)
    const handleBackgroundClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) setIsOpen(false)
    }

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
            ref={ref}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={handleBackgroundClick}
            {...props}
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
              <div className="flex items-center justify-center w-full h-full overflow-auto p-4 scrollbar-hide">
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
)

MermaidFullscreen.displayName = 'MermaidFullscreen'

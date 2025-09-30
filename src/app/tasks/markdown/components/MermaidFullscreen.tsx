import React, { useState, useRef, useEffect } from 'react'
import { Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MermaidFullscreenProps {
  diagramId: string
}

export const MermaidFullscreen = React.forwardRef<HTMLDivElement, MermaidFullscreenProps>(
  ({ diagramId, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(1)
    const [panX, setPanX] = useState(0)
    const [panY, setPanY] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
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
      fullscreenDiagramRef.current.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`
      fullscreenDiagramRef.current.style.transformOrigin = 'center center'
      fullscreenDiagramRef.current.style.cursor = isDragging ? 'grabbing' : 'grab'
      // Remove transition during dragging for smooth panning, add it back for zoom transitions
      fullscreenDiagramRef.current.style.transition = isDragging
        ? 'none'
        : 'transform 0.2s ease-out'

      const svgElement = fullscreenDiagramRef.current.querySelector('svg')
      if (svgElement) {
        svgElement.style.maxWidth = '100%'
        svgElement.style.height = 'auto'
        svgElement.style.display = 'block'
        svgElement.style.margin = '0 auto'
      }
    }, [zoomLevel, panX, panY, isOpen, isDragging])

    useEffect(() => {
      if (isOpen) {
        setZoomLevel(1)
        setPanX(0)
        setPanY(0)
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

    useEffect(() => {
      if (!isOpen) return

      const handleGlobalWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault()
          const delta = e.deltaY > 0 ? -0.1 : 0.1
          setZoomLevel(prev => Math.max(0.1, Math.min(prev + delta, 5)))
        }
      }

      // Use passive: false to ensure preventDefault works
      document.addEventListener('wheel', handleGlobalWheel, { passive: false })
      return () => document.removeEventListener('wheel', handleGlobalWheel)
    }, [isOpen])

    const handleResetDefault = () => {
      setZoomLevel(1)
      setPanX(0)
      setPanY(0)
    }

    const handleClose = () => setIsOpen(false)
    const handleBackgroundClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) setIsOpen(false)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return // Only left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return
      setPanX(e.clientX - dragStart.x)
      setPanY(e.clientY - dragStart.y)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    // Handle mouse leave to stop dragging
    const handleMouseLeave = () => {
      setIsDragging(false)
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
                <Button
                  variant="outline"
                  onClick={handleResetDefault}
                  aria-label="Reset to default view"
                >
                  Reset
                </Button>
                <Button variant="outline" onClick={handleClose} aria-label="Close fullscreen">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center w-full h-full overflow-hidden p-4 transform-gpu">
                <div
                  ref={fullscreenDiagramRef}
                  className="mermaid-fullscreen flex items-center justify-center select-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
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

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'
import { DialogGuide } from '@/components/guide-dialogs'
import { BooleanAlgebraGuideContent } from './components/common/BooleanAlgebraGuideContent'

import dynamic from 'next/dynamic'
import { getLatexResults } from './engine'

// Import the ExpressionInput statically as it's always visible and critical for input
import { ExpressionInput } from './components/input'

// Dynamically import visualization and simplification components
const TruthTable = dynamic(
  () => import('./components/visualization').then(mod => ({ default: mod.TruthTable })),
  { loading: () => null }
)

const KarnaughMap = dynamic(
  () => import('./components/visualization').then(mod => ({ default: mod.KarnaughMap })),
  { loading: () => null }
)

const VennDiagram = dynamic(
  () => import('./components/visualization').then(mod => ({ default: mod.VennDiagram })),
  { loading: () => null }
)

const StepByStepSimplification = dynamic(
  () =>
    import('./components/simplification').then(mod => ({ default: mod.StepByStepSimplification })),
  { loading: () => null }
)

export default function BooleanAlgebraPage() {
  const [currentExpressionInput, setCurrentExpressionInput] = useState('')
  const [submittedExpression, setSubmittedExpression] = useState('')
  const [isSimplified, setIsSimplified] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleExpressionChange = (newExpression: string) => {
    setCurrentExpressionInput(newExpression)
  }

  const handleSimplificationStart = () => {
    setIsProcessing(true)
    setSubmittedExpression(currentExpressionInput)
    setIsSimplified(false)
  }

  const handleSimplificationComplete = (success: boolean) => {
    setIsProcessing(false)
    setIsSimplified(success)
  }

  const handleCopySteps = async () => {
    try {
      // Get the simplification results using the statically imported function
      const result = await getLatexResults(submittedExpression)

      if (!result.steps || result.steps.length === 0) {
        console.warn('[UI] No simplification steps to copy')
        return
      }

      // Format the step-by-step results
      let copyText = `Boolean Expression Simplification\n`
      copyText += `Original: ${submittedExpression}\n\n`

      result.steps.forEach((step, index) => {
        copyText += `Step ${index + 1}: ${step.ruleName}\n`
        copyText += `Before: ${step.beforeLatex}\n`
        copyText += `After:  ${step.afterLatex}\n\n`
      })

      copyText += `Final Result: ${result.finalLatex}\n`

      // Copy to clipboard
      await navigator.clipboard.writeText(copyText)
      console.log('[UI] Copied simplification steps to clipboard')

      // Show success feedback
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('[UI] Failed to copy steps:', err)
      // Fallback for browsers that don't support clipboard API
      try {
        const result = await getLatexResults(submittedExpression)

        let copyText = `Boolean Expression Simplification\n`
        copyText += `Original: ${submittedExpression}\n\n`
        result.steps.forEach((step, index) => {
          copyText += `Step ${index + 1}: ${step.ruleName}\n`
          copyText += `Before: ${step.beforeLatex}\n`
          copyText += `After:  ${step.afterLatex}\n\n`
        })
        copyText += `Final Result: ${result.finalLatex}\n`

        // Fallback: create a temporary textarea and copy from it
        const textArea = document.createElement('textarea')
        textArea.value = copyText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)

        console.log('[UI] Copied using fallback method')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (fallbackErr) {
        console.error('[UI] Fallback copy failed:', fallbackErr)
        alert('Failed to copy to clipboard. Your browser may not support this feature.')
      }
    }
  }

  return (
    <div className="w-full max-w-full">
      <Tabs defaultValue="simplification" className="w-full">
        <div className="w-full flex items-center justify-between mb-4  p-2">
          <TabsList className="gap-2">
            <TabsTrigger value="simplification">
              <span>Simplification</span>
            </TabsTrigger>
            <TabsTrigger value="visualization">
              <span>Visualization</span>
            </TabsTrigger>
          </TabsList>

          <DialogGuide
            trigger={
              <Button variant="ghost" size="icon" aria-label="Open Boolean Algebra Guide">
                <HelpCircle className="h-5 w-5" />
                <p className="sr-only">Open Guide</p>
              </Button>
            }
            title="Boolean Algebra Guide"
            description="Learn about boolean algebra operators and laws"
          >
            <BooleanAlgebraGuideContent
              isMobileSidebarOpen={isMobileSidebarOpen}
              onMobileSidebarClose={() => setIsMobileSidebarOpen(false)}
            />
          </DialogGuide>
        </div>

        {/* Tab 1: Simplification - Input (40%) + Steps (60%) */}
        <TabsContent value="simplification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/* Left Column (40%): Input and Truth Table */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Input Section */}
              <Card className="w-full h-fit">
                <CardHeader className="pb-2">
                  <CardTitle>Boolean Algebra Input</CardTitle>
                  <CardDescription className="flex flex-col space-y-1">
                    <p>Supported notation formats:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs pl-1">
                      <div className="font-medium">Standard:</div>
                      <div>A+B (OR), A*B (AND), !A (NOT)</div>
                      <div className="font-medium">LaTeX:</div>
                      <div>A\lor B, A\land B, \lnot A</div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpressionInput
                    defaultExpression={currentExpressionInput}
                    onExpressionChange={handleExpressionChange}
                    onSimplificationStart={handleSimplificationStart}
                    onResultChange={handleSimplificationComplete}
                    hideResult={true}
                  />
                </CardContent>
              </Card>

              {/* Truth Table */}
              <TruthTable expression={submittedExpression} />
            </div>

            {/* Right Column (60%): Step-by-step Simplification */}
            <div className="lg:col-span-6">
              <Card className="w-full h-fit">
                <CardHeader className="pb-2">
                  <CardTitle>Step-by-Step Simplification</CardTitle>
                  <CardDescription>
                    Detailed resolution process.{' '}
                    <strong className="text-warning-foreground">
                      Important: Always double-check the simplification results. Automated systems
                      may not always be perfect, so verify the output for critical applications.
                    </strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSimplified && submittedExpression.trim() ? (
                    <StepByStepSimplification
                      expression={submittedExpression}
                      onCopySteps={handleCopySteps}
                      copySuccess={copySuccess}
                    />
                  ) : (
                    <div className="text-center p-3 border-dashed border rounded-md">
                      {!isProcessing && submittedExpression.trim() === '' && (
                        <p className="text-sm ba-text-muted">
                          Enter a boolean expression and click Simplify to begin
                        </p>
                      )}
                      {!isProcessing && submittedExpression.trim() !== '' && !isSimplified && (
                        <p className="text-sm ba-text-muted">
                          Failed to simplify or no simplification needed.
                        </p>
                      )}
                      {isProcessing && <p className="text-sm ba-text-muted">Processing...</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Visualization - Venn Diagram and Karnaugh Map in 2-column grid */}
        <TabsContent value="visualization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Venn Diagram */}
            <div className="w-full">
              <VennDiagram expression={submittedExpression} />
            </div>

            {/* Karnaugh Map - Full Height */}
            <div className="w-full">
              <KarnaughMap expression={submittedExpression} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

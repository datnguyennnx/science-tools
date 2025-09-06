import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Eye, EyeOff, Columns, Minus } from 'lucide-react'
import { ModeControlsProps } from '@/app/tasks/text-diff/engine/types'
import { BUTTON_LABELS } from '@/app/tasks/text-diff/engine/constants'

export function ModeControls({
  previewMode,
  showOnlyChanges,
  onPreviewModeChange,
  onShowOnlyChangesChange,
}: ModeControlsProps) {
  const getCurrentLabel = () => {
    if (showOnlyChanges) {
      return `${BUTTON_LABELS.changesOnly} • ${previewMode === 'split' ? BUTTON_LABELS.split : BUTTON_LABELS.unified}`
    }
    return previewMode === 'split' ? BUTTON_LABELS.split : BUTTON_LABELS.unified
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs gap-2">
          {showOnlyChanges ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {previewMode === 'split' ? (
            <Columns className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {getCurrentLabel()}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onPreviewModeChange('split')}>
          <Columns className="h-4 w-4 mr-2" />
          {BUTTON_LABELS.split} View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPreviewModeChange('unified')}>
          <Minus className="h-4 w-4 mr-2" />
          {BUTTON_LABELS.unified} View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onShowOnlyChangesChange(!showOnlyChanges)}>
          {showOnlyChanges ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showOnlyChanges ? 'Show All Lines' : BUTTON_LABELS.changesOnly}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModeControls

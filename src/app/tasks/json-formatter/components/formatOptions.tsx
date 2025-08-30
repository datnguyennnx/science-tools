import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Indent, FileText, Minus } from 'lucide-react'
import { FormatOptions as FormatOptionsType } from '../engine/hooks/useJsonFormatter'

interface FormatOptionsProps {
  options: FormatOptionsType
  onChange: (options: FormatOptionsType) => void
}

export function FormatOptions({ options, onChange }: FormatOptionsProps) {
  const handleIndentChange = (value: string) => {
    onChange({
      ...options,
      indentSize: parseInt(value),
    })
  }

  const handleSortKeysChange = (checked: boolean) => {
    onChange({
      ...options,
      sortKeys: checked,
    })
  }

  const handleQuickFormat = (type: 'pretty' | 'compact' | 'minify') => {
    switch (type) {
      case 'pretty':
        onChange({
          indentSize: 2,
          compact: false,
          sortKeys: false,
          removeComments: false,
        })
        break
      case 'compact':
        onChange({
          indentSize: 0,
          compact: true,
          sortKeys: false,
          removeComments: true,
        })
        break
      case 'minify':
        onChange({
          indentSize: 0,
          compact: true,
          sortKeys: true,
          removeComments: true,
        })
        break
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Quick Format Buttons - Compact and clean */}
      <div className="flex items-center gap-1">
        <Button
          variant={!options.compact && options.indentSize === 2 ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFormat('pretty')}
          className="h-7 px-2.5 text-xs font-medium"
        >
          <Indent className="h-3 w-3 mr-1" />
          Pretty
        </Button>

        <Button
          variant={options.compact && !options.sortKeys ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFormat('compact')}
          className="h-7 px-2.5 text-xs font-medium"
        >
          <FileText className="h-3 w-3 mr-1" />
          Compact
        </Button>

        <Button
          variant={options.compact && options.sortKeys ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleQuickFormat('minify')}
          className="h-7 px-2.5 text-xs font-medium"
        >
          <Minus className="h-3 w-3 mr-1" />
          Minify
        </Button>
      </div>

      {/* Format Controls - Clean and minimal */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Indent:</span>
          <Select value={options.indentSize.toString()} onValueChange={handleIndentChange}>
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="sort-keys"
            checked={options.sortKeys}
            onCheckedChange={handleSortKeysChange}
            className="scale-75"
          />
          <span className="text-xs text-muted-foreground font-medium">Sort Keys</span>
        </div>
      </div>
    </div>
  )
}

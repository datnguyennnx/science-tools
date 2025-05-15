'use client'

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface SettingsControlsProps {
  showAlgorithmInfo: boolean
  onShowAlgorithmInfoChange: (checked: boolean) => void
  showPseudoCode: boolean
  onShowPseudoCodeChange: (checked: boolean) => void
  className?: string
}

export function SettingsControls({
  showAlgorithmInfo,
  onShowAlgorithmInfoChange,
  showPseudoCode,
  onShowPseudoCodeChange,
}: SettingsControlsProps): React.JSX.Element {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center text-sm leading-none">Configuration</div>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="algorithm-info-switch" className="flex-grow cursor-pointer text-sm">
            Algorithm Info
          </Label>
          <Switch
            id="algorithm-info-switch"
            checked={showAlgorithmInfo}
            onCheckedChange={onShowAlgorithmInfoChange}
            aria-label="Toggle Algorithm Information display"
          />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="pseudocode-switch" className="flex-grow cursor-pointer text-sm">
            Pseudo-code & Stats
          </Label>
          <Switch
            id="pseudocode-switch"
            checked={showPseudoCode}
            onCheckedChange={onShowPseudoCodeChange}
            aria-label="Toggle Pseudo-code and Statistics display"
          />
        </div>
      </div>
    </div>
  )
}

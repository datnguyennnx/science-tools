import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface FocusPreviewProps {
  onClick: () => void
}

export const FocusPreviewButton: React.FC<FocusPreviewProps> = ({ onClick }) => {
  return (
    <Button variant="outline" onClick={onClick}>
      <Eye className="mr-2 h-4 w-4" />
      Focus Preview
    </Button>
  )
}

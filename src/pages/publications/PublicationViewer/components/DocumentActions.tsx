import React from 'react'
import { Button } from '@/components/ui/button'
import { Download, Eye } from 'lucide-react'

type Props = {
  onView: () => void
  onDownload: () => void
}

export const DocumentActions: React.FC<Props> = ({ onView, onDownload }) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onView}>
        <Eye className="w-4 h-4 mr-1" />
        Visualizar
      </Button>
      <Button onClick={onDownload}>
        <Download className="w-4 h-4 mr-1" />
        Download
      </Button>
    </div>
  )
}
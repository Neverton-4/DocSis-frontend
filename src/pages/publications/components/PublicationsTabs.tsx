import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Gavel, Car } from 'lucide-react'

export const PublicationsTabs: React.FC = () => {
  return (
    <TabsList className="grid grid-cols-3 w-auto">
      <TabsTrigger value="portarias" className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Portarias
      </TabsTrigger>
      <TabsTrigger value="decretos" className="flex items-center gap-2">
        <Gavel className="w-4 h-4" />
        Decretos
      </TabsTrigger>
      <TabsTrigger value="diarias" className="flex items-center gap-2">
        <Car className="w-4 h-4" />
        Diárias
      </TabsTrigger>
    </TabsList>
  )
}
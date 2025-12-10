import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PDFViewer } from './PDFViewer'

type Props = {
  activeTab: 'documento' | 'anexos'
  onTabChange: (tab: 'documento' | 'anexos') => void
  pdfUrl: string
  loading: boolean
  error: string | null
}

export const DocumentTabs: React.FC<Props> = ({ activeTab, onTabChange, pdfUrl, loading, error }) => {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'documento' | 'anexos')}>
      <TabsList>
        <TabsTrigger value="documento">Documento</TabsTrigger>
        <TabsTrigger value="anexos">Anexos</TabsTrigger>
      </TabsList>
      <TabsContent value="documento">
        <PDFViewer pdfUrl={pdfUrl} loading={loading} error={error} />
      </TabsContent>
      <TabsContent value="anexos">
        <div className="text-sm text-gray-600">Sem anexos</div>
      </TabsContent>
    </Tabs>
  )
}
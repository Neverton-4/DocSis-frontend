import React from 'react'
import { Header } from '@/components/layout'
import { useAuth } from '@/contexts/AuthContext'
import { BackButton, DocumentHeader, DocumentActions, DocumentTabs } from './components'
import { usePublicationViewer } from './hooks'
import { Card, CardContent } from '@/components/ui/card'

export const PublicationViewer: React.FC = () => {
  const { user } = useAuth()
  const { pdfUrl, loading, error, onView, onDownload } = usePublicationViewer()
  const [activeTab, setActiveTab] = React.useState<'documento' | 'anexos'>('documento')

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header userName={user?.nome || 'Usuário'} userRole={user?.cargo || 'Cargo'} breadcrumb="Publicações" />
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-4">
            <BackButton />
            <DocumentActions onView={onView} onDownload={onDownload} />
          </div>
          <Card>
            <CardContent>
              <DocumentHeader title="Publicação" subtitle="Visualização de publicação" />
              <DocumentTabs activeTab={activeTab} onTabChange={setActiveTab} pdfUrl={pdfUrl} loading={loading} error={error} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PublicationViewer
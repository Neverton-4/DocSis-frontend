import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Eye, QrCode } from 'lucide-react'
import type { PublishedDocument } from '../hooks/usePublicationsState'
import api from '@/config/api'

type Props = {
  documents: PublishedDocument[]
}

export const DocumentList: React.FC<Props> = ({ documents }) => {
  const getViewUrl = (doc: PublishedDocument) => `${api.defaults.baseURL}/${doc.type}/${doc.id}/documento`
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-semibold text-gray-900">{doc.number}</span>
              <Badge className="bg-green-100 text-green-800">Publicado</Badge>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
            <div className="text-sm text-gray-600">
              <span>Servidor: {doc.server}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <span>Data de Criação: {doc.date}</span> • <span>Data de Publicação: {doc.publishDate}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={getViewUrl(doc)}
              target="_blank"
              rel="noopener noreferrer"
              className={
                'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3'
              }
            >
              <Eye className="w-4 h-4 mr-1" />
              Visualizar
            </a>
            <Button size="sm" variant="outline">
              <QrCode className="w-4 h-4 mr-1" />
              QR Code
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
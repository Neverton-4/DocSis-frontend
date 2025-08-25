import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DocumentListProps {
  type: string;
  searchTerm: string;
  statusFilter: string;
  actionButtons?: React.ReactNode; // Nova prop para os botões de ação
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  type, 
  searchTerm, 
  statusFilter,
  actionButtons 
}) => {
  // Dados mockados para exemplo
  const documents = [
    {
      id: 1,
      number: '001/2024',
      serverName: 'João Silva',
      date: '2024-01-15',
      status: 'criado'
    },
    {
      id: 2,
      number: '002/2024',
      serverName: 'Maria Santos',
      date: '2024-01-16',
      status: 'criado'
    },
    // Adicione mais documentos conforme necessário
  ];

  // Função para obter o título baseado no tipo
  const getTitle = (type: string) => {
    const titles = {
      'portarias': 'Documentos - Portarias (Criado)',
      'decretos': 'Documentos - Decretos (Criado)',
      'diarias': 'Documentos - Diárias (Criado)'
    };
    return titles[type] || 'Documentos';
  };

  // Filtrar documentos baseado no termo de pesquisa
  const filteredDocuments = documents.filter(doc =>
    doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.serverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {getTitle(type)}
          </h3>
          {actionButtons && (
            <div className="flex-shrink-0">
              {actionButtons}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum documento encontrado
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Documento {doc.number}
                      </p>
                      <p className="text-sm text-gray-600">
                        Servidor: {doc.serverName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Data: {new Date(doc.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {doc.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
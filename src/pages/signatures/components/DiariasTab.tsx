import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Eye, FileSignature } from 'lucide-react';

interface DiariasTabProps {
  filteredDocuments: any[];
  searchTerm: string;
  handleViewDocument: (doc: any) => void;
}

export const DiariasTab: React.FC<DiariasTabProps> = ({
  filteredDocuments,
  searchTerm,
  handleViewDocument
}) => {
  const handleSignDocument = (doc: any) => {
    console.log('Assinar diária:', doc.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diárias Aguardando Assinatura ({filteredDocuments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Nenhuma diária encontrada com os critérios de busca.' : 'Não há diárias aguardando assinatura.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{doc.number}</span>
                    <Badge className="bg-orange-100 text-orange-800">Aguardando Assinatura</Badge>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <span>Servidor: {doc.server}</span> • <span>Data: {doc.date}</span>
                  </div>
                  <div className="flex gap-2">
                    {doc.requiredSignatures.map((signature: string) => (
                      <Badge
                        key={signature}
                        className={
                          doc.completedSignatures.includes(signature)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {signature} {doc.completedSignatures.includes(signature) ? '✓' : '○'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSignDocument(doc)}>
                    <FileSignature className="w-4 h-4 mr-1" />
                    Assinar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
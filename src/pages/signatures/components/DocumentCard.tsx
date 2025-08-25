import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface DocumentCardProps {
  doc: any;
  handleViewDocument: (doc: any) => void;
  signatureLogic: any;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  handleViewDocument,
  signatureLogic
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
        {signatureLogic.renderSignatureButtons(doc)}
      </div>
    </div>
  );
};
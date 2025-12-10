import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PenTool, UserCheck } from 'lucide-react';
import { PortariaDocumentosCompletosResponse } from '@/types/portaria';
import { useDocumentSignature } from '../hooks';

interface DocumentActionsProps {
  portariaData: PortariaDocumentosCompletosResponse | null;
  onDownloadPDF: () => void;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({
  portariaData,
  onDownloadPDF
}) => {
  const {
    isSigningDocument,
    getAvailableSignatureButtons
  } = useDocumentSignature(portariaData);

  const signatureButtons = getAvailableSignatureButtons();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            onClick={onDownloadPDF}
            className="w-full"
            disabled={!portariaData}
          >
            <FileText className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
          
          {/* Renderizar botões de assinatura */}
          {signatureButtons.map((button) => (
            <Button
              key={button.id}
              onClick={button.onClick}
              className={`w-full ${
                button.isPrefeito ? 'bg-blue-600 hover:bg-blue-700' : 
                button.isSecretario ? 'bg-green-600 hover:bg-green-700' : 
                'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={button.disabled || !portariaData}
            >
              {button.isPrefeito ? (
                <PenTool className="w-4 h-4 mr-2" />
              ) : button.isSecretario ? (
                <UserCheck className="w-4 h-4 mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {button.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
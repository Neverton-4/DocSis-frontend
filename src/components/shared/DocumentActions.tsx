import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PenTool, UserCheck, XCircle } from 'lucide-react';

interface DocumentActionsProps {
  onDownloadPDF?: () => void;
  onSignDocument?: (signatureType: string) => void;
  onCancelDocument?: () => void;
  isSigning?: boolean;
  showDownload?: boolean;
  showSign?: boolean;
  showCancel?: boolean;
  availableSignatures?: Array<{
    type: string;
    label: string;
    icon: 'pen' | 'user' | 'file';
  }>;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({
  onDownloadPDF,
  onSignDocument,
  onCancelDocument,
  isSigning = false,
  showDownload = false,
  showSign = false,
  showCancel = false,
  availableSignatures = []
}) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'pen':
        return <PenTool className="w-4 h-4 mr-2" />;
      case 'user':
        return <UserCheck className="w-4 h-4 mr-2" />;
      case 'file':
        return <FileText className="w-4 h-4 mr-2" />;
      default:
        return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  const getButtonClass = (signatureType: string) => {
    switch (signatureType) {
      case 'prefeito':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'secretario':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-purple-600 hover:bg-purple-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {showDownload && onDownloadPDF && (
            <Button
              onClick={onDownloadPDF}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          )}
          
          {showSign && availableSignatures.length > 0 && onSignDocument && (
            availableSignatures.map((signature) => (
              <Button
                key={signature.type}
                onClick={() => onSignDocument(signature.type)}
                className={`w-full ${getButtonClass(signature.type)}`}
                disabled={isSigning}
              >
                {getIcon(signature.icon)}
                {isSigning ? 'Assinando...' : signature.label}
              </Button>
            ))
          )}
          
          {showCancel && onCancelDocument && (
            <Button
              onClick={onCancelDocument}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSignature, X } from 'lucide-react';

interface DocumentSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: () => void;
  isSigning: boolean;
  documentTitle: string;
  signatureType: string;
}

export const DocumentSignatureModal: React.FC<DocumentSignatureModalProps> = ({
  isOpen,
  onClose,
  onSign,
  isSigning,
  documentTitle,
  signatureType
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-blue-600" />
            Confirmar Assinatura
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Você está prestes a assinar o documento:
          </p>
          <p className="font-medium text-gray-900 mb-2">{documentTitle}</p>
          <p className="text-sm text-gray-600">
            Tipo de assinatura: <span className="font-medium">{signatureType}</span>
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSigning}>
            Cancelar
          </Button>
          <Button onClick={onSign} disabled={isSigning} className="bg-blue-600 hover:bg-blue-700">
            {isSigning ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin">
                  <div className="h-full w-full rounded-full border-2 border-white border-t-transparent"></div>
                </div>
                Assinando...
              </>
            ) : (
              <>
                <FileSignature className="mr-2 h-4 w-4" />
                Assinar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
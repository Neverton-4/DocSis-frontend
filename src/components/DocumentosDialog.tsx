import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';

interface Documento {
  id: number;
  nome: string;
  url: string;
  tipo: string;
}

interface DocumentosDialogProps {
  departamento: string;
  documentos: Documento[];
  isOpen: boolean;
  onClose: () => void;
}

const DocumentosDialog: React.FC<DocumentosDialogProps> = ({
  departamento,
  documentos,
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Documentos - {departamento}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 p-4">
          {documentos.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                {doc.tipo.startsWith('image/') ? (
                  <img 
                    src={doc.url} 
                    alt={doc.nome}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400">
                    <FileText className="h-8 w-8" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium truncate">{doc.nome}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentosDialog; 
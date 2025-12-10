import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SelectedDocument {
  id: number;
  number: string;
  title: string;
  server: string;
  type?: string;
}

interface BatchSignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocumentos: SelectedDocument[]; // Corrigindo nome da prop
  onConfirmBatchSign: () => void;
  isProcessing?: boolean;
  documentType?: string;
}

export const BatchSignDialog: React.FC<BatchSignDialogProps> = ({
  isOpen,
  onClose,
  selectedDocumentos,
  onConfirmBatchSign,
  isProcessing = false,
  documentType = 'portarias'
}) => {
  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'portarias': return 'Portarias';
      case 'decretos': return 'Decretos';
      case 'diarias': return 'Diárias';
      case 'leis': return 'Leis';
      case 'editais': return 'Editais';
      case 'outros': return 'Outros';
      default: return 'Documentos';
    }
  };
  
  const getSingularName = () => {
    switch (documentType) {
      case 'portarias': return 'portaria';
      case 'decretos': return 'decreto';
      case 'diarias': return 'diária';
      case 'leis': return 'lei';
      case 'editais': return 'edital';
      case 'outros': return 'documento';
      default: return 'documento';
    }
  };
  
  const getPluralName = () => {
    switch (documentType) {
      case 'portarias': return 'portarias';
      case 'decretos': return 'decretos';
      case 'diarias': return 'diárias';
      case 'leis': return 'leis';
      case 'editais': return 'editais';
      case 'outros': return 'documentos';
      default: return 'documentos';
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDocumentTypeName()} Selecionad{documentType === 'decretos' || documentType === 'editais' ? 'os' : 'as'}
            <Badge variant="secondary" className="ml-2">
              {selectedDocumentos.length} {selectedDocumentos.length === 1 ? getSingularName() : getPluralName()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            {documentType === 'decretos' || documentType === 'editais' ? 'Os seguintes' : 'As seguintes'} {getPluralName()} serão assinad{documentType === 'decretos' || documentType === 'editais' ? 'os' : 'as'} em lote:
          </p>
          
          <div className="h-[300px] border rounded-lg p-4 overflow-y-auto">
            <div className="space-y-3">
              {selectedDocumentos.map((documento) => (
                <div key={documento.id} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{getDocumentTypeName().slice(0, -1)} nº {documento.number}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 uppercase font-bold">{documento.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirmBatchSign} 
            disabled={isProcessing || selectedDocumentos.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? 'Assinando...' : 'Assinar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
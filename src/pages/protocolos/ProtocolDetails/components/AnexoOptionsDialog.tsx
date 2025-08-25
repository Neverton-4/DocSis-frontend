import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Scan } from 'lucide-react';

interface AnexoOptionsDialogProps {
  onClose: () => void;
  onSelectFile: () => void;
}

const AnexoOptionsDialog = ({ onClose, onSelectFile }: AnexoOptionsDialogProps) => {
  const handleFileSelection = () => {
    onSelectFile();
    onClose();
  };

  const handleScannerActivation = () => {
    toast.info('A função de scanner ainda não foi implementada.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[350px] space-y-4">
        <h2 className="text-lg font-semibold text-center">Selecione a opção de Anexos</h2>
        
        <div className="space-y-3">
          <Button
            className="w-full flex items-center justify-center gap-3 h-12"
            variant="default"
            onClick={handleFileSelection}
          >
            <FileText className="h-5 w-5" />
            Anexar arquivos do computador
          </Button>
          
          <Button
            className="w-full flex items-center justify-center gap-3 h-12"
            variant="secondary"
            onClick={handleScannerActivation}
          >
            <Scan className="h-5 w-5" />
            Ativar scanner padrão
          </Button>
        </div>
        
        <Button
          className="w-full mt-4"
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default AnexoOptionsDialog;
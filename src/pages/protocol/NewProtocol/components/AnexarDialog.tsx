import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AnexarDialogProps {
  onClose: () => void;
  onSelecionarArquivo: (file: File) => void;
}

const AnexarDialog = ({ onClose, onSelecionarArquivo }: AnexarDialogProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelecionarArquivo(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-[300px] space-y-4">
        <h2 className="text-lg font-semibold text-center">Escolher método de anexar</h2>
        <div className="space-y-2">
          <Button
            className="w-full"
            variant="default"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            📂 Abrir Explorador de Arquivos
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              toast.info('A função de escanear ainda não foi implementada.');
              onClose();
            }}
          >
            🖨️ Escanear Documento
          </Button>
        </div>
        <Button
          className="w-full mt-2"
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
      </div>

      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default AnexarDialog;

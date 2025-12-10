import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getComprovanteURL } from '@/services/processoService';

interface ComprovanteDialogProps {
  open: boolean;
  protocoloId: string;
  onOpenChange: (open: boolean) => void;
}

const ComprovanteDialog = ({ open, protocoloId, onOpenChange }: ComprovanteDialogProps) => {
  const navigate = useNavigate();

  const handleVisualizar = async () => {
    console.log('protocoloId atual:', protocoloId);
    if (!protocoloId) {
      toast.error('ID do processo não encontrado.');
      return;
    }
  
    try {
      // const html = await getComprovanteHTML(protocoloId);
      // const win = window.open();

      const url = getComprovanteURL(protocoloId);
      window.open(url, '_blank');
      // if (win) {
      //   win.document.write(url);
      //   win.document.close();
      // }
    } catch (err) {
      toast.error('Erro ao carregar comprovante');
      console.error(err);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarEmail = () => {
    toast('Envio por e-mail em construção.');
  };

  // useEffect(() => {
  //   if (!open) navigate('/');
  // }, [open, navigate]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md bg-white p-6 rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-semibold mb-4">Deseja gerar um comprovante?</Dialog.Title>
          <div className="space-y-4">
            <Button onClick={handleVisualizar} className="w-full">Visualizar</Button>
            <Button onClick={handleImprimir} className="w-full">Imprimir</Button>
            <Button onClick={handleEnviarEmail} className="w-full">Enviar por e-mail</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">Cancelar</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ComprovanteDialog;
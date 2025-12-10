import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSignature, XCircle } from 'lucide-react';
import { PortariaDocumentosCompletosResponse } from '@/types/portaria';
import { useDocumentSignature } from '../hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { documentoService as portariaService } from '@/services/documentoPortariaService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DocumentActionsProps {
  portariaData: PortariaDocumentosCompletosResponse | null;
  documentType?: string;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({
  portariaData,
  documentType
}) => {
  const {
    isSigningDocument,
    handleUnifiedSignClick
  } = useDocumentSignature(portariaData, documentType);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Único botão "Assinar" com comportamento replicado do Signatures

  const handleCancel = async () => {
    // Sempre permitir cancelamento, mesmo sem portariaData
    if (!portariaData?.portaria?.id) {
      toast({ title: 'Aviso', description: 'Nenhum documento carregado para cancelar.', variant: 'default' });
      return;
    }
    setIsCancelling(true);
    try {
      await portariaService.update(portariaData.portaria.id, { status: 'cancelado' });
      toast({ title: 'Cancelado', description: 'Portaria cancelada com sucesso.', variant: 'default' });
      setCancelDialogOpen(false);
      navigate('/signatures');
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Falha ao cancelar portaria.', variant: 'destructive' });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="sticky top-4 z-10 shadow-lg">
      <CardHeader>
        <CardTitle>Ações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Botão Cancelar - Sempre visível */}
          <Button
            onClick={() => setCancelDialogOpen(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            disabled={false}
            variant="default"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          {/* Botão único de assinatura - Sempre visível */}
          <Button
            onClick={handleUnifiedSignClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            disabled={isSigningDocument}
          >
            <FileSignature className="w-4 h-4 mr-2" />
            {isSigningDocument ? 'Assinando...' : 'Assinar'}
          </Button>
        </div>
      </CardContent>

      {/* Modal de confirmação de cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja realmente cancelar esta portaria?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>Voltar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
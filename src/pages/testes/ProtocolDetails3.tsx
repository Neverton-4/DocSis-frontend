// src/pages/ProtocolDetails.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getProcessoById } from '@/services/processoService';
import { getDocumentosByProcesso } from '@/services/documentoService';
import { getEtapasByProcessoId } from '@/services/etapaService';
import ServidorInfo from '@/components/ProtocolDetails/ServidorInfo';
import ProcessoInfo from '@/pages/protocolos/ProtocolDetails/components/ProcessInfo';
import EtapasList from '@/components/ProtocolDetails/EtapasList';
import AnexosList from '@/components/ProtocolDetails/AnexosList';
import ComprovanteDialog from '@/components/ComprovanteDialog';

const ProtocolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const [proc, docs, etps] = await Promise.all([
          getProcessoById(Number(id)),
          getDocumentosByProcesso(Number(id)),
          getEtapasByProcessoId(Number(id))
        ]);
        setProcesso(proc);
        setDocumentos(docs);
        setEtapas(etps);
      } catch (error) {
        toast.error("Erro ao carregar dados do processo");
      }
    };
    fetchData();
  }, [id]);

  const handleVoltar = () => navigate(-1);
  const handleEncaminhar = () => toast.info('Encaminhamento não implementado.');

  if (!processo) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="text-xl font-bold text-gray-700 mb-4">Detalhes do Protocolo</div>

      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-7 space-y-6">
          <ServidorInfo servidor={processo.servidor} />
          <ProcessoInfo processo={processo} />
        </div>

        <div className="col-span-3 space-y-6">
          <AnexosList anexos={documentos} />
          <EtapasList etapas={etapas} />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={() => setShowDialog(true)}>Comprovante</Button>
        <Button variant="outline" onClick={handleVoltar}>Voltar</Button>
        <Button onClick={handleEncaminhar}>Encaminhar</Button>
      </div>

      <ComprovanteDialog
        open={showDialog}
        protocoloId={String(processo.id)}
        onOpenChange={setShowDialog}
      />
    </div>
  );
};

export default ProtocolDetails;

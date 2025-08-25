import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { getProcessoById } from '@/services/processoService';
import { getEtapasByProcessoId } from '@/services/etapaService';
import { useQuery } from '@tanstack/react-query';
import ProcessInfoCard from '@/pages/protocolos/ProtocolDetails/components/ProcessInfoCard';
import SidebarSection from '@/pages/protocolos/ProtocolDetails/components/SidebarSection';
import ComprovanteDialog from '@/components/ComprovanteDialog';

const ProtocolDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const processoId = id ? parseInt(id) : 0;
  const [comprovanteDialogOpen, setComprovanteDialogOpen] = useState(false);

  const { data: processo, isLoading: isLoadingProcesso, error: errorProcesso } = useQuery({
    queryKey: ['processo', processoId],
    queryFn: () => getProcessoById(processoId),
    enabled: !!processoId
  });

  const { data: etapas, isLoading: isLoadingEtapas, error: errorEtapas } = useQuery({
    queryKey: ['etapas', processoId],
    queryFn: () => getEtapasByProcessoId(processoId),
    enabled: !!processoId
  });

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleEncaminhar = () => {
    // Implementar lógica de encaminhamento
    console.log('Encaminhar processo');
  };

  const handleComprovante = () => {
    setComprovanteDialogOpen(true);
  };

  if (isLoadingProcesso) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header breadcrumb="Painel > Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes do processo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorProcesso) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header breadcrumb="Painel > Erro" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar processo</h2>
            <p className="text-gray-600 mb-4">Não foi possível carregar os detalhes do processo.</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!processo) {
    return <div>Processo não encontrado</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header 
        breadcrumb={`Painel > Detalhes do Processo #${processo.id}`} 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
          {/* Botão Voltar */}
          <div className="mb-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              ← Voltar
            </button>
          </div>
          
          <div className="grid grid-cols-12 gap-6">
            <ProcessInfoCard 
              processo={processo}
              onVoltar={handleVoltar}
              onEncaminhar={handleEncaminhar}
              onComprovante={handleComprovante}
            />

            <SidebarSection 
              processoId={processoId}
              etapas={etapas}
              isLoadingEtapas={isLoadingEtapas}
              errorEtapas={errorEtapas}
            />
          </div>
        </div>
      </div>

      <ComprovanteDialog
        open={comprovanteDialogOpen}
        protocoloId={processo.id.toString()}
        onOpenChange={setComprovanteDialogOpen}
      />
    </div>
  );
};

export default ProtocolDetails;
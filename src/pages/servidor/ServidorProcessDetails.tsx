import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { processoService, Processo } from '@/services/processoService';
import { listarDocumentos } from '@/services/processoDocumentoService';
import { listarAnexos } from '@/services/processoAnexoService';
import { ProcessInfoCard, EtapasSection, SidebarSection } from './components';
import { Header } from '@/components/layout';

const ServidorProcessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const processoId = parseInt(id || '0');

  // Query para buscar dados do processo
  const { data: processo, isLoading, error } = useQuery({
    queryKey: ['processo', processoId],
    queryFn: () => processoService.getProcessoById(processoId),
    enabled: !!processoId
  });

  // Query para buscar documentos
  const { 
    data: documentos, 
    isLoading: isLoadingDocumentos 
  } = useQuery({
    queryKey: ['documentos', processoId],
    queryFn: () => listarDocumentos(processoId),
    enabled: !!processoId
  });

  // Query para buscar anexos
  const { 
    data: anexos, 
    isLoading: isLoadingAnexos 
  } = useQuery({
    queryKey: ['anexos', processoId],
    queryFn: () => listarAnexos(processoId),
    enabled: !!processoId
  });

  // Mock de etapas para demonstração
  const etapas = [
    {
      id: 1,
      departamento_id: 1,
      observacao: "Processo iniciado e em análise inicial",
      etapa_status: "em_andamento",
      data_inicio: "2024-01-15T08:00:00Z",
      data_fim: ""
    },
    {
      id: 2,
      departamento_id: 2,
      observacao: "Documentação verificada e aprovada",
      etapa_status: "concluido",
      data_inicio: "2024-01-10T09:00:00Z",
      data_fim: "2024-01-14T17:00:00Z"
    }
  ];

  const handleVoltar = () => {
    navigate('/servidor');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header 
          userName="Usuário" 
          userRole="Administrador" 
          breadcrumb="Servidor > Processo" 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Carregando detalhes do processo...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !processo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header 
          userName="Usuário" 
          userRole="Administrador" 
          breadcrumb="Servidor > Processo" 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar processo</h2>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'Processo não encontrado'}
            </p>
            <Button onClick={handleVoltar} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Servidor > Processo" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com botão de voltar */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={handleVoltar}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Processo {processo.numero}/{processo.ano}
          </h1>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-12 gap-6">
          {/* Coluna principal - Informações do processo */}
          <div className="col-span-8 space-y-6">
            {/* Card de informações do processo */}
            <ProcessInfoCard 
              processo={processo}
            />

            {/* Seção de etapas */}
            <EtapasSection 
              processoId={processoId}
              etapas={etapas}
              isLoadingEtapas={false}
              errorEtapas={null}
            />
          </div>

          {/* Sidebar - Arquivos */}
          <SidebarSection 
            processoId={processoId}
            documentos={documentos}
            anexos={anexos}
            isLoadingDocumentos={isLoadingDocumentos}
            isLoadingAnexos={isLoadingAnexos}
          />
        </div>
      </div>
    </div>
  );
};

export default ServidorProcessDetails;
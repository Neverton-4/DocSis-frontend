import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout';
import { getProcessoCompleto, ProcessoCompleto } from '@/services/processoService';
import { criarEtapaNoProcesso, EtapaStatus, ProcessoEtapaCreate } from '@/services/processoEtapaService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import DadosPessoaisCard from '@/pages/protocol/ProtocolDetails/components/DadosPessoaisCard';
import DadosFuncionaisCard from '@/pages/protocol/ProtocolDetails/components/DadosFuncionaisCard';
import DadosComplementaresCard from '@/pages/protocol/ProtocolDetails/components/DadosComplementaresCard';
import DadosProcessoCard from '@/pages/protocol/ProtocolDetails/components/DadosProcessoCard';
import DadosJuridicosCard from '@/pages/protocol/ProtocolDetails/components/DadosJuridicosCard';
import DadosRepresentanteCard from '@/pages/protocol/ProtocolDetails/components/DadosRepresentanteCard';
import SidebarSection from '@/pages/protocol/ProtocolDetails/components/SidebarSection';
import { ComprovanteDialog } from '@components/shared';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { departamentoService } from '@/services/departamentoService';
import PermissionGate from '@/components/shared/PermissionGate';

const ProtocolDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const processoId = id ? parseInt(id) : 0;
  const [comprovanteDialogOpen, setComprovanteDialogOpen] = useState(false);
  
  const [encaminharDialogOpen, setEncaminharDialogOpen] = useState(false);
  const [departamentosSecretaria, setDepartamentosSecretaria] = useState<{departamento_id: number}[]>([]);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState('');
  const [encaminharLoading, setEncaminharLoading] = useState(false);
  const [isPrincipalFlow, setIsPrincipalFlow] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Estados para dados consolidados
  const [processoCompleto, setProcessoCompleto] = useState<ProcessoCompleto | null>(null);
  const [isLoadingProcessoCompleto, setIsLoadingProcessoCompleto] = useState(true);
  const [errorProcessoCompleto, setErrorProcessoCompleto] = useState<string | null>(null);

  // Carregar dados consolidados uma única vez
  useEffect(() => {
    const carregarDadosConsolidados = async () => {
      if (!processoId) return;
      
      try {
        setIsLoadingProcessoCompleto(true);
        setErrorProcessoCompleto(null);
        const dados = await getProcessoCompleto(processoId);
        setProcessoCompleto(dados);
      } catch (error) {
        console.error('Erro ao carregar dados consolidados:', error);
        setErrorProcessoCompleto('Erro ao carregar dados do processo');
      } finally {
        setIsLoadingProcessoCompleto(false);
      }
    };

    carregarDadosConsolidados();
  }, [processoId]);

  // Extrair dados dos objetos consolidados com validações
  // A API consolidada retorna: { processo, interessado, etapas, documentos, anexos }
  const processo = useMemo(() => {
    if (!processoCompleto?.processo) {
      return null;
    }
    
    // Combinar dados do processo com dados do interessado para manter compatibilidade
    return {
      ...processoCompleto.processo,
      interessado: processoCompleto.interessado,
      // Mapear iniciador_tipo para manter compatibilidade
      iniciador_tipo: processoCompleto.processo.iniciador_tipo
    };
  }, [processoCompleto]);
  
  // Validação e sanitização dos dados consolidados
  const etapas = useMemo(() => {
    if (!processoCompleto?.etapas || !Array.isArray(processoCompleto.etapas)) {
      console.warn('ProtocolDetails: etapas não é um array válido', processoCompleto?.etapas);
      return [];
    }
    
    return processoCompleto.etapas.filter(etapa => {
      if (!etapa || typeof etapa !== 'object') {
        console.warn('ProtocolDetails: etapa inválida encontrada', etapa);
        return false;
      }
      return true;
    });
  }, [processoCompleto?.etapas]);
  
  const documentos = useMemo(() => {
    if (!processoCompleto?.documentos || !Array.isArray(processoCompleto.documentos)) {
      console.warn('ProtocolDetails: documentos não é um array válido', processoCompleto?.documentos);
      return [];
    }
    
    return processoCompleto.documentos.filter(doc => {
      if (!doc || typeof doc !== 'object') {
        console.warn('ProtocolDetails: documento inválido encontrado', doc);
        return false;
      }
      return true;
    });
  }, [processoCompleto?.documentos]);
  
  const anexos = useMemo(() => {
    if (!processoCompleto?.anexos || !Array.isArray(processoCompleto.anexos)) {
      console.warn('ProtocolDetails: anexos não é um array válido', processoCompleto?.anexos);
      return [];
    }
    
    return processoCompleto.anexos.filter(anexo => {
      if (!anexo || typeof anexo !== 'object') {
        console.warn('ProtocolDetails: anexo inválido encontrado', anexo);
        return false;
      }
      return true;
    });
  }, [processoCompleto?.anexos]);

  // Removidas as chamadas desnecessárias de API - dados já estão na API consolidada
  // Mantendo apenas departamentos para funcionalidade de encaminhamento
  const { data: departamentosAll } = useQuery({
    queryKey: ['departamentos'],
    queryFn: departamentoService.getAll
  });

  const currentDepartamento = useMemo(() => {
    if (!user?.departamento_id || !departamentosAll) return undefined;
    return departamentosAll.find(d => d.id === user.departamento_id);
  }, [user?.departamento_id, departamentosAll]);

  const principalDepartamentoDaSecretaria = useMemo(() => {
    if (!departamentosAll || !departamentosSecretaria) return undefined;
    const idsVinculados = new Set(departamentosSecretaria.map(p => p.departamento_id));
    return departamentosAll.find(d => idsVinculados.has(d.id) && d.is_principal);
  }, [departamentosAll, departamentosSecretaria]);

  const departamentosDestino = useMemo(() => {
    if (!departamentosAll || !departamentosSecretaria || !user?.departamento_id) return [];
    const idsVinculados = new Set(departamentosSecretaria.map(p => p.departamento_id));
    return departamentosAll.filter(d => idsVinculados.has(d.id) && d.id !== user.departamento_id).map(d => ({ id: d.id, nome: d.nome }));
  }, [departamentosAll, departamentosSecretaria, user?.departamento_id]);
  
  const handleEncaminhar = async () => {
    try {
      if (!user?.secretaria?.id || !user?.departamento_id) {
        toast.error('Usuário sem secretaria ou departamento.');
        return;
      }
      // Garantir que a lista de departamentos esteja carregada
      if (!departamentosAll || departamentosAll.length === 0) {
        toast.info('Carregando departamentos... tente novamente em instantes.');
        return;
      }
      const resp = await api.get(`/protocolos-departamentos/secretaria/${user.secretaria.id}/departamentos`);
      const protocolos: { secretaria_id: number; departamento_id: number }[] = resp.data || [];
      setDepartamentosSecretaria(protocolos);

      // Evitar depender de valores derivados que ainda não foram atualizados
      const isPrincipal = currentDepartamento?.is_principal === true;
      setIsPrincipalFlow(isPrincipal ?? false);

      if (!isPrincipal) {
        // Calcular o departamento principal diretamente a partir dos dados recém obtidos
        const idsVinculados = new Set(protocolos.map(p => p.departamento_id));
        const principalAtual = departamentosAll.find(d => idsVinculados.has(d.id) && d.is_principal);
        if (!principalAtual) {
          toast.error('Departamento principal não encontrado na secretaria.');
          return;
        }
      }

      setSelectedDepartamentoId('');
      setEncaminharDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar departamentos de protocolo.');
    }
  };

  const handleComprovante = () => {
    setComprovanteDialogOpen(true);
  };

  const handleDeclaracao = () => {
    toast.info('Funcionalidade de declaração em construção.');
  };

  const handleParecer = () => {
    // Funcionalidade de parecer em desenvolvimento
    toast.info('Funcionalidade de parecer em construção.');
  };

  const confirmarEncaminhamento = async () => {
    setEncaminharLoading(true);
    try {
      let destinoDepartamentoId: number | undefined;

      if (isPrincipalFlow) {
        if (!selectedDepartamentoId) {
          toast.error('Selecione um departamento de destino.');
          return;
        }
        destinoDepartamentoId = parseInt(selectedDepartamentoId, 10);
      } else {
        destinoDepartamentoId = principalDepartamentoDaSecretaria?.id;
        if (!destinoDepartamentoId) {
          toast.error('Departamento principal não encontrado.');
          return;
        }
      }

      const maxOrdem = (etapas || []).reduce((max, e) => Math.max(max, e.ordem || 0), 0);
      const proximaOrdem = (maxOrdem || 0) + 1;

      const payload: ProcessoEtapaCreate = {
        processo_id: processoId,
        usuario_id: user.id,
        departamento_id: destinoDepartamentoId!,
        etapa_status: EtapaStatus.PENDENTE,
        observacao: undefined,
        etapa_final: false,
        ordem: proximaOrdem
      };

      await criarEtapaNoProcesso(processoId, payload);
      toast.success('Processo encaminhado com sucesso.');
      setEncaminharDialogOpen(false);
      setSelectedDepartamentoId('');
      
      // Recarregar dados consolidados após criar nova etapa
      try {
        const dadosAtualizados = await getProcessoCompleto(processoId);
        setProcessoCompleto(dadosAtualizados);
      } catch (error) {
        console.error('Erro ao recarregar dados após encaminhamento:', error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao encaminhar processo.');
    } finally {
      setEncaminharLoading(false);
    }
  };

  if (isLoadingProcessoCompleto) {
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

  if (errorProcessoCompleto) {
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
        breadcrumb={`Painel > Detalhes do Processo ${processo?.numero || ''}/${processo?.ano || ''}`} 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
          {/* Header com botÃ£o Voltar, tÃ­tulo e botÃµes de aÃ§Ã£o */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                ← Voltar
              </button>
              <span className="text-lg font-semibold text-gray-700">
                Portaria nº {processo?.numero || ''}/{processo?.ano || ''}
              </span>
            </div>
            
            {/* BotÃµes de aÃ§Ã£o centralizados na parte superior direita */}
            <div className="flex gap-3">
              <PermissionGate codigo="gerar_parecer" telaId={1}>
                <Button 
                  variant="outline" 
                  onClick={handleParecer}
                >
                  Parecer
                </Button>
              </PermissionGate>
              <PermissionGate codigo="gerar_declaracao" telaId={1}>
                <Button variant="outline" onClick={handleDeclaracao}>
                  Declaração
                </Button>
              </PermissionGate>
              <PermissionGate codigo="enviar_comprovante" telaId={1}>
                <Button variant="outline" onClick={handleComprovante}>
                  Comprovante
                </Button>
              </PermissionGate>
              <PermissionGate codigo="vida_funcional" telaId={1}>
                <Button variant="outline" onClick={() => toast.info('Funcionalidade de vida funcional em construção.') }>
                  Vida Funcional
                </Button>
              </PermissionGate>
              <Button onClick={handleEncaminhar}>
                Encaminhar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-6">
            {/* Cards de dados organizados condicionalmente baseado no tipo de iniciador */}
            <div className="col-span-8 space-y-6">
              <DadosProcessoCard processo={processo} />
              
              {/* Para servidor: Dados Pessoais, Funcionais e Complementares */}
              {processo?.iniciador_tipo === 'servidor' && (
                <>
                  <DadosPessoaisCard processo={processo} />
                  <DadosFuncionaisCard processo={processo} />
                  <DadosComplementaresCard processo={processo} />
                </>
              )}
              
              {/* Para cidadão: Apenas Dados Pessoais (completos) */}
              {processo?.iniciador_tipo === 'cidadao' && (
                <>
                  <DadosPessoaisCard processo={processo} />
                </>
              )}
              
              {/* Para jurÃ­dico: Dados JurÃ­dicos e do Representante */}
              {processo?.iniciador_tipo === 'juridico' && (
                <>
                  <DadosJuridicosCard processo={processo} />
                  <DadosRepresentanteCard processo={processo} />
                </>
              )}
            </div>

            <SidebarSection 
              processoId={processoId}
              etapas={etapas}
              isLoadingEtapas={false}
              errorEtapas={null}
              documentos={documentos}
              anexos={anexos}
              isLoadingDocumentos={false}
              isLoadingAnexos={false}
            />
          </div>
        </div>
      </div>

      <ComprovanteDialog
        open={comprovanteDialogOpen}
        protocoloId={processo?.id?.toString() || ''}
        onOpenChange={setComprovanteDialogOpen}
      />

      

      <Dialog open={encaminharDialogOpen} onOpenChange={setEncaminharDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encaminhar Processo</DialogTitle>
          </DialogHeader>
          {isPrincipalFlow ? (
            <div className="space-y-4">
              <label className="text-sm font-medium">Selecionar departamento de destino</label>
              <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departamentosDestino.map(dep => (
                    <SelectItem key={dep.id} value={dep.id.toString()}>
                      {dep.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEncaminharDialogOpen(false)}>Cancelar</Button>
                <Button onClick={confirmarEncaminhamento} disabled={encaminharLoading || !selectedDepartamentoId}>
                  {encaminharLoading ? 'Encaminhando...' : 'Confirmar encaminhamento'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                Encaminhar processo para {principalDepartamentoDaSecretaria?.nome || 'Departamento principal'}
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEncaminharDialogOpen(false)}>Cancelar</Button>
                <Button onClick={confirmarEncaminhamento} disabled={encaminharLoading}>
                  {encaminharLoading ? 'Encaminhando...' : 'Confirmar encaminhamento'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProtocolDetails;




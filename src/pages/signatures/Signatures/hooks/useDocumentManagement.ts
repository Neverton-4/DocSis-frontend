import { useState, useEffect } from 'react';
import { useDocumentos } from '@/hooks/useDocumentos';
import { usePortarias } from '@/hooks/usePortarias';
import { useDecretos } from '@/hooks/useDecretos';
import { useDiarias } from '@/hooks/useDiarias';
import { useAssinaturas } from '@/hooks/useAssinaturas';
import { Documento } from '@/types';
import { AssinaturaPortaria } from '@/services/assinaturaService';

// Mock data for decretos, diárias, leis, editais e outros
const mockDecretos = [
  {
    id: 1,
    number: '004/2024',
    server: 'João Silva',
    title: 'Designação de Comissão',
    date: '18/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Secretário']
  },
  {
    id: 2,
    number: '005/2024',
    server: 'Maria Santos',
    title: 'Regulamentação de Processo',
    date: '20/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  }
];

const mockDiarias = [
  {
    id: 1,
    number: '006/2024',
    server: 'Pedro Costa',
    title: 'Viagem Oficial a Campo Grande',
    date: '20/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  },
  {
    id: 2,
    number: '007/2024',
    server: 'Ana Oliveira',
    title: 'Viagem para Capacitação',
    date: '22/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Secretário']
  }
];

const mockLeis = [
  {
    id: 1,
    number: '001/2024',
    server: 'Carlos Ferreira',
    title: 'Lei Orçamentária Anual',
    date: '15/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  },
  {
    id: 2,
    number: '002/2024',
    server: 'Lucia Mendes',
    title: 'Lei de Diretrizes Orçamentárias',
    date: '18/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Secretário']
  },
  {
    id: 3,
    number: '003/2024',
    server: 'José Pereira',
    title: 'Lei Municipal de Tributos',
    date: '22/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  }
];

const mockEditais = [
  {
    id: 1,
    number: '001/2024',
    server: 'Roberto Silva',
    title: 'Edital de Licitação - Obras Públicas',
    date: '12/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  },
  {
    id: 2,
    number: '002/2024',
    server: 'Sandra Costa',
    title: 'Edital de Concurso Público',
    date: '16/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Prefeito']
  },
  {
    id: 3,
    number: '003/2024',
    server: 'Márcio Oliveira',
    title: 'Edital de Pregão Eletrônico',
    date: '19/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  }
];

const mockOutros = [
  {
    id: 1,
    number: '001/2024',
    server: 'Fernando Alves',
    title: 'Protocolo de Intenções',
    date: '10/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  },
  {
    id: 2,
    number: '002/2024',
    server: 'Patricia Lima',
    title: 'Termo de Cooperação',
    date: '14/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Secretário']
  },
  {
    id: 3,
    number: '003/2024',
    server: 'Ricardo Santos',
    title: 'Acordo de Cooperação Técnica',
    date: '17/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  },
  {
    id: 4,
    number: '004/2024',
    server: 'Carla Rodrigues',
    title: 'Termo de Parceria',
    date: '21/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Prefeito']
  }
];

export const useDocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('portarias');
  const [currentYear, setCurrentYear] = useState(String(new Date().getFullYear()));
  
  // Batch signing states - generalized for all document types
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [selectAllDocuments, setSelectAllDocuments] = useState(false);
  const [isBatchSignDialogOpen, setIsBatchSignDialogOpen] = useState(false);
  
  // Integração com dados reais dos documentos
  const { documentos, loading, error, fetchByStatus } = useDocumentos();
  const { portarias, loading: portariasLoading, error: portariasError, fetchByStatus: fetchPortariasByStatus } = usePortarias();
  const { decretos, loading: decretosLoading, error: decretosError, fetchByStatus: fetchDecretosByStatus } = useDecretos();
  const { diarias, loading: diariasLoading, error: diariasError, fetchByStatus: fetchDiariasByStatus } = useDiarias();
  const { fetchByPortaria } = useAssinaturas();
  const [pendingDocumentos, setPendingDocumentos] = useState<Documento[]>([]);
  const [pendingPortarias, setPendingPortarias] = useState<any[]>([]);
  const [pendingDecretos, setPendingDecretos] = useState<any[]>([]);
  const [pendingDiarias, setPendingDiarias] = useState<any[]>([]);
  const [documentosSignatures, setDocumentosSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});
  const [portariasSignatures, setPortariasSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});
  const [decretosSignatures, setDecretosSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});
  const [diariasSignatures, setDiariasSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});

  // Buscar documentos com status 'aguardando_assinatura'
  useEffect(() => {
    const loadPendingDocumentos = async () => {
      try {
        const ano = Number(currentYear);
        await fetchByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
      } catch (err) {
        console.error('Erro ao carregar documentos pendentes:', err);
      }
    };
    
    loadPendingDocumentos();
  }, [fetchByStatus, currentYear]);

  // Buscar portarias com status 'aguardando_assinatura'
  useEffect(() => {
    const loadPendingPortarias = async () => {
      try {
        const ano = Number(currentYear);
        await fetchPortariasByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
      } catch (err) {
        console.error('Erro ao carregar portarias pendentes:', err);
      }
    };
    
    loadPendingPortarias();
  }, [fetchPortariasByStatus, currentYear]);

  // Buscar decretos com status 'aguardando_assinatura'
  useEffect(() => {
    const loadPendingDecretos = async () => {
      try {
        const ano = Number(currentYear);
        await fetchDecretosByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
      } catch (err) {
        console.error('Erro ao carregar decretos pendentes:', err);
      }
    };
    
    loadPendingDecretos();
  }, [fetchDecretosByStatus, currentYear]);

  // Buscar diárias com status 'aguardando_assinatura'
  useEffect(() => {
    const loadPendingDiarias = async () => {
      try {
        const ano = Number(currentYear);
        await fetchDiariasByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
      } catch (err) {
        console.error('Erro ao carregar diárias pendentes:', err);
      }
    };
    
    loadPendingDiarias();
  }, [fetchDiariasByStatus, currentYear]);

  // Atualizar documentos pendentes quando os dados chegarem
  useEffect(() => {
    const filtered = documentos.filter(d => d.status === 'aguardando_assinatura');
    setPendingDocumentos(filtered);
  }, [documentos]);

  // Atualizar portarias pendentes quando os dados chegarem
  useEffect(() => {
    const filtered = portarias.filter(p => p.status === 'aguardando_assinatura' || p.status_novo === 'aguardando_assinatura');
    setPendingPortarias(filtered);
  }, [portarias]);

  // Atualizar decretos pendentes quando os dados chegarem
  useEffect(() => {
    const filtered = decretos.filter(d => d.status === 'aguardando_assinatura' || d.status_novo === 'aguardando_assinatura');
    setPendingDecretos(filtered);
  }, [decretos]);

  // Atualizar diárias pendentes quando os dados chegarem
  useEffect(() => {
    const filtered = diarias.filter(d => d.status === 'aguardando_assinatura' || d.status_novo === 'aguardando_assinatura');
    setPendingDiarias(filtered);
  }, [diarias]);

  // Função para carregar assinaturas sob demanda (quando necessário)
  const loadSignaturesForDocument = async (documentId: number, documentType: string) => {
    try {
      const signatures = await fetchByPortaria(documentId);
      
      switch (documentType) {
        case 'documentos':
          setDocumentosSignatures(prev => ({ ...prev, [documentId]: signatures }));
          break;
        case 'portarias':
          setPortariasSignatures(prev => ({ ...prev, [documentId]: signatures }));
          break;
        case 'decretos':
          setDecretosSignatures(prev => ({ ...prev, [documentId]: signatures }));
          break;
        case 'diarias':
          setDiariasSignatures(prev => ({ ...prev, [documentId]: signatures }));
          break;
      }
      
      return signatures;
    } catch (err) {
      console.error(`Erro ao carregar assinaturas do ${documentType} ${documentId}:`, err);
      return [];
    }
  };

  // Função para verificar se uma assinatura específica está completa
  const isSignatureCompleted = (documentoId: number, tipoAssinatura: string): boolean => {
    const signatures = documentosSignatures[documentoId] || [];
    const tipoMap: Record<string, string> = {
      'Secretário': 'secretario',
      'Prefeito': 'prefeito'
    };
    
    const tipoNormalizado = tipoMap[tipoAssinatura] || tipoAssinatura.toLowerCase();
    return signatures.some(sig => 
      sig.tipo.toLowerCase() === tipoNormalizado && 
      sig.status === 'assinada'
    );
  };

  // Filtrar documentos baseado na aba ativa e busca
  const getFilteredDocuments = () => {
    let documents: any[] = [];
    
    
    switch (activeTab) {
      case 'documentos':
        documents = pendingDocumentos.map(d => {
          const signatures = documentosSignatures[d.id] || [];
          const completedSignatures = ['Secretário', 'Prefeito'].filter(tipo => 
            isSignatureCompleted(d.id, tipo)
          );
          
          const mappedDoc = {
            id: d.id,
            number: `${d.numero}/${d.ano}`,
            type: 'documentos',
            server: d.servidor_nome || d.servidor?.nome_completo || 'Não informado',
            title: `${d.tipo_nome || d.tipo_documento?.nome || 'Tipo não informado'}${d.subtipo_nome ? ` - ${d.subtipo_nome}` : (d.subtipo_documento ? ` - ${d.subtipo_documento.nome}` : '')}`,
            date: new Date(d.data_documento || d.data_portaria).toLocaleDateString('pt-BR'),
            requiredSignatures: ['Secretário', 'Prefeito'],
            completedSignatures,
            originalData: d
          };
          return mappedDoc;
        });
        break;
      case 'decretos':
        documents = pendingDecretos.map(d => {
          // Usar as informações de status das assinaturas que vêm da API
          const assinaturasStatus = d.assinaturas_status || {};
          
          // Determinar quais assinaturas estão completas baseado no status da API
          const completedSignatures = [];
          if (assinaturasStatus.prefeito === 'assinada') {
            completedSignatures.push('Prefeito');
          }
          if (assinaturasStatus.secretario === 'assinada') {
            completedSignatures.push('Secretário');
          }
          
          const mappedDecreto = {
            id: d.id,
            number: `${d.numero}/${d.ano}`,
            type: 'decretos',
            server: d.servidor_nome || d.servidor?.nome_completo || 'Não informado',
            title: d.titulo || `${d.tipo_nome || d.tipo_decreto?.nome || 'Tipo não informado'}${d.subtipo_nome ? ` - ${d.subtipo_nome}` : (d.subtipo_decreto ? ` - ${d.subtipo_decreto.nome}` : '')}`,
            date: new Date(d.data_decreto || d.data_portaria).toLocaleDateString('pt-BR'),
            requiredSignatures: ['Secretário', 'Prefeito'],
            completedSignatures,
            assinaturasStatus, // Adicionar o status das assinaturas ao objeto
            originalData: d
          };
          return mappedDecreto;
        });
        break;
      case 'diarias':
        documents = pendingDiarias.map(d => {
          // Usar as informações de status das assinaturas que vêm da API
          const assinaturasStatus = d.assinaturas_status || {};
          
          // Determinar quais assinaturas estão completas baseado no status da API
          const completedSignatures = [];
          if (assinaturasStatus.prefeito === 'assinada') {
            completedSignatures.push('Prefeito');
          }
          if (assinaturasStatus.secretario === 'assinada') {
            completedSignatures.push('Secretário');
          }
          
          const mappedDiaria = {
            id: d.id,
            number: `${d.numero}/${d.ano}`,
            type: 'diarias',
            server: d.servidor_nome || d.servidor?.nome_completo || 'Não informado',
            title: d.titulo || `Diária - ${d.objetivo || 'Objetivo não informado'}`,
            date: new Date(d.data_diaria || d.data_requerimento).toLocaleDateString('pt-BR'),
            requiredSignatures: ['Secretário', 'Prefeito'],
            completedSignatures,
            assinaturasStatus, // Adicionar o status das assinaturas ao objeto
            originalData: d
          };
          return mappedDiaria;
        });
        break;
      case 'leis':
        documents = mockLeis.map(l => ({ ...l, type: 'leis' }));
        break;
      case 'editais':
        documents = mockEditais.map(e => ({ ...e, type: 'editais' }));
        break;
      case 'outros':
        documents = mockOutros.map(o => ({ ...o, type: 'outros' }));
        break;
      case 'portarias':
        documents = pendingPortarias.map(p => {
          // Usar as informações de status das assinaturas que vêm da API
          const assinaturasStatus = p.assinaturas_status || {};
          
          // Determinar quais assinaturas estão completas baseado no status da API
          const completedSignatures = [];
          if (assinaturasStatus.prefeito === 'assinada') {
            completedSignatures.push('Prefeito');
          }
          if (assinaturasStatus.secretario === 'assinada') {
            completedSignatures.push('Secretário');
          }
          
          const mappedPortaria = {
            id: p.id,
            number: `${p.numero}/${p.ano}`,
            type: 'portarias',
            server: p.servidor_nome || p.servidor?.nome_completo || 'Não informado',
            title: p.titulo || `${p.tipo_nome || p.tipo_portaria?.nome || 'Tipo não informado'}${p.subtipo_nome ? ` - ${p.subtipo_nome}` : (p.subtipo_documento ? ` - ${p.subtipo_documento.nome}` : '')}`,
            date: new Date(p.data_portaria || p.data_documento).toLocaleDateString('pt-BR'),
            requiredSignatures: ['Secretário', 'Prefeito'],
            completedSignatures,
            assinaturasStatus, // Adicionar o status das assinaturas ao objeto
            originalData: p
          };
          return mappedPortaria;
        });
        break;
    }

    if (!searchTerm) return documents;
    
    const searchLower = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.number.toLowerCase().includes(searchLower) ||
      doc.server.toLowerCase().includes(searchLower) ||
      doc.title.toLowerCase().includes(searchLower)
    );
  };

  // Contar documentos por tipo
  const getDocumentCount = (type: string) => {
    switch (type) {
      case 'documentos':
        return pendingDocumentos.length;
      case 'portarias':
        return pendingPortarias.length;
      case 'decretos':
        return pendingDecretos.length;
      case 'diarias':
        return pendingDiarias.length;
      case 'leis':
        return mockLeis.length;
      case 'editais':
        return mockEditais.length;
      case 'outros':
        return mockOutros.length;
      default:
        return 0;
    }
  };

  // Atualizar assinaturas após operação
  const updateDocumentoSignatures = (documentoId: number, newSignatures: AssinaturaPortaria[]) => {
    setDocumentosSignatures(prev => ({
      ...prev,
      [documentoId]: newSignatures
    }));
  };

  // Batch signing functions - generalized for all document types
  const toggleDocumentSelection = (documentId: number) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const toggleSelectAllDocuments = () => {
    const filteredDocs = getFilteredDocuments();
    if (selectAllDocuments) {
      setSelectedDocuments([]);
      setSelectAllDocuments(false);
    } else {
      const allDocumentIds = filteredDocs.map(d => d.id);
      setSelectedDocuments(allDocumentIds);
      setSelectAllDocuments(true);
    }
  };

  const openBatchSignDialog = () => {
    if (selectedDocuments.length > 0) {
      setIsBatchSignDialogOpen(true);
    }
  };

  const closeBatchSignDialog = () => {
    setIsBatchSignDialogOpen(false);
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
    setSelectAllDocuments(false);
  };

  // Função para obter dados dos documentos selecionados
  const getSelectedDocumentsData = () => {
    const filteredDocs = getFilteredDocuments();
    return filteredDocs.filter(doc => selectedDocuments.includes(doc.id));
  };

  return {
    // States
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentYear,
    setCurrentYear,
    pendingDocumentos,
    pendingPortarias,
    pendingDecretos,
    pendingDiarias,
    documentosSignatures,
    portariasSignatures,
    decretosSignatures,
    diariasSignatures,
    loading,
    error,
    
    // Batch signing states
    selectedPortarias: selectedDocuments, // Mantendo compatibilidade
    selectAllPortarias: selectAllDocuments, // Mantendo compatibilidade
    selectedDocuments,
    selectAllDocuments,
    isBatchSignDialogOpen,
    
    // Functions
    getFilteredDocuments,
    getDocumentCount,
    isSignatureCompleted,
    updateDocumentoSignatures,
    updatePortariaSignatures: updateDocumentoSignatures, // Mantendo compatibilidade
    
    // Batch signing functions
    togglePortariaSelection: toggleDocumentSelection, // Mantendo compatibilidade
    toggleSelectAllPortarias: toggleSelectAllDocuments, // Mantendo compatibilidade
    toggleDocumentSelection,
    toggleSelectAllDocuments,
    openBatchSignDialog,
    closeBatchSignDialog,
    clearSelection,
    getSelectedDocumentsData,
    
    // Data refresh
    refreshData: async () => {
      try {
        const ano = Number(currentYear);
        await fetchByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
        await fetchPortariasByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
        await fetchDecretosByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
        await fetchDiariasByStatus('aguardando_assinatura', isNaN(ano) ? undefined : ano);
        // Limpar seleções após recarregar dados
        setSelectedDocuments([]);
        setSelectAllDocuments(false);
      } catch (err) {
        console.error('Erro ao recarregar dados:', err);
      }
    },
    refreshActiveTabData: async (preserveSelection?: boolean) => {
      try {
        const ano = Number(currentYear);
        const yearParam = isNaN(ano) ? undefined : ano;
        if (activeTab === 'portarias') {
          await fetchPortariasByStatus('aguardando_assinatura', yearParam);
        } else if (activeTab === 'decretos') {
          await fetchDecretosByStatus('aguardando_assinatura', yearParam);
        } else if (activeTab === 'diarias') {
          await fetchDiariasByStatus('aguardando_assinatura', yearParam);
        } else if (activeTab === 'documentos') {
          await fetchByStatus('aguardando_assinatura', yearParam);
        }
        if (!preserveSelection) {
          setSelectedDocuments([]);
          setSelectAllDocuments(false);
        }
      } catch (err) {
        console.error('Erro ao recarregar dados da aba ativa:', err);
      }
    },
    
    // Função para carregar assinaturas sob demanda
    loadSignaturesForDocument
  };
};
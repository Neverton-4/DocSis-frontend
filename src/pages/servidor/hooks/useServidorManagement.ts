import { useState, useEffect, useMemo } from 'react';
import { getProcessosByServidor, ProcessoResumo } from '@/services/processoService';
import { useAuth } from '@/contexts/AuthContext';
import { Processo } from '@/components/CustomerTable';

// Função para converter ProcessoResumo para Processo (formato da CustomerTable)
const convertProcessoToProcesso = (processo: ProcessoResumo): Processo => ({
  id: processo.id,
  numero: processo.numero,
  ano: processo.ano,
  descricao: processo.nome,
  tipo_processo: processo.tipo_processo,
  status: processo.status,
  created_at: processo.created_at,
  nome_interessado: processo.nome_interessado,
  servidor: {
    id: processo.interessado_id || 0,
    nome_completo: processo.nome_interessado || 'N/A',
    matricula: 'N/A',
    cpf: 'N/A'
  }
});

// Mock data para diárias e suprimento de fundos (mantido para demonstração)
const mockRegistrosOutros: RegistroServidor[] = [
  // Diárias
  {
    id: '4',
    protocolo: 'DIAR-2024-001',
    nome: 'Ana Paula Ferreira',
    tipo: 'diarias',
    data: '2024-01-25',
    status: 'aprovado',
    valor: 350.00,
    destino: 'São Paulo - SP',
    periodo: '25/01 a 27/01/2024',
    descricao: 'Participação em curso de capacitação',
    departamento: 'Saúde',
    observacoes: 'Curso obrigatório'
  },
  {
    id: '5',
    protocolo: 'DIAR-2024-002',
    nome: 'Roberto Alves Pereira',
    tipo: 'diarias',
    data: '2024-02-10',
    status: 'em_analise',
    valor: 280.00,
    destino: 'Brasília - DF',
    periodo: '10/02 a 12/02/2024',
    descricao: 'Reunião técnica no Ministério',
    departamento: 'Planejamento',
    observacoes: 'Aguardando autorização'
  },
  {
    id: '6',
    protocolo: 'DIAR-2024-003',
    nome: 'Fernanda Santos Rocha',
    tipo: 'diarias',
    data: '2024-02-15',
    status: 'rejeitado',
    valor: 420.00,
    destino: 'Rio de Janeiro - RJ',
    periodo: '15/02 a 18/02/2024',
    descricao: 'Participação em congresso',
    departamento: 'Cultura',
    observacoes: 'Orçamento insuficiente'
  },
  
  // Suprimento de Fundos
  {
    id: '7',
    protocolo: 'SUPR-2024-001',
    nome: 'Pedro Henrique Silva',
    tipo: 'suprimento',
    data: '2024-01-30',
    status: 'aprovado',
    valor: 1500.00,
    descricao: 'Compra de material de escritório',
    departamento: 'Administração',
    observacoes: 'Material urgente para funcionamento'
  },
  {
    id: '8',
    protocolo: 'SUPR-2024-002',
    nome: 'Lucia Martins Costa',
    tipo: 'suprimento',
    data: '2024-02-05',
    status: 'pendente',
    valor: 800.00,
    descricao: 'Compra de produtos de limpeza',
    departamento: 'Serviços Gerais',
    observacoes: 'Aguardando cotação'
  },
  {
    id: '9',
    protocolo: 'SUPR-2024-003',
    nome: 'Marcos Antonio Souza',
    tipo: 'suprimento',
    data: '2024-02-12',
    status: 'em_analise',
    valor: 2200.00,
    descricao: 'Compra de medicamentos para posto de saúde',
    departamento: 'Saúde',
    observacoes: 'Verificando disponibilidade orçamentária'
  }
];

export const useServidorManagement = () => {
  const { user } = useAuth();
  
  // Estados das abas
  const [activeTab, setActiveTab] = useState<string>('processos');
  
  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Estados dos dados
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Carregar dados baseado na aba ativa
  const fetchProcessos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let novosProcessos: Processo[] = [];
      
      if (activeTab === 'processos') {
        // Carregar processos reais do servidor logado
        if (user?.servidor_id) {
          try {
            const processosData = await getProcessosByServidor(user.servidor_id);
            novosProcessos = processosData.map(convertProcessoToProcesso);
          } catch (err) {
            console.error('Erro ao carregar processos do servidor:', err);
            setError('Erro ao carregar processos do servidor');
            novosProcessos = [];
          }
        } else {
          console.warn('Usuário não possui servidor_id');
          setError('Usuário não está associado a um servidor');
          novosProcessos = [];
        }
      }
      
      setProcessos(novosProcessos);
    } catch (err) {
      setError('Erro ao carregar dados do servidor');
      console.error('Erro ao buscar registros:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização e quando a aba mudar
  useEffect(() => {
    fetchProcessos();
  }, [activeTab, user?.servidor_id]);

  // Função para trocar de aba
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset página ao trocar aba
  };

  // Função para recarregar dados
  const refetch = () => {
    fetchProcessos();
  };

  // Filtrar processos baseado nos filtros ativos
  const filteredProcessos = useMemo(() => {
    const filtered = processos.filter(processo => {
      // Filtro por ano
      const processoYear = new Date(processo.created_at).getFullYear();
      if (processoYear !== selectedYear) return false;
      
      // Filtro por termo de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
          (processo.nome_interessado || '').toLowerCase().includes(searchLower) ||
          processo.descricao.toLowerCase().includes(searchLower) ||
          processo.tipo_processo.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }
      
      return true;
    });

    // Ordenar por ID em ordem decrescente
    return filtered.sort((a, b) => b.id - a.id);
  }, [processos, searchTerm, selectedYear]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredProcessos.length / itemsPerPage);
  const paginatedProcessos = filteredProcessos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    // Tab states
    activeTab,
    handleTabChange,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    
    // Data states
    processos: paginatedProcessos,
    filteredProcessos,
    loading,
    error,
    refetch,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    totalPages
  };
};
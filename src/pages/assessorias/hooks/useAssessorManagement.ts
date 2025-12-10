import { useState, useEffect, useMemo } from 'react';
import { Assessor } from '../components/AssessorTable';

// Mock data para demonstração
const mockAssessores: Assessor[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    numeroDecreto: '001/2024',
    dataNomeacao: '2024-01-15',
    dedicacao: 'Exclusiva',
    indicacao: 'Indicação do Prefeito',
    categoria: 'I',
    ativo: true,
    tipoDecreto: 'Nomeação',
    dataDocumento: '2024-01-15'
  },
  {
    id: '2',
    nome: 'Maria Oliveira Costa',
    numeroDecreto: '002/2024',
    dataNomeacao: '2024-01-20',
    dedicacao: 'Parcial',
    indicacao: 'Concurso Público',
    categoria: 'I',
    ativo: true,
    tipoDecreto: 'Nomeação',
    dataDocumento: '2024-01-20'
  },
  {
    id: '3',
    nome: 'Carlos Eduardo Lima',
    numeroDecreto: '003/2024',
    dataNomeacao: '2024-02-01',
    dedicacao: 'Exclusiva',
    indicacao: 'Transferência',
    categoria: 'II',
    ativo: true,
    tipoDecreto: 'Nomeação',
    dataDocumento: '2024-02-01'
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    numeroDecreto: '004/2024',
    dataNomeacao: '2024-02-10',
    dedicacao: 'Parcial',
    indicacao: 'Processo Seletivo',
    categoria: 'II',
    ativo: true,
    tipoDecreto: 'Nomeação',
    dataDocumento: '2024-02-10'
  },
  {
    id: '5',
    nome: 'Roberto Alves Pereira',
    numeroDecreto: '005/2024',
    dataNomeacao: '2024-02-15',
    dedicacao: 'Exclusiva',
    indicacao: 'Indicação Técnica',
    categoria: 'III',
    ativo: true,
    tipoDecreto: 'Nomeação',
    dataDocumento: '2024-02-15'
  },
  {
    id: '6',
    nome: 'Fernanda Santos Rocha',
    numeroDecreto: '006/2024',
    dataNomeacao: '2024-03-01',
    dedicacao: 'Parcial',
    indicacao: 'Remanejamento',
    categoria: 'III',
    ativo: true,
    tipoDecreto: 'Nomeação',
    dataDocumento: '2024-03-01'
  },
  // Assessores inativos para histórico
  {
    id: '7',
    nome: 'Pedro Henrique Silva',
    numeroDecreto: '010/2023',
    dataNomeacao: '2023-06-15',
    dedicacao: 'Exclusiva',
    indicacao: 'Exoneração',
    categoria: 'I',
    ativo: false,
    tipoDecreto: 'Exoneração',
    dataDocumento: '2023-12-20'
  },
  {
    id: '8',
    nome: 'Luciana Martins Costa',
    numeroDecreto: '011/2023',
    dataNomeacao: '2023-07-01',
    dedicacao: 'Parcial',
    indicacao: 'Aposentadoria',
    categoria: 'II',
    ativo: false,
    tipoDecreto: 'Aposentadoria',
    dataDocumento: '2023-11-30'
  },
  {
    id: '9',
    nome: 'Ricardo Souza Lima',
    numeroDecreto: '012/2023',
    dataNomeacao: '2023-08-10',
    dedicacao: 'Exclusiva',
    indicacao: 'Transferência',
    categoria: 'III',
    ativo: false,
    tipoDecreto: 'Transferência',
    dataDocumento: '2023-10-15'
  }
];

export const useAssessorManagement = () => {
  // Estados das abas
  const [activeTab, setActiveTab] = useState<string>('assessores1');
  
  // Estados dos filtros
  const [viewMode, setViewMode] = useState<'ativos' | 'historico'>('ativos');
  
  // Estados dos dados
  const [assessores, setAssessores] = useState<Assessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carregamento de dados
  const fetchAssessores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssessores(mockAssessores);
    } catch (err) {
      setError('Erro ao carregar dados dos assessores');
      console.error('Erro ao buscar assessores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchAssessores();
  }, []);

  // Função para trocar de aba
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Função para recarregar dados
  const refetch = () => {
    fetchAssessores();
  };

  // Filtrar assessores baseado no modo de visualização
  const filteredAssessores = useMemo(() => {
    return assessores.filter(assessor => {
      if (viewMode === 'ativos') {
        return assessor.ativo;
      }
      return true; // Histórico mostra todos
    });
  }, [assessores, viewMode]);

  return {
    // Tab states
    activeTab,
    handleTabChange,
    
    // Filter states
    viewMode,
    setViewMode,
    
    // Data states
    assessores,
    filteredAssessores,
    loading,
    error,
    refetch
  };
};
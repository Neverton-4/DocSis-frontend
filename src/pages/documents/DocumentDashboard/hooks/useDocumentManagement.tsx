import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePortarias } from '@/hooks/usePortarias';
import { useDecretos } from '@/hooks/useDecretos';
import { useDiarias } from '@/hooks/useDiarias';
import { Portaria } from '@/types';
import { documentoService as portariaService } from '@/services/documentoPortariaService';
import { toast } from 'sonner';

export const useDocumentManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros'>('portarias');

  // Estados para seleção de ano
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  
  // Estados para o modal de criação
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('portarias');
  const [serverName, setServerName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  
  // Hook para carregar portarias - sem carregamento automático
  const { portarias, loading: loadingPortarias, error: errorPortarias, refetch } = usePortarias();
  const { decretos, loading: loadingDecretos, error: errorDecretos, refetch: refetchDecretos } = useDecretos();
  const { diarias, loading: loadingDiarias, error: errorDiarias, refetch: refetchDiarias } = useDiarias();
  
  // Função para mudança de aba
  const handleTabChange = (tab: 'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros') => {
    setActiveTab(tab);
    setCurrentPage(1);
    
    // Atualizar parâmetros de query para manter a aba ativa na URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams);
    
    if (tab === 'portarias') {
      refetch(currentYear);
    }
    if (tab === 'decretos') {
      refetchDecretos(currentYear);
    }
    if (tab === 'diarias') {
      refetchDiarias(currentYear);
    }
  };
  
  // Função para mudança de ano
  const handleYearChange = () => {
    setCurrentYear(selectedYear);
    setIsYearDialogOpen(false);
    refetch(selectedYear);
    refetchDecretos(selectedYear);
    refetchDiarias(selectedYear);
  };

  // Filtrar portarias baseado no termo de busca
  const filteredPortarias = (portarias || []).filter(portaria =>
    portaria.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portaria.servidor?.nome_completo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portaria.tipo_portaria?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portaria.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginação
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPortarias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPortarias = filteredPortarias.slice(startIndex, startIndex + itemsPerPage);

  // Filtrar decretos baseado no termo de busca
  const filteredDecretos = (decretos || []).filter(decreto =>
    (decreto.numero || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (decreto.servidor_nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (decreto.tipo_nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (decreto.status_novo || decreto.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPagesDecretos = Math.ceil(filteredDecretos.length / itemsPerPage);
  const currentDecretos = filteredDecretos.slice(startIndex, startIndex + itemsPerPage);

  // Filtrar diárias baseado no termo de busca
  const filteredDiarias = (diarias || []).filter(diaria =>
    (diaria.numero || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (diaria.servidor?.nome_completo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (diaria.tipo_diaria || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (diaria.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPagesDiarias = Math.ceil(filteredDiarias.length / itemsPerPage);
  const currentDiarias = filteredDiarias.slice(startIndex, startIndex + itemsPerPage);

  // Função para submeter documento
  const handleSubmitDocument = async (data: any) => {
    try {
      // Verificar se os dados da portaria foram fornecidos
      if (!data.portariaData) {
        toast.error('Dados da portaria não fornecidos');
        return;
      }

      // Verificar se o arquivo foi fornecido
      if (!data.file) {
        toast.error('Arquivo DOCX é obrigatório');
        return;
      }

      // Criar a portaria com documento usando a nova rota
      const novaPortaria = await portariaService.createWithDocument(data.portariaData, data.file);
      
      // Resetar o formulário
      setDocumentFile(null);
      setDocumentType('portarias');
      setServerName('');
      setDocumentNumber('');
      setDocumentDate('');
      setIsDialogOpen(false);
      
      // Recarregar a lista após adicionar, mantendo o filtro por ano
      await refetch(currentYear);
      
      toast.success(`Portaria ${novaPortaria.numero}/${novaPortaria.ano} criada com sucesso!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao criar portaria';
      toast.error(errorMessage);
      throw error; // Re-throw para que o DocumentUploadDialog possa lidar com o erro
    }
  };

  // Reset da página quando mudar a busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Carregar portarias quando o componente for montado
  useEffect(() => {
    refetch(currentYear);
    refetchDecretos(currentYear);
    refetchDiarias(currentYear);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Verificar parâmetros de query para definir a aba ativa
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['portarias', 'decretos', 'diarias', 'leis', 'editais', 'outros'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl as 'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros');
    }
  }, [searchParams]);

  return {
    // Search and filter states
    searchQuery,
    setSearchQuery,
    
    // Tab states
    activeTab,
    handleTabChange,
    
    // Year states
    currentYear,
    selectedYear,
    setSelectedYear,
    isYearDialogOpen,
    setIsYearDialogOpen,
    handleYearChange,
    
    // Document upload states
    isDialogOpen,
    setIsDialogOpen,
    documentFile,
    setDocumentFile,
    documentType,
    setDocumentType,
    serverName,
    setServerName,
    documentNumber,
    setDocumentNumber,
    documentDate,
    setDocumentDate,
    handleSubmitDocument,
    
    // Stats states
    showStats,
    setShowStats,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Data states
    portarias,
    filteredPortarias,
    currentPortarias,
    loading: loadingPortarias || loadingDecretos || loadingDiarias,
    error: errorPortarias || errorDecretos || errorDiarias,
    refetch,

    // Decretos
    decretos,
    filteredDecretos,
    currentDecretos,
    totalPagesDecretos,
    refetchDecretos,

    // Diárias
    diarias,
    filteredDiarias,
    currentDiarias,
    totalPagesDiarias,
    refetchDiarias
  };
};
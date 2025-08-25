import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Processo } from '@/components/CustomerTable';

const useDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [yearDialogOpen, setYearDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  // Novo estado para o dialog de seleção de tipo de protocolo
  const [protocolTypeDialogOpen, setProtocolTypeDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchProcessos = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/processos');
        if (!response.ok) {
          throw new Error('Erro ao carregar processos');
        }
        const data = await response.json();
        // Ordenar do mais recente para o mais antigo
        const sortedProcessos = (data.value || data).sort((a: Processo, b: Processo) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setProcessos(sortedProcessos);
      } catch (error) {
        console.error('Erro ao buscar processos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os processos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProcessos();
  }, [toast]);

  // Filter processos based on search query
  const allFilteredProcessos = processos.filter(processo => {
    const searchLower = searchQuery.toLowerCase();
    return (
      processo.descricao?.toLowerCase().includes(searchLower) ||
      processo.tipo_processo?.toLowerCase().includes(searchLower) ||
      processo.servidor?.nome_completo?.toLowerCase().includes(searchLower) ||
      processo.servidor?.matricula?.toLowerCase().includes(searchLower) ||
      processo.servidor?.cpf?.toLowerCase().includes(searchLower) ||
      processo.status?.toLowerCase().includes(searchLower) ||
      processo.id?.toString().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredProcessos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const filteredProcessos = allFilteredProcessos.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleYearChange = async (year: string) => {
    setIsLoading(true);
    try {
      // Simulando uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSelectedYear(year);
      toast({
        title: 'Sucesso',
        description: `Ano alterado para ${year}`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar o ano',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setYearDialogOpen(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    yearDialogOpen,
    setYearDialogOpen,
    selectedYear,
    setSelectedYear,
    isLoading,
    showStats,
    setShowStats,
    processos,
    loading,
    filteredProcessos,
    handleYearChange,
    totalPages,
    // Novos retornos
    protocolTypeDialogOpen,
    setProtocolTypeDialogOpen
  };
};

export default useDashboard;
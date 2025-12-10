import { useState, useEffect } from 'react';
import { ServidorTabela } from '@/types';
import { toast } from 'sonner';
import { buscarServidoresTabela } from '@/services/servidorService';

const useServidoresDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [yearDialogOpen, setYearDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [servidores, setServidores] = useState<ServidorTabela[]>([]);
  const [loading, setLoading] = useState(true);
  // Novo estado para o dialog de seleção de tipo de protocolo
  const [protocolTypeDialogOpen, setProtocolTypeDialogOpen] = useState(false);
  // Novo estado para o dialog de cadastro
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchServidores = async () => {
      try {
        setLoading(true);
        const response = await buscarServidoresTabela();
        if (!response) {
          throw new Error('Erro ao carregar servidores');
        }
        // Ordenar por ID em ordem decrescente (mais recente primeiro)
        const sortedServidores = response.sort((a: ServidorTabela, b: ServidorTabela) => {
          return b.id - a.id;
        });
        setServidores(sortedServidores);
      } catch (error) {
        console.error('Erro ao buscar servidores:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os servidores',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServidores();
  }, [toast]);

  // Filter servidores based on search query
  const allFilteredServidores = servidores.filter(servidor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      servidor.nome_completo?.toLowerCase().includes(searchLower) ||
      servidor.cargo_principal?.toLowerCase().includes(searchLower) ||
      servidor.tipo_servidor?.toLowerCase().includes(searchLower) ||
      servidor.status?.toLowerCase().includes(searchLower) ||
      servidor.secretaria?.toLowerCase().includes(searchLower) ||
      servidor.id?.toString().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(allFilteredServidores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const filteredServidores = allFilteredServidores.slice(startIndex, endIndex);

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
    servidores,
    loading,
    filteredServidores,
    handleYearChange,
    totalPages,
    protocolTypeDialogOpen,
    setProtocolTypeDialogOpen,
    registrationDialogOpen,
    setRegistrationDialogOpen
  };
};

export default useServidoresDashboard;
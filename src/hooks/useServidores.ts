import { useState, useEffect, useMemo, useCallback } from 'react';
import { Servidor, servidorService, StatusServidorEnum, TipoServidorEnum } from '@/services/servidorService';
import { buscarTodosServidores } from '@/services/servidorService';

interface UseServidoresReturn {
  servidores: Servidor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredServidores: Servidor[];
  totalPages: number;
  statusFilter: StatusServidorEnum | 'todos';
  setStatusFilter: (status: StatusServidorEnum | 'todos') => void;
  tipoFilter: TipoServidorEnum | 'todos';
  setTipoFilter: (tipo: TipoServidorEnum | 'todos') => void;
  refreshServidores: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export const useServidores = (): UseServidoresReturn => {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusServidorEnum | 'todos'>('todos');
  const [tipoFilter, setTipoFilter] = useState<TipoServidorEnum | 'todos'>('todos');

  const fetchServidores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buscarTodosServidores();
      setServidores(data);
    } catch (err) {
      console.error('Erro ao buscar servidores:', err);
      setError('Erro ao carregar servidores');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshServidores = useCallback(async () => {
    await fetchServidores();
  }, [fetchServidores]);

  useEffect(() => {
    fetchServidores();
  }, []);

  const filteredServidores = useMemo(() => {
    let filtered = servidores;

    // Filtro por busca (nome ou CPF)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(servidor => 
        servidor.nome_completo.toLowerCase().includes(query) ||
        servidor.cpf.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
        (servidor.email && servidor.email.toLowerCase().includes(query))
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(servidor => servidor.status === statusFilter);
    }

    // Filtro por tipo
    if (tipoFilter !== 'todos') {
      filtered = filtered.filter(servidor => servidor.tipo_servidor === tipoFilter);
    }

    return filtered;
  }, [servidores, searchQuery, statusFilter, tipoFilter]);

  const totalPages = Math.ceil(filteredServidores.length / ITEMS_PER_PAGE);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, tipoFilter]);

  // Servidores paginados
  const paginatedServidores = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredServidores.slice(startIndex, endIndex);
  }, [filteredServidores, currentPage]);

  return {
    servidores: paginatedServidores,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    filteredServidores,
    totalPages,
    statusFilter,
    setStatusFilter,
    tipoFilter,
    setTipoFilter,
    refreshServidores
  };
};

export default useServidores;
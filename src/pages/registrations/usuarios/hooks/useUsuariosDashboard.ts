import { useEffect, useMemo, useState } from 'react';
import usuarioService from '@/services/usuarioService';
import { toast } from 'sonner';

export type UsuarioTabela = {
  id: number;
  nome: string;
  cargo: string;
  secretaria_id: number;
  secretaria_nome: string;
  status: 'ativo' | 'inativo';
};

type SortField = 'nome' | 'cargo' | 'secretaria';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const useUsuariosDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioTabela[]>([]);
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchData = async () => {
    try {
      setLoading(true);
      const usuariosResponse = await usuarioService.getAll();
      setUsuarios(usuariosResponse || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usuariosComSecretaria: UsuarioTabela[] = useMemo(() => {
    return usuarios;
  }, [usuarios]);

  const usuariosFiltradosTodos = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    if (!s) return usuariosComSecretaria;
    return usuariosComSecretaria.filter((u) => {
      return (
        (u.nome || '').toLowerCase().includes(s) ||
        (u.cargo || '').toLowerCase().includes(s) ||
        (u.secretaria_nome || '').toLowerCase().includes(s)
      );
    });
  }, [searchQuery, usuariosComSecretaria]);

  const usuariosOrdenados = useMemo(() => {
    const sorted = [...usuariosFiltradosTodos];
    sorted.sort((a, b) => {
      const getField = (u: UsuarioTabela) => {
        if (sortField === 'nome') return (u.nome || '').toLowerCase();
        if (sortField === 'cargo') return (u.cargo || '').toLowerCase();
        if (sortField === 'secretaria') return (u.secretaria_nome || '').toLowerCase();
        return '';
      };
      const av = getField(a);
      const bv = getField(b);
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [usuariosFiltradosTodos, sortField, sortDirection]);

  const totalPages = Math.ceil(usuariosOrdenados.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const usuariosFiltrados = usuariosOrdenados.slice(startIndex, endIndex);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const refetchUsuarios = async () => {
    await fetchData();
  };

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    usuariosFiltrados,
    loading,
    sortField,
    sortDirection,
    toggleSort,
    refetchUsuarios,
  };
};

export default useUsuariosDashboard;
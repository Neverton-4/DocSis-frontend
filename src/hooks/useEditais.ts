import { useState, useCallback } from 'react';
import { Documento } from '@/types';

// Mock service para editais - substituir por serviço real quando disponível
const editalService = {
  async getAll(ano?: number): Promise<Documento[]> {
    // Mock data para editais
    return [
      {
        id: 1,
        numero: '001/2024',
        nome_servidor: 'Pedro Costa',
        tipo: 'Licitação',
        data_documento: '2024-01-12',
        status: 'Ativo',
        ano: 2024
      },
      {
        id: 2,
        numero: '002/2024',
        nome_servidor: 'Lucia Mendes',
        tipo: 'Concurso Público',
        data_documento: '2024-01-18',
        status: 'Em Andamento',
        ano: 2024
      }
    ];
  },

  async getByStatus(status: string, ano?: number): Promise<Documento[]> {
    const all = await this.getAll(ano);
    return all.filter(edital => edital.status === status);
  }
};

export const useEditais = () => {
  const [editais, setEditais] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await editalService.getAll(ano);
      setEditais(data);
    } catch (err) {
      setError('Erro ao carregar editais');
      console.error('Erro ao carregar editais:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status: string, ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await editalService.getByStatus(status, ano);
      setEditais(data);
    } catch (err) {
      setError('Erro ao carregar editais por status');
      console.error('Erro ao carregar editais por status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    editais,
    loading,
    error,
    refetch,
    fetchByStatus,
  };
};
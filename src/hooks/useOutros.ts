import { useState, useCallback } from 'react';
import { Documento } from '@/types';

// Mock service para outros documentos - substituir por serviço real quando disponível
const outroService = {
  async getAll(ano?: number): Promise<Documento[]> {
    // Mock data para outros documentos
    return [
      {
        id: 1,
        numero: '001/2024',
        nome_servidor: 'Roberto Silva',
        tipo: 'Ofício',
        data_documento: '2024-01-08',
        status: 'Ativo',
        ano: 2024
      },
      {
        id: 2,
        numero: '002/2024',
        nome_servidor: 'Fernanda Costa',
        tipo: 'Memorando',
        data_documento: '2024-01-22',
        status: 'Pendente',
        ano: 2024
      }
    ];
  },

  async getByStatus(status: string, ano?: number): Promise<Documento[]> {
    const all = await this.getAll(ano);
    return all.filter(outro => outro.status === status);
  }
};

export const useOutros = () => {
  const [outros, setOutros] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await outroService.getAll(ano);
      setOutros(data);
    } catch (err) {
      setError('Erro ao carregar outros documentos');
      console.error('Erro ao carregar outros documentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status: string, ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await outroService.getByStatus(status, ano);
      setOutros(data);
    } catch (err) {
      setError('Erro ao carregar outros documentos por status');
      console.error('Erro ao carregar outros documentos por status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    outros,
    loading,
    error,
    refetch,
    fetchByStatus,
  };
};
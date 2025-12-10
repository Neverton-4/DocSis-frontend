import { useState, useCallback } from 'react';
import { Documento } from '@/types';

// Mock service para leis - substituir por serviço real quando disponível
const leiService = {
  async getAll(ano?: number): Promise<Documento[]> {
    // Mock data para leis
    return [
      {
        id: 1,
        numero: '001/2024',
        nome_servidor: 'Carlos Ferreira',
        tipo: 'Lei Ordinária',
        data_documento: '2024-01-10',
        status: 'Ativo',
        ano: 2024
      },
      {
        id: 2,
        numero: '002/2024',
        nome_servidor: 'Ana Oliveira',
        tipo: 'Lei Complementar',
        data_documento: '2024-01-25',
        status: 'Em Tramitação',
        ano: 2024
      }
    ];
  },

  async getByStatus(status: string, ano?: number): Promise<Documento[]> {
    const all = await this.getAll(ano);
    return all.filter(lei => lei.status === status);
  }
};

export const useLeis = () => {
  const [leis, setLeis] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await leiService.getAll(ano);
      setLeis(data);
    } catch (err) {
      setError('Erro ao carregar leis');
      console.error('Erro ao carregar leis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status: string, ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await leiService.getByStatus(status, ano);
      setLeis(data);
    } catch (err) {
      setError('Erro ao carregar leis por status');
      console.error('Erro ao carregar leis por status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    leis,
    loading,
    error,
    refetch,
    fetchByStatus,
  };
};
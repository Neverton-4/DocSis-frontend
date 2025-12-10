import { useState, useCallback } from 'react';
import { decretoService } from '@/services/documentoDecretoService';
import { Documento } from '@/types';

export const useDecretos = () => {
  const [decretos, setDecretos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await decretoService.getAll(ano);
      setDecretos(data);
    } catch (err) {
      setError('Erro ao carregar decretos');
      console.error('Erro ao carregar decretos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status: string, ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await decretoService.getByStatus(status, ano);
      setDecretos(data);
    } catch (err) {
      setError('Erro ao carregar decretos por status');
      console.error('Erro ao carregar decretos por status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    decretos,
    loading,
    error,
    refetch,
    fetchByStatus,
  };
};
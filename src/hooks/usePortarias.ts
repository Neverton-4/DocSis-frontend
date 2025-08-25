import { useState, useEffect } from 'react';
import { portariaService, Portaria } from '@/services/portariaService';

export const usePortarias = () => {
  const [portarias, setPortarias] = useState<Portaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortarias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portariaService.getAll();
      setPortarias(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar portarias');
      console.error('Erro ao buscar portarias:', err);
      setPortarias([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortariasByStatus = async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await portariaService.getByStatus(status);
      setPortarias(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar portarias');
      console.error('Erro ao buscar portarias por status:', err);
      setPortarias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortarias();
  }, []);

  return {
    portarias,
    loading,
    error,
    refetch: fetchPortarias,
    fetchByStatus: fetchPortariasByStatus
  };
};
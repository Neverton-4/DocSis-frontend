import { useState, useCallback } from 'react';
import { diariaService, Diaria } from '@/services/diariaService';

export const useDiarias = () => {
  const [diarias, setDiarias] = useState<Diaria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const params = ano ? { ano } : undefined;
      const data = await diariaService.getAll(params);
      // Garantir que data seja sempre um array
      setDiarias(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar diárias');
      console.error('Erro ao carregar diárias:', err);
      setDiarias([]); // Definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status: string, ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await diariaService.getByStatus(status, ano);
      // Garantir que data seja sempre um array
      setDiarias(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao carregar diárias por status');
      console.error('Erro ao carregar diárias por status:', err);
      setDiarias([]); // Definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      await diariaService.updateStatus(id, status);
      // Atualizar a diária na lista local
      setDiarias(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(diaria => 
          diaria.id === id ? { ...diaria, status } : diaria
        );
      });
    } catch (err) {
      setError('Erro ao atualizar status da diária');
      console.error('Erro ao atualizar status da diária:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDiaria = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await diariaService.delete(id);
      // Remover a diária da lista local
      setDiarias(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(diaria => diaria.id !== id);
      });
    } catch (err) {
      setError('Erro ao excluir diária');
      console.error('Erro ao excluir diária:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    diarias,
    loading,
    error,
    refetch,
    fetchByStatus,
    updateStatus,
    deleteDiaria
  };
};
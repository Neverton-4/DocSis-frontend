import { useState, useCallback } from 'react';
import { assinaturaService, AssinaturaPortaria } from '@/services/assinaturaService';

export const useAssinaturas = () => {
  const [assinaturas, setAssinaturas] = useState<AssinaturaPortaria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assinaturaService.getAll();
      setAssinaturas(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByPortaria = useCallback(async (portariaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assinaturaService.getByPortariaId(portariaId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status: 'pendente' | 'assinada') => {
    setLoading(true);
    setError(null);
    try {
      const data = await assinaturaService.getByStatus(status);
      setAssinaturas(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: number, status: 'pendente' | 'assinada') => {
    setLoading(true);
    setError(null);
    try {
      const updatedAssinatura = await assinaturaService.updateStatus(id, status);
      setAssinaturas(prev => 
        prev.map(a => a.id === id ? updatedAssinatura : a)
      );
      return updatedAssinatura;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPortariaStatus = useCallback(async (portariaId: number) => {
    setLoading(true);
    setError(null);
    try {
      const status = await assinaturaService.checkPortariaSignatureStatus(portariaId);
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assinaturas,
    loading,
    error,
    fetchAll,
    fetchByPortaria,
    fetchByStatus,
    updateStatus,
    checkPortariaStatus
  };
};
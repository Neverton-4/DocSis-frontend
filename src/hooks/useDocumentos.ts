import { useState, useCallback, useEffect } from 'react';
import { documentoService } from '@/services/documentoPortariaService';
import { Documento } from '@/types';

export const useDocumentos = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async (ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentoService.getAll(ano);
      setDocumentos(data);
    } catch (err) {
      setError('Erro ao carregar documentos');
      console.error('Erro ao carregar documentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocumentosByStatus = useCallback(async (status: string, ano?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentoService.getByStatus(status, ano);
      setDocumentos(data);
    } catch (err) {
      setError('Erro ao carregar documentos por status');
      console.error('Erro ao carregar documentos por status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Removido carregamento automático para evitar múltiplas chamadas
  // O carregamento será feito explicitamente pelo componente que usa o hook

  return {
    documentos,
    portarias: documentos, // Alias para compatibilidade
    loading,
    error,
    refetch: fetchDocumentos,
    fetchByStatus: fetchDocumentosByStatus
  };
};
import { useState, useEffect } from 'react';
import { tipoPortariaService, TipoPortaria } from '@/services/tipoPortariaService';
import { subtipoPortariaService, SubtipoPortaria } from '@/services/subtipoPortariaService';

export const useTiposPortaria = () => {
  const [tiposPortaria, setTiposPortaria] = useState<TipoPortaria[]>([]);
  const [subtiposPortaria, setSubtiposPortaria] = useState<SubtipoPortaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubtipos, setLoadingSubtipos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSubtipos, setErrorSubtipos] = useState<string | null>(null);

  const fetchTiposPortaria = async () => {
    try {
      setLoading(true);
      setError(null);
      const tipos = await tipoPortariaService.getAtivos();
      setTiposPortaria(Array.isArray(tipos) ? tipos : []);
    } catch (err) {
      setError('Erro ao carregar tipos de portaria');
      console.error('Erro ao buscar tipos de portaria:', err);
      setTiposPortaria([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtiposByTipo = async (tipoPortariaId: number) => {
    try {
      setLoadingSubtipos(true);
      setErrorSubtipos(null);
      const subtipos = await subtipoPortariaService.getByTipoPortariaId(tipoPortariaId);
      // Garantir que sempre seja um array, mesmo se a API retornar null/undefined
      setSubtiposPortaria(Array.isArray(subtipos) ? subtipos : []);
    } catch (err) {
      setErrorSubtipos('Erro ao carregar subtipos de portaria');
      console.error('Erro ao buscar subtipos de portaria:', err);
      setSubtiposPortaria([]);
    } finally {
      setLoadingSubtipos(false);
    }
  };

  useEffect(() => {
    fetchTiposPortaria();
  }, []);

  return {
    tiposPortaria,
    subtiposPortaria,
    loading,
    loadingSubtipos,
    error,
    errorSubtipos,
    refetch: fetchTiposPortaria,
    fetchSubtiposByTipo
  };
};
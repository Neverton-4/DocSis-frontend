import { useState, useEffect, useCallback, useRef } from 'react';
import { tipoDecretoService, TipoDecreto } from '@/services/tipoDecretoService';
import { subtipoDecretoService, SubtipoDecreto } from '@/services/subtipoDecretoService';

// Cache global para tipos de decreto
let tiposCache: {
  data: TipoDecreto[] | null;
  timestamp: number;
  loading: boolean;
} = {
  data: null,
  timestamp: 0,
  loading: false
};

// Cache para subtipos por tipo
const subtiposCache = new Map<number, {
  data: SubtipoDecreto[];
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const DEBOUNCE_DELAY = 300; // 300ms

export const useOptimizedTiposDecreto = () => {
  const [tiposDecreto, setTiposDecreto] = useState<TipoDecreto[]>([]);
  const [subtiposDecreto, setSubtiposDecreto] = useState<SubtipoDecreto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubtipos, setLoadingSubtipos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSubtipos, setErrorSubtipos] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchTiposDecreto = useCallback(async () => {
    if (tiposCache.loading) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (tiposCache.data) {
        setTiposDecreto(tiposCache.data);
        return;
      }
    }

    if (tiposCache.data && isCacheValid(tiposCache.timestamp)) {
      setTiposDecreto(tiposCache.data);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      tiposCache.loading = true;

      const tipos = await tipoDecretoService.getAll(true);
      const tiposArray = Array.isArray(tipos) ? tipos : [];

      tiposCache = {
        data: tiposArray,
        timestamp: Date.now(),
        loading: false
      };

      setTiposDecreto(tiposArray);
    } catch (err) {
      const errorMessage = 'Erro ao carregar tipos de decreto';
      setError(errorMessage);
      console.error('Erro ao buscar tipos de decreto:', err);
      setTiposDecreto([]);
      tiposCache = { data: null, timestamp: 0, loading: false };
    } finally {
      setLoading(false);
      tiposCache.loading = false;
    }
  }, []);

  const fetchSubtiposByTipo = useCallback(async (tipoDecretoId: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const cached = subtiposCache.get(tipoDecretoId);
      if (cached && isCacheValid(cached.timestamp)) {
        setSubtiposDecreto(cached.data);
        return;
      }

      try {
        setLoadingSubtipos(true);
        setErrorSubtipos(null);
        const subtipos = await subtipoDecretoService.getByTipoId(tipoDecretoId);
        const subtiposArray = Array.isArray(subtipos) ? subtipos : [];
        subtiposCache.set(tipoDecretoId, { data: subtiposArray, timestamp: Date.now() });
        setSubtiposDecreto(subtiposArray);
      } catch (err) {
        const errorMessage = 'Erro ao carregar subtipos de decreto';
        setErrorSubtipos(errorMessage);
        console.error('Erro ao buscar subtipos de decreto:', err);
        setSubtiposDecreto([]);
        subtiposCache.delete(tipoDecretoId);
      } finally {
        setLoadingSubtipos(false);
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const clearCache = useCallback(() => {
    tiposCache = { data: null, timestamp: 0, loading: false };
    subtiposCache.clear();
  }, []);

  useEffect(() => {
    if (tiposCache.data && isCacheValid(tiposCache.timestamp)) {
      setTiposDecreto(tiposCache.data);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    tiposDecreto,
    subtiposDecreto,
    loading,
    loadingSubtipos,
    error,
    errorSubtipos,
    refetch: fetchTiposDecreto,
    fetchSubtiposByTipo,
    clearCache,
  };
};
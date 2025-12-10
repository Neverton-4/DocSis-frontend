import { useState, useEffect, useCallback, useRef } from 'react';
import { tipoPortariaService, TipoPortaria } from '@/services/tipoPortariaService';
import { subtipoPortariaService, SubtipoPortaria } from '@/services/subtipoPortariaService';

// Cache global para tipos de portaria (compartilhado entre instâncias)
let tiposCache: {
  data: TipoPortaria[] | null;
  timestamp: number;
  loading: boolean;
} = {
  data: null,
  timestamp: 0,
  loading: false
};

// Cache para subtipos por tipo (compartilhado entre instâncias)
const subtiposCache = new Map<number, {
  data: SubtipoPortaria[];
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const DEBOUNCE_DELAY = 300; // 300ms

export const useOptimizedTiposPortaria = () => {
  const [tiposPortaria, setTiposPortaria] = useState<TipoPortaria[]>([]);
  const [subtiposPortaria, setSubtiposPortaria] = useState<SubtipoPortaria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubtipos, setLoadingSubtipos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSubtipos, setErrorSubtipos] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Verificar se o cache ainda é válido
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Buscar tipos de portaria com cache
  const fetchTiposPortaria = useCallback(async () => {
    // Se já está carregando globalmente, aguardar
    if (tiposCache.loading) {
      // Aguardar um pouco e verificar novamente
      await new Promise(resolve => setTimeout(resolve, 100));
      if (tiposCache.data) {
        setTiposPortaria(tiposCache.data);
        return;
      }
    }

    // Verificar cache válido
    if (tiposCache.data && isCacheValid(tiposCache.timestamp)) {
      setTiposPortaria(tiposCache.data);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      tiposCache.loading = true;

      const tipos = await tipoPortariaService.getAtivos();
      const tiposArray = Array.isArray(tipos) ? tipos : [];
      
      // Atualizar cache global
      tiposCache = {
        data: tiposArray,
        timestamp: Date.now(),
        loading: false
      };
      
      setTiposPortaria(tiposArray);
    } catch (err) {
      const errorMessage = 'Erro ao carregar tipos de portaria';
      setError(errorMessage);
      console.error('Erro ao buscar tipos de portaria:', err);
      setTiposPortaria([]);
      
      // Resetar cache em caso de erro
      tiposCache = {
        data: null,
        timestamp: 0,
        loading: false
      };
    } finally {
      setLoading(false);
      tiposCache.loading = false;
    }
  }, []);

  // Buscar subtipos com cache e debounce
  const fetchSubtiposByTipo = useCallback(async (tipoPortariaId: number) => {
    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Aplicar debounce
    debounceTimerRef.current = setTimeout(async () => {
      // Verificar cache válido para este tipo
      const cachedSubtipos = subtiposCache.get(tipoPortariaId);
      if (cachedSubtipos && isCacheValid(cachedSubtipos.timestamp)) {
        setSubtiposPortaria(cachedSubtipos.data);
        return;
      }

      try {
        setLoadingSubtipos(true);
        setErrorSubtipos(null);
        
        const subtipos = await subtipoPortariaService.getByTipoPortariaId(tipoPortariaId);
        const subtiposArray = Array.isArray(subtipos) ? subtipos : [];
        
        // Atualizar cache para este tipo
        subtiposCache.set(tipoPortariaId, {
          data: subtiposArray,
          timestamp: Date.now()
        });
        
        setSubtiposPortaria(subtiposArray);
      } catch (err) {
        const errorMessage = 'Erro ao carregar subtipos de portaria';
        setErrorSubtipos(errorMessage);
        console.error('Erro ao buscar subtipos de portaria:', err);
        setSubtiposPortaria([]);
        
        // Remover do cache em caso de erro
        subtiposCache.delete(tipoPortariaId);
      } finally {
        setLoadingSubtipos(false);
      }
    }, DEBOUNCE_DELAY);
  }, []);

  // Limpar cache manualmente (útil para refresh)
  const clearCache = useCallback(() => {
    tiposCache = {
      data: null,
      timestamp: 0,
      loading: false
    };
    subtiposCache.clear();
  }, []);

  // Inicializar com dados do cache se disponível
  useEffect(() => {
    if (tiposCache.data && isCacheValid(tiposCache.timestamp)) {
      setTiposPortaria(tiposCache.data);
    }
  }, []);

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    tiposPortaria,
    subtiposPortaria,
    loading,
    loadingSubtipos,
    error,
    errorSubtipos,
    refetch: fetchTiposPortaria,
    fetchSubtiposByTipo,
    clearCache
  };
};
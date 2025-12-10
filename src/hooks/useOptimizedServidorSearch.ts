import { useState, useCallback, useRef, useEffect } from 'react';
import { buscarServidoresPorNome } from '@/services/servidorService';
import { toast } from 'sonner';

interface Servidor {
  id: number;
  nome_completo: string;
  escola_id?: number;
  [key: string]: any;
}

// Cache para resultados de busca de servidores
const servidoresCache = new Map<string, {
  data: Servidor[];
  timestamp: number;
}>();

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos (menor que tipos/subtipos pois dados podem mudar mais)
const DEBOUNCE_DELAY = 300; // 300ms
const MIN_SEARCH_LENGTH = 3;

export const useOptimizedServidorSearch = () => {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Verificar se o cache ainda é válido
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Normalizar string para busca (remover acentos, converter para lowercase)
  const normalizeSearchTerm = (term: string): string => {
    return term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Buscar servidores com debounce e cache
  const buscarServidores = useCallback(async (nome: string) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validar comprimento mínimo
    if (nome.length < MIN_SEARCH_LENGTH) {
      setServidores([]);
      setShowAutocomplete(false);
      setLoading(false);
      return;
    }

    // Normalizar termo de busca para cache
    const normalizedTerm = normalizeSearchTerm(nome);
    const cacheKey = normalizedTerm;

    // Verificar cache
    const cachedResult = servidoresCache.get(cacheKey);
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      setServidores(cachedResult.data);
      setShowAutocomplete(cachedResult.data.length > 0);
      setLoading(false);
      return;
    }

    // Aplicar debounce
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        
        // Criar novo AbortController para esta requisição
        abortControllerRef.current = new AbortController();
        
        const data = await buscarServidoresPorNome(nome);
        
        // Verificar se a requisição não foi cancelada
        if (!abortControllerRef.current.signal.aborted) {
          const servidoresArray = Array.isArray(data) ? data : [];
          
          // Atualizar cache
          servidoresCache.set(cacheKey, {
            data: servidoresArray,
            timestamp: Date.now()
          });
          
          setServidores(servidoresArray);
          setShowAutocomplete(servidoresArray.length > 0);
        }
      } catch (error: any) {
        // Não mostrar erro se foi cancelamento
        if (error.name !== 'AbortError') {
          console.error('Erro ao buscar servidores:', error);
          toast.error('Erro ao buscar servidores');
          setServidores([]);
          setShowAutocomplete(false);
          
          // Remover do cache em caso de erro
          servidoresCache.delete(cacheKey);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);
  }, []);

  // Selecionar servidor
  const handleServidorSelect = useCallback((servidor: Servidor) => {
    setSelectedServidor(servidor);
    setShowAutocomplete(false);
    setServidores([]);
  }, []);

  // Resetar seleção
  const resetSelection = useCallback(() => {
    setSelectedServidor(null);
    setServidores([]);
    setShowAutocomplete(false);
  }, []);

  // Limpar cache manualmente
  const clearCache = useCallback(() => {
    servidoresCache.clear();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    servidores,
    loading,
    showAutocomplete,
    selectedServidor,
    buscarServidores,
    handleServidorSelect,
    resetSelection,
    clearCache
  };
};
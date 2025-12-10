import { useState, useEffect } from 'react';
import { TipoServidor, TipoServidorSimples } from '@/types/tipoServidor';
import tipoServidorService from '@/services/tipoServidorService';

export const useTiposServidor = () => {
  const [tiposServidor, setTiposServidor] = useState<TipoServidor[]>([]);
  const [tiposServidorSimples, setTiposServidorSimples] = useState<TipoServidorSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarTiposServidor = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tipos, tiposSimples] = await Promise.all([
        tipoServidorService.buscarTiposServidor(),
        tipoServidorService.buscarTiposServidorSimples()
      ]);
      setTiposServidor(tipos);
      setTiposServidorSimples(tiposSimples);
    } catch (err) {
      setError('Erro ao carregar tipos de servidor');
      console.error('Erro ao carregar tipos de servidor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTiposServidor();
  }, []);

  const buscarTipoPorId = (id: number | null): TipoServidorSimples | undefined => {
    if (!id) return undefined;
    return tiposServidorSimples.find(tipo => tipo.id === id);
  };

  const buscarTipoPorCodigo = (codigo: string): TipoServidorSimples | undefined => {
    return tiposServidorSimples.find(tipo => tipo.codigo === codigo);
  };

  return {
    tiposServidor,
    tiposServidorSimples,
    loading,
    error,
    carregarTiposServidor,
    buscarTipoPorId,
    buscarTipoPorCodigo
  };
};

export default useTiposServidor;
import { useState, useCallback } from 'react';
import { portariaService } from '@/services/portariaService';

interface DocumentoPortaria {
  id: number;
  nome: string;
  caminho_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  data_upload: string;
  portaria_id: number;
}

interface PortariaData {
  id: number;
  numero: string;
  ano: number;
  tipo_portaria: {
    nome: string;
  };
  subtipo_portaria?: {
    nome: string;
  };
  servidor: {
    nome_completo: string;
  };
  data_portaria: string;
}

interface PortariaDocumentosResponse {
  portaria: PortariaData;
  documentos: DocumentoPortaria[];
}

export const usePortariaDocumentos = () => {
  const [data, setData] = useState<PortariaDocumentosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async (portariaId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await portariaService.getDocumentos(portariaId);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos da portaria';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchDocumentos
  };
};
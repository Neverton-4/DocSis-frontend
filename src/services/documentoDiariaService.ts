import api from '@/config/api';
import { 
  DocumentoDocumentosCompletosResponse, 
  DocumentoPdfInfoResponse, 
  AnexosDocumentoResponse,
  AnexoDocumento 
} from '@/types/documento';

// Interface para resposta da preparação de assinatura
export interface PrepararAssinaturaResponse {
  success: boolean;
  message: string;
  documento_id: number;
  numero_documento?: string;
  ano_documento?: string;
  pdf_temporario?: string;
  field_name?: string;
  nome_arquivo?: string;
  assinatura_info?: {
    id: number;
    tipo: string;
    nome_assinante: string;
    cargo_assinante: string;
    cpf_assinante: string;
    pagina: number;
    coordenadas: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  };
  texto_assinatura?: string;
  expires_in?: number;
}

export const documentoDiariaService = {
  // 1. Buscar documento da diária com parâmetros
  getDocumentoDocumento: async (
    id: number, 
    download: boolean = false, 
    infoOnly: boolean = false,
    includeThumbnails: boolean = false
  ): Promise<any> => {
    const params = new URLSearchParams();
    
    if (download) params.append('download', 'true');
    if (infoOnly) params.append('info_only', 'true');
    if (includeThumbnails) params.append('include_thumbnails', 'true');
    
    const url = `/diarias/${id}/documento${params.toString() ? '?' + params.toString() : ''}`;
    
    if (infoOnly) {
      const response = await api.get(url);
      return response.data;
    } else {
      const response = await api.get(url, {
        responseType: 'blob'
      });
      return response.data;
    }
  },

  // 2. Obter URL de visualização do anexo
  getDocumentoAnexoView: async (documentoId: number, anexoId: number): Promise<string> => {
    return `${api.defaults.baseURL}/diarias/${documentoId}/anexos/${anexoId}/view`;
  },
  
  // 3. Lista de anexos do documento
  async getAnexosDocumento(id: number): Promise<AnexosDocumentoResponse> {
    const response = await api.get(`/diarias/${id}/anexos`);
    return response.data;
  },

  // 4. Obter anexo específico como Blob
  async getAnexoBlob(documentoId: number, anexoId: number): Promise<Blob> {
    const response = await api.get(`/diarias/${documentoId}/anexos/${anexoId}/download`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // 5. Obter URL de visualização do anexo
  getAnexoViewUrl(documentoId: number, anexoId: number): string {
    return `${api.defaults.baseURL}/diarias/${documentoId}/anexos/${anexoId}/view`;
  },

  // 6. Obter URL de download do anexo
  getAnexoDownloadUrl(documentoId: number, anexoId: number): string {
    return `${api.defaults.baseURL}/diarias/${documentoId}/anexos/${anexoId}/download`;
  },

  // 7. Baixar anexo específico
  async downloadAnexo(documentoId: number, anexoId: number): Promise<Blob> {
    const response = await api.get(
      `/diarias/${documentoId}/anexos/${anexoId}/download`,
      { responseType: "blob" }
    );
    return response.data;
  },

  // 8. Métodos para documentos_diaria (se existirem no backend)
  async verificarDocumentosDisponiveis(diariaId: number): Promise<{
    docx_gerado: boolean;
    docx_enviado: boolean;
    pdf_gerado: boolean;
    pdf_assinado: boolean;
  }> {
    try {
      const response = await api.get(`/documentos-diaria/documento/${diariaId}/disponiveis`);
      return response.data.documentos_disponiveis;
    } catch (error) {
      console.warn('Endpoint de documentos disponíveis não encontrado para diárias:', error);
      // Retorna valores padrão se o endpoint não existir
      return {
        docx_gerado: false,
        docx_enviado: false,
        pdf_gerado: true, // Assumindo que sempre há PDF gerado
        pdf_assinado: false
      };
    }
  },

  async obterDocumentosPorDiaria(diariaId: number): Promise<any[]> {
    try {
      const response = await api.get(`/documentos-diaria/documento/${diariaId}`);
      return response.data;
    } catch (error) {
      console.warn('Endpoint de documentos por diária não encontrado:', error);
      return [];
    }
  },

  async downloadArquivo(documentoId: number, tipoArquivo: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado'): Promise<Blob> {
    try {
      const response = await api.get(`/documentos-diaria/${documentoId}/download/${tipoArquivo}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar arquivo de diária:', error);
      throw error;
    }
  },

  async downloadPdfAssinado(diariaId: number): Promise<Blob> {
    try {
      const response = await api.get(`/documentos-diaria/diarias/${diariaId}/pdf-assinado/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar PDF assinado de diária:', error);
      throw error;
    }
  },

  // 9. Preparar assinatura (se suportado)
  async prepararAssinatura(diariaId: number): Promise<PrepararAssinaturaResponse> {
    try {
      const response = await api.post(`/diarias/${diariaId}/preparar-assinatura`);
      return response.data;
    } catch (error) {
      console.error('Erro ao preparar assinatura de diária:', error);
      throw error;
    }
  },

  // 10. Assinar documento (se suportado)
  async assinarDocumento(diariaId: number, assinaturaData: any): Promise<any> {
    try {
      const response = await api.post(`/diarias/${diariaId}/assinar`, assinaturaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao assinar documento de diária:', error);
      throw error;
    }
  }
};

export default documentoDiariaService;
import api from '@/config/api';

// Interfaces para documentos de documento
export interface DocumentoDocumento {
  id: number;
  documento_id: number;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  docx_gerado?: string;
  docx_enviado?: string;
  pdf_gerado?: string;
  pdf_assinado?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoDocumentoResponse {
  id: number;
  documento_id: number;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  docx_gerado?: string;
  docx_enviado?: string;
  pdf_gerado?: string;
  pdf_assinado?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoDocumentoPdfResponse {
  id: number;
  documento_id: number;
  pdf_path: string;
  nome_arquivo_pdf: string;
  tamanho_pdf: number;
  criado_em: string;
  atualizado_em: string;
}

export interface DocumentosDisponiveisResponse {
  documentos: DocumentoDocumentoResponse[];
  pdfs: DocumentoDocumentoPdfResponse[];
  total_documentos: number;
  total_pdfs: number;
}

export const documentoDocumentoService = {
  /**
   * Lista todos os documentos de um documento específico
   */
  async obterDocumentosPorDocumento(documentoId: number): Promise<DocumentoDocumentoResponse[]> {
    try {
      const response = await api.get(`/documentos-documento/documento/${documentoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar documentos do documento:', error);
      throw error;
    }
  },

  /**
   * Lista todos os PDFs de um documento específico
   */
  async obterDocumentosPdfPorDocumento(documentoId: number): Promise<DocumentoDocumentoPdfResponse[]> {
    try {
      const response = await api.get(`/documentos-documento/documento/${documentoId}/pdfs`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar PDFs do documento:', error);
      throw error;
    }
  },

  /**
   * Obtém todos os documentos disponíveis de um documento (documentos + PDFs)
   */
  async obterDocumentosDisponiveisPorDocumento(documentoId: number): Promise<DocumentosDisponiveisResponse> {
    try {
      const [documentos, pdfs] = await Promise.all([
        this.obterDocumentosPorDocumento(documentoId),
        this.obterDocumentosPdfPorDocumento(documentoId)
      ]);

      return {
        documentos,
        pdfs,
        total_documentos: documentos.length,
        total_pdfs: pdfs.length
      };
    } catch (error) {
      console.error('Erro ao buscar documentos disponíveis do documento:', error);
      throw error;
    }
  },

  /**
   * Faz download de um arquivo específico de um documento de documento
   * @param documentoId ID do documento
   * @param tipoArquivo Tipo do arquivo: 'docx_gerado', 'docx_enviado', 'pdf_gerado'
   */
  async downloadArquivo(documentoId: number, tipoArquivo: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado'): Promise<Blob> {
    try {
      const response = await api.get(`/documentos-documento/${documentoId}/download/${tipoArquivo}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer download do arquivo ${tipoArquivo}:`, error);
      throw error;
    }
  },

  /**
   * Faz download do PDF assinado de um documento
   */
  async downloadPdfAssinado(documentoId: number): Promise<Blob> {
    try {
      const response = await api.get(`/documentos/${documentoId}/documento?download=true`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer download do PDF assinado:', error);
      throw error;
    }
  },

  /**
   * Verifica quais tipos de documentos estão disponíveis para um documento
   */
  async verificarDocumentosDisponiveis(documentoId: number): Promise<{
    docx_gerado: boolean;
    docx_enviado: boolean;
    pdf_gerado: boolean;
    pdf_assinado: boolean;
  }> {
    try {
      const response = await api.get(`/documentos-documento/documento/${documentoId}/disponiveis`);
      return response.data.documentos_disponiveis;
    } catch (error) {
      console.error('Erro ao verificar documentos disponíveis:', error);
      // Em caso de erro, retorna todos como false
      return {
        docx_gerado: false,
        docx_enviado: false,
        pdf_gerado: false,
        pdf_assinado: false
      };
    }
  },

  /**
   * Obtém a URL de visualização de um documento
   */
  getDocumentoViewUrl(documentoId: number, tipoArquivo: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado'): string {
    return `${api.defaults.baseURL}/documentos-documento/${documentoId}/view/${tipoArquivo}`;
  },

  /**
   * Obtém a URL de download de um documento
   */
  getDocumentoDownloadUrl(documentoId: number, tipoArquivo: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado'): string {
    return `${api.defaults.baseURL}/documentos-documento/${documentoId}/download/${tipoArquivo}`;
  },

  /**
   * Obtém a URL de download do PDF assinado
   */
  getPdfAssinadoDownloadUrl(documentoId: number): string {
    return `${api.defaults.baseURL}/documentos-documento/documento/${documentoId}/pdf-assinado/download`;
  },

  // Métodos para anexos
  async getDocumentoById(documentoId: number): Promise<{ data: any }> {
    try {
      const response = await api.get(`/documentos/${documentoId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      throw error;
    }
  },

  async getAnexosDocumento(documentoId: number): Promise<{ data: any[] }> {
    try {
      const response = await api.get(`/anexos-documento/documento/${documentoId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      return { data: [] };
    }
  },

  async uploadAnexo(formData: FormData): Promise<any> {
    try {
      const response = await api.post('/anexos-documento/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do anexo:', error);
      throw error;
    }
  },

  async downloadDocumento(documentoId: number): Promise<Blob> {
    try {
      const response = await api.get(`/documentos-documento/${documentoId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      throw error;
    }
  },

  async downloadAnexo(anexoId: number): Promise<Blob> {
    try {
      const response = await api.get(`/anexos-documento/${anexoId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
      throw error;
    }
  }
};

export default documentoDocumentoService;
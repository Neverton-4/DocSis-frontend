import api from '@/config/api';

export interface DocumentoProtocolo {
  id: number;
  protocolo_id: number;
  nome_arquivo: string;
  arquivo_url: string;
  tamanho: number;
  tipo: string;
  created_at: string;
  updated_at: string;
}

export interface AnexoProtocoloUpload {
  arquivo: File;
  titulo: string;
  protocolo_id: number;
}

class DocumentoProtocoloService {
  // Upload de anexo para processo
  async uploadAnexo(processoId: number, formData: FormData): Promise<any> {
    try {
      const response = await api.post(`/api/processo-anexos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do anexo:', error);
      throw error;
    }
  }

  // Listar documentos de um processo
  async listarDocumentos(processoId: number): Promise<DocumentoProtocolo[]> {
    try {
      const response = await api.get(`/api/processo-documentos/processo/${processoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      throw error;
    }
  }

  // Download de documento específico
  async downloadDocumento(processoId: number, documentoId: number): Promise<Blob> {
    try {
      const response = await api.get(
        `/api/processo-documentos/${documentoId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer download do documento:', error);
      throw error;
    }
  }

  // Deletar documento
  async deletarDocumento(processoId: number, documentoId: number): Promise<void> {
    try {
      await api.delete(`/api/processo-documentos/${documentoId}`);
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  // Upload de documento
  async uploadDocumento(processoId: number, formData: FormData): Promise<DocumentoProtocolo> {
    try {
      const response = await api.post(`/api/processo-documentos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      throw error;
    }
  }
}

export const documentoProtocoloService = new DocumentoProtocoloService();
export default documentoProtocoloService;
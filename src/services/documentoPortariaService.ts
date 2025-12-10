import api from '@/config/api';
import { Documento } from '@/types';
import { 
  DocumentoDocumentosCompletosResponse, 
  DocumentoPdfInfoResponse, 
  AnexosDocumentoResponse,
  AnexoDocumento 
} from '@/types/documento';

// Remover a interface Portaria local
// export interface Portaria {
//   id: number;
//   numero: string;
//   ano: number;
//   data_portaria: string;
//   descricao: string; // Adicionar esta propriedade
//   servidor_id: number;
//   servidor?: {
//     id: number;
//     nome_completo: string;
//     cpf: string;
//   };
//   tipo_portaria_id: number;
//   tipo_portaria?: {
//     id: number;
//     nome: string;
//     descricao?: string;
//   };
//   subtipo_portaria_id?: number;
//   subtipo_portaria?: {
//     id: number;
//     nome: string;
//     tipo_portaria_id: number;
//   };
//   status: 'criado' | 'revisado' | 'aguardando_assinatura' | 'assinado' | 'publicado';
//   observacoes?: string;
//   created_at: string;
//   updated_at: string;
// }

// Interface para o PDF do documento
interface DocumentoPdf {
  id: number;
  documento_id: number;
  pdf_path: string;
  nome_arquivo_pdf: string;
  tamanho_pdf: number;
  criado_em: string;
  atualizado_em: string;
}

// Interface para resposta da preparação de assinatura
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

export const documentoService = {
  async getAll(ano?: number): Promise<Documento[]> {
    const response = await api.get('/portarias', {
      params: ano ? { ano } : {}
    });
    return response.data;
  },

  async getById(id: number): Promise<Documento> {
    const response = await api.get(`/portarias/${id}`);
    return response.data;
  },

  async getByStatus(status: string, ano?: number): Promise<Documento[]> {
    const response = await api.get('/portarias', {
      params: ano ? { status, ano } : { status }
    });
    return response.data;
  },

  async create(documento: Omit<Documento, 'id' | 'created_at' | 'updated_at'>): Promise<Documento> {
    const response = await api.post('/portarias', documento);
    return response.data;
  },

  async createWithDocument(documento: Omit<Documento, 'id' | 'created_at' | 'updated_at'>, arquivo: File): Promise<Documento> {
    const formData = new FormData();
    formData.append('portaria_data', JSON.stringify(documento));
    formData.append('arquivo', arquivo);
    
    const response = await api.post('/portarias/criar-com-documento', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: number, data: Partial<Documento>): Promise<Documento> {
    const response = await api.put(`/portarias/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/portarias/${id}`);
  },

  
  // Novas funções de assinatura
  // Nova função para preparar assinatura do prefeito
  async prepararAssinaturaPrefeito(id: number, servePdf: boolean = false): Promise<PrepararAssinaturaResponse | Blob> {
    const url = `/portarias/${id}/preparar-assinatura-prefeito?serve_pdf=${servePdf}`;
    
    if (servePdf) {
      // Se serve_pdf=true, retorna o PDF como Blob
      const response = await api.post(url, {
        responseType: 'blob'
      });
      return response.data;
    } else {
      // Se serve_pdf=false, retorna as informações de assinatura em JSON
      const response = await api.post(url);
      return response.data;
    }
  },

  // Manter a função original para compatibilidade
  async assinarPrefeito(id: number): Promise<any> {
    const response = await api.post(`/portarias/${id}/assinar-prefeito`);
    return response.data;
  },

  async assinarSecretario(id: number): Promise<any> {
    // Este método não é mais usado - a assinatura do secretário agora usa o Lacuna Web PKI
    // através do lacunaService.signDocumento() com tipo 'secretario'
    throw new Error('Método descontinuado. Use lacunaService.signDocumento() com tipo secretario');
  },

  // 2. Obter apenas informações do PDF (sem o arquivo)
  // Nova função para buscar documento do documento com parâmetros
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
  
  const url = `/portarias/${id}/documento${params.toString() ? '?' + params.toString() : ''}`;
  
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

 


// Adicionar nova função para obter anexo inline
getDocumentoAnexoView: async (documentoId: number, anexoId: number): Promise<string> => {
  return `${api.defaults.baseURL}/portarias/${documentoId}/anexos/${anexoId}/view`;
},
  

  // 4. Lista de anexos do documento
  async getAnexosDocumento(id: number): Promise<AnexosDocumentoResponse> {
    const response = await api.get(`/portarias/${id}/anexos`);
    return response.data;
  },

  // 5. Obter anexo específico como Blob
  async getAnexoBlob(documentoId: number, anexoId: number): Promise<Blob> {
    const response = await api.get(`/portarias/${documentoId}/anexos/${anexoId}/download`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // 6. Obter URL de visualização do anexo
  getAnexoViewUrl(documentoId: number, anexoId: number): string {
    return `${api.defaults.baseURL}/portarias/${documentoId}/anexos/${anexoId}/view`;
  },

  // 7. Obter URL de download do anexo
  getAnexoDownloadUrl(documentoId: number, anexoId: number): string {
    return `${api.defaults.baseURL}/portarias/${documentoId}/anexos/${anexoId}/download`;
  },

  // Baixar anexo específico
  async downloadAnexo(documentoId: number, anexoId: number): Promise<Blob> {
    const response = await api.get(
      `/portarias/${documentoId}/anexos/${anexoId}/download`,
      { responseType: "blob" }
    );
    return response.data;
  },
   

  // Métodos para documentos_portaria
  async verificarDocumentosDisponiveis(portariaId: number): Promise<{
    docx_gerado: boolean;
    docx_enviado: boolean;
    pdf_gerado: boolean;
    pdf_assinado: boolean;
  }> {
    const response = await api.get(`/portarias/${portariaId}/documento-disponiveis`);
    return response.data.documentos_disponiveis;
  },

  async obterDocumentosPorPortaria(portariaId: number): Promise<any[]> {
    const response = await api.get(`/portarias/${portariaId}/documento-listar`);
    return response.data;
  },

  async downloadArquivo(portariaId: number, tipoArquivo: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado' | 'pdf_assinado'): Promise<Blob> {
    const response = await api.get(`/portarias/${portariaId}/download/${tipoArquivo}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async downloadPdfAssinado(portariaId: number): Promise<Blob> {
    return await this.downloadArquivo(portariaId, 'pdf_assinado');
  },

  // Nova função para enviar PDF assinado
  async enviarPdfAssinado(id: number, pdfAssinado: ArrayBuffer, certificateInfo: any): Promise<any> {
    const formData = new FormData();
    const pdfBlob = new Blob([pdfAssinado], { type: 'application/pdf' });
    
    formData.append('pdf_assinado', pdfBlob, `documento_${id}_assinado.pdf`);
    formData.append('certificate_info', JSON.stringify(certificateInfo));
    
    const response = await api.post(`/portarias/${id}/finalizar-assinatura-prefeito`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  // Nova função para assinar prefeito usando número e ano
  async assinarPrefeitoPorNumeroAno(numero: string, ano: string): Promise<PrepararAssinaturaResponse | Blob> {
    const response = await api.post(`/portarias/numero/${numero}/ano/${ano}/assinar-prefeito`);
    return response.data;
  },

  // Nova função para callback de assinatura
  async callbackAssinatura(numero: string, ano: string, pdfAssinado: ArrayBuffer, certificateInfo: any): Promise<any> {
    const formData = new FormData();
    const pdfBlob = new Blob([pdfAssinado], { type: 'application/pdf' });
    
    formData.append('pdf_assinado', pdfBlob, `documento_${numero}_${ano}_assinado.pdf`);
    formData.append('certificate_info', JSON.stringify(certificateInfo));
    
    const response = await api.post(`/portarias/numero/${numero}/ano/${ano}/callback-assinatura`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },


};
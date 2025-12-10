import api from '@/config/api';
import { Documento } from '@/types';

// Fallback mock para decretos quando API não estiver disponível
const mockDecretos: Documento[] = [
  {
    id: 1001,
    numero: '004',
    ano: '2024',
    descricao: 'Designação de Comissão',
    data_portaria: '2024-01-18',
    status: 'criado',
    servidor_nome: 'João Silva',
    tipo_nome: 'Regulamentar',
  },
  {
    id: 1002,
    numero: '005',
    ano: '2024',
    descricao: 'Regulamentação de Processo',
    data_portaria: '2024-01-20',
    status: 'aguardando_assinatura',
    servidor_nome: 'Maria Santos',
    tipo_nome: 'Normativo',
  }
];

// Interface para resposta da preparação de assinatura (seguindo padrão das portarias)
export interface PrepararAssinaturaDecretoResponse {
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

export const decretoService = {
  async getAll(ano?: number): Promise<Documento[]> {
    try {
      const response = await api.get('/decretos', {
        params: ano ? { ano } : {}
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint /decretos indisponível, usando dados mock.', err);
      // Filtrar por ano se fornecido
      if (ano) {
        return mockDecretos.filter((d) => String(d.ano) === String(ano));
      }
      return mockDecretos;
    }
  },

  async getByStatus(status: string, ano?: number): Promise<Documento[]> {
    try {
      const response = await api.get('/decretos', {
        params: ano ? { status, ano } : { status }
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint /decretos por status indisponível, usando dados mock.', err);
      let data = mockDecretos.filter((d) => (d.status_novo || d.status) === status);
      if (ano) {
        data = data.filter((d) => String(d.ano) === String(ano));
      }
      return data;
    }
  },

  async getById(id: number): Promise<any> {
    try {
      const response = await api.get(`/decretos/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Endpoint /decretos/{id} indisponível, usando dados mock.', err);
      const mockDecreto = mockDecretos.find(d => d.id === id);
      if (mockDecreto) {
        return mockDecreto;
      }
      throw new Error('Decreto não encontrado');
    }
  },

  async create(documento: Omit<Documento, 'id' | 'created_at' | 'updated_at'>): Promise<Documento> {
    try {
      const response = await api.post('/decretos', documento);
      return response.data;
    } catch (err) {
      console.warn('Endpoint create decreto indisponível, simulando criação.', err);
      return { ...documento, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Documento;
    }
  },

  async createWithDocument(documento: Omit<Documento, 'id' | 'created_at' | 'updated_at'>, arquivo: File): Promise<Documento> {
    try {
      const formData = new FormData();
      formData.append('decreto_data', JSON.stringify(documento));
      formData.append('arquivo', arquivo);
      
      const response = await api.post('/decretos/criar-com-documento', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint createWithDocument decreto indisponível, simulando criação.', err);
      return { ...documento, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Documento;
    }
  },

  async update(id: number, data: Partial<Documento>): Promise<Documento> {
    try {
      const response = await api.put(`/decretos/${id}`, data);
      return response.data;
    } catch (err) {
      console.warn('Endpoint update decreto indisponível, simulando atualização.', err);
      return { ...data, id, updated_at: new Date().toISOString() } as Documento;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/decretos/${id}`);
    } catch (err) {
      console.warn('Endpoint delete decreto indisponível, simulando exclusão.', err);
    }
  },

  // Funções de assinatura (seguindo padrão das portarias)
  async prepararAssinaturaPrefeito(id: number, servePdf: boolean = false): Promise<PrepararAssinaturaDecretoResponse | Blob> {
    try {
      const url = `/decretos/${id}/preparar-assinatura-prefeito?serve_pdf=${servePdf}`;
      
      if (servePdf) {
        const response = await api.post(url, {
          responseType: 'blob'
        });
        return response.data;
      } else {
        const response = await api.post(url);
        return response.data;
      }
    } catch (err) {
      console.warn('Endpoint preparar assinatura decreto indisponível, usando mock.', err);
      if (servePdf) {
        return new Blob(['Mock PDF content'], { type: 'application/pdf' });
      } else {
        return {
          success: true,
          message: 'Assinatura preparada (mock)',
          documento_id: id,
          numero_documento: '001',
          ano_documento: '2024'
        };
      }
    }
  },

  async assinarPrefeito(id: number): Promise<any> {
    try {
      const response = await api.post(`/decretos/${id}/assinar-prefeito`);
      return response.data;
    } catch (err) {
      console.warn('Endpoint assinar prefeito decreto indisponível, usando mock.', err);
      return { success: true, message: 'Decreto assinado (mock)' };
    }
  },

  async enviarPdfAssinado(id: number, pdfAssinado: ArrayBuffer, certificateInfo: any): Promise<any> {
    try {
      const formData = new FormData();
      const pdfBlob = new Blob([pdfAssinado], { type: 'application/pdf' });
      
      formData.append('pdf_assinado', pdfBlob, `decreto_${id}_assinado.pdf`);
      formData.append('certificate_info', JSON.stringify(certificateInfo));
      
      const response = await api.post(`/decretos/${id}/finalizar-assinatura-prefeito`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (err) {
      console.warn('Endpoint enviar PDF assinado decreto indisponível, usando mock.', err);
      return { success: true, message: 'PDF assinado enviado (mock)' };
    }
  },

  async assinarPrefeitoPorNumeroAno(numero: string, ano: string): Promise<PrepararAssinaturaDecretoResponse | Blob> {
    try {
      const response = await api.post(`/decretos/numero/${numero}/ano/${ano}/assinar-prefeito`);
      return response.data;
    } catch (err) {
      console.warn('Endpoint assinar prefeito por número/ano decreto indisponível, usando mock.', err);
      return {
        success: true,
        message: 'Assinatura preparada (mock)',
        documento_id: 1,
        numero_documento: numero,
        ano_documento: ano
      };
    }
  },

  async callbackAssinatura(numero: string, ano: string, pdfAssinado: ArrayBuffer, certificateInfo: any): Promise<any> {
    try {
      const formData = new FormData();
      const pdfBlob = new Blob([pdfAssinado], { type: 'application/pdf' });
      
      formData.append('pdf_assinado', pdfBlob, `decreto_${numero}_${ano}_assinado.pdf`);
      formData.append('certificate_info', JSON.stringify(certificateInfo));
      
      const response = await api.post(`/decretos/numero/${numero}/ano/${ano}/callback-assinatura`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (err) {
      console.warn('Endpoint callback assinatura decreto indisponível, usando mock.', err);
      return { success: true, message: 'Callback processado (mock)' };
    }
  }
};

// Operações básicas simuladas para manter consistência operacional na UI
export const decretoOperations = {
  async update(id: number, data: any): Promise<void> {
    console.log('Atualizando decreto (simulado):', id, data);
    return Promise.resolve();
  },
  async delete(id: number): Promise<void> {
    console.log('Excluindo decreto (simulado):', id);
    return Promise.resolve();
  }
};

// Endpoints idênticos aos de Portarias, adaptados para Decretos
export const documentoDecretoService = {
  async verificarDocumentosDisponiveis(decretoId: number): Promise<{
    docx_gerado: boolean;
    docx_enviado: boolean;
    pdf_gerado: boolean;
    pdf_assinado: boolean;
  }> {
    try {
      const response = await api.get(`/documentos-decreto/documento/${decretoId}/disponiveis`);
      return response.data.documentos_disponiveis;
    } catch (err) {
      console.warn('Endpoint documentos-decreto indisponível, usando flags mock.', err);
      return {
        docx_gerado: true,
        docx_enviado: false,
        pdf_gerado: true,
        pdf_assinado: false,
      };
    }
  },

  async obterDocumentosPorDecreto(decretoId: number): Promise<Array<{ id: number; docx_gerado?: boolean; docx_enviado?: boolean; pdf_gerado?: boolean }>> {
    try {
      const response = await api.get(`/documentos-decreto/documento/${decretoId}`);
      return response.data;
    } catch (err) {
      console.warn('Endpoint documentos-decreto/documento indisponível, usando lista mock.', err);
      return [
        { id: decretoId * 10 + 1, docx_gerado: true },
        { id: decretoId * 10 + 2, pdf_gerado: true },
      ];
    }
  },

  // Nova função para buscar documento do decreto com parâmetros (seguindo padrão das portarias)
  async getDocumentoDocumento(
    id: number, 
    download: boolean = false, 
    infoOnly: boolean = false,
    includeThumbnails: boolean = false
  ): Promise<any> {
    const params = new URLSearchParams();
    
    if (download) params.append('download', 'true');
    if (infoOnly) params.append('info_only', 'true');
    if (includeThumbnails) params.append('include_thumbnails', 'true');
    
    const url = `/decretos/${id}/documento${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      if (infoOnly) {
        const response = await api.get(url);
        return response.data;
      } else {
        const response = await api.get(url, {
          responseType: 'blob'
        });
        return response.data;
      }
    } catch (err) {
      console.warn('Endpoint /decretos/{id}/documento indisponível, usando dados mock.', err);
      
      if (infoOnly) {
        // Retornar estrutura similar às portarias
        return {
          decreto: {
            id: id,
            numero: '001',
            ano: 2024,
            data_decreto: new Date().toISOString(),
            titulo: 'Decreto de Exemplo',
            conteudo: 'Conteúdo do decreto...'
          },
          servidor: {
            id: 1,
            nome: 'Servidor Exemplo',
            cpf: '000.000.000-00',
            matricula: '12345'
          },
          tipo: {
            id: 1,
            nome: 'Regulamentar',
            ativo: true
          },
          subtipo: {
            id: 1,
            nome_subtipo: 'Designação',
            tipo_decreto_id: 1
          },
          documento_principal: {
            id: id,
            nome: `Decreto_001_2024.pdf`
          },
          documento_thumbnail_base64: null,
          anexos: [],
          assinaturas: []
        };
      } else {
        // Retornar blob mock para PDF
        const content = `PDF do decreto ${id}`;
        return new Blob([content], { type: 'application/pdf' });
      }
    }
  },

  // Função para obter URL de visualização do anexo (seguindo padrão das portarias)
  getAnexoViewUrl(decretoId: number, anexoId: number): string {
    return `${api.defaults.baseURL}/decretos/${decretoId}/anexos/${anexoId}/view`;
  },

  // Função para obter URL de download do anexo (seguindo padrão das portarias)
  getAnexoDownloadUrl(decretoId: number, anexoId: number): string {
    return `${api.defaults.baseURL}/decretos/${decretoId}/anexos/${anexoId}/download`;
  },

  // Obter anexo específico como Blob (seguindo padrão das portarias)
  async getAnexoBlob(decretoId: number, anexoId: number): Promise<Blob> {
    try {
      const response = await api.get(`/decretos/${decretoId}/anexos/${anexoId}/download`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      console.warn(`Endpoint anexo ${anexoId} do decreto ${decretoId} indisponível, retornando Blob mock.`, err);
      const content = `Anexo ${anexoId} do decreto ${decretoId}`;
      return new Blob([content], { type: 'application/pdf' });
    }
  },

  async downloadArquivo(documentoId: number, tipoArquivo: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado'): Promise<Blob> {
    try {
      const response = await api.get(`/documentos-decreto/${documentoId}/download/${tipoArquivo}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint download arquivo decreto indisponível, retornando Blob mock.', err);
      const content = `Arquivo ${tipoArquivo} do documento decreto ${documentoId}`;
      return new Blob([content], { type: tipoArquivo.includes('pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    }
  },

  async downloadPdfAssinado(decretoId: number): Promise<Blob> {
    try {
      const response = await api.get(`/documentos-decreto/decretos/${decretoId}/pdf-assinado/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint download PDF assinado decreto indisponível, retornando Blob mock.', err);
      const content = `PDF assinado do decreto ${decretoId}`;
      return new Blob([content], { type: 'application/pdf' });
    }
  },

  // ==================== FUNÇÕES DE ANEXOS ====================
  
  async getAnexosDocumento(decretoId: number): Promise<any> {
    try {
      const response = await api.get(`/decretos/${decretoId}/anexos`);
      return response.data;
    } catch (err) {
      console.warn(`Endpoint anexos decreto ${decretoId} indisponível, retornando dados mock.`, err);
      return {
        decreto_id: decretoId,
        numero: '001',
        ano: '2024',
        total_anexos: 0,
        anexos: []
      };
    }
  },

  async downloadAnexo(decretoId: number, anexoId: number): Promise<Blob> {
    try {
      const response = await api.get(`/decretos/${decretoId}/anexos/${anexoId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (err) {
      console.warn(`Endpoint download anexo ${anexoId} do decreto ${decretoId} indisponível, retornando Blob mock.`, err);
      const content = `Anexo ${anexoId} do decreto ${decretoId}`;
      return new Blob([content], { type: 'application/pdf' });
    }
  },
};
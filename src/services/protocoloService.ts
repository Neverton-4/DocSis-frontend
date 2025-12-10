import api from '@/config/api';

export interface Protocolo {
  id: number;
  fullName: string;
  cpf: string;
  logradouro: string;
  bairro: string;
  numero: string;
  cidade: string;
  uf: string;
  tipoServidor: string;
  secretaria: string;
  contato: string;
  email: string;
  dateOfBirth: string;
  tipoProcesso: string;
  tipoProcessoOutro?: string;
  status: string;
  cargo: string;
  created_at: string;
  updated_at: string;
}

export const getProtocoloById = async (id: number): Promise<Protocolo> => {
  const response = await api.get(`/processos/${id}`);
  return response.data;
};

export const getAllProtocolos = async (): Promise<Protocolo[]> => {
  const response = await api.get(`/processos`);
  return response.data;
};

export const createProtocolo = async (protocolo: Omit<Protocolo, 'id' | 'created_at' | 'updated_at'>): Promise<Protocolo> => {
  const response = await api.post(`/processos`, protocolo);
  return response.data;
};

export const updateProtocolo = async (id: number, protocolo: Partial<Protocolo>): Promise<Protocolo> => {
  const response = await api.put(`/processos/${id}`, protocolo);
  return response.data;
};

export const deleteProtocolo = async (id: number): Promise<void> => {
  await api.delete(`/processos/${id}`);
};

export const getComprovanteHTML = async (id: string) => {
  const response = await api.get(`/processos/${id}/comprovante`, {
    headers: { Accept: 'text/html' }
  });
  return response.data;
};

// Classe de serviço para compatibilidade com o código existente
class ProtocoloService {
  async getById(id: number): Promise<Protocolo> {
    return getProtocoloById(id);
  }

  async getProtocoloDocumento(id: number, download: boolean = false, thumbnails: boolean = false, includeAnexos: boolean = false): Promise<any> {
    const params = new URLSearchParams();
    if (download) params.append('download', 'true');
    if (thumbnails) params.append('thumbnails', 'true');
    if (includeAnexos) params.append('include_anexos', 'true');

    const queryString = params.toString();
    const url = `/processos/${id}/documento${queryString ? `?${queryString}` : ''}`;

    if (download || (!thumbnails && !includeAnexos)) {
      // Retorna blob para download ou visualização
      const response = await api.get(url, { responseType: 'blob' });
      return response.data;
    } else {
      // Retorna JSON com informações e thumbnails
      const response = await api.get(url);
      return response.data;
    }
  }

  async getAnexosProtocolo(id: number): Promise<any> {
    const response = await api.get(`/processos/${id}/documento?thumbnails=true`);
    return response.data.anexos || [];
  }

  async downloadAnexo(protocoloId: number, anexoId: number): Promise<Blob> {
    const response = await api.get(
      `/processos/${protocoloId}/anexos/${anexoId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async uploadAnexo(protocoloId: number, formData: FormData): Promise<any> {
    const response = await api.post(`/processo-anexos/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}

// Instância do serviço para compatibilidade
export const protocoloService = new ProtocoloService();
export default protocoloService;

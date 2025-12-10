import api from '@/config/api';

export interface ProcessoAnexo {
  id: number;
  processo_id: number;
  usuario_id: number;
  nome_arquivo: string;
  caminho_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
  created_at: string;
}

export interface ProcessoAnexoCreate {
  processo_id: number;
  usuario_id: number;
  nome_arquivo: string;
  caminho_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number;
}

export interface ProcessoAnexoUpdate {
  nome_arquivo?: string;
}

export const listarAnexos = async (processoId: number): Promise<ProcessoAnexo[]> => {
  const response = await api.get(`/processos/${processoId}/anexos`);
  return response.data;
};

export const uploadAnexo = async (processoId: number, usuarioId: number, arquivo: File): Promise<ProcessoAnexo> => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('usuario_id', usuarioId.toString());
  
  const response = await api.post(`/processos/${processoId}/anexos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const obterAnexo = async (anexoId: number): Promise<ProcessoAnexo> => {
  const response = await api.get(`/anexos/${anexoId}`);
  return response.data;
};

export const atualizarAnexo = async (anexoId: number, data: ProcessoAnexoUpdate): Promise<ProcessoAnexo> => {
  const response = await api.put(`/anexos/${anexoId}`, data);
  return response.data;
};

export const deletarAnexo = async (anexoId: number): Promise<void> => {
  await api.delete(`/anexos/${anexoId}`);
};

export const downloadAnexo = async (anexoId: number): Promise<Blob> => {
  const response = await api.get(`/anexos/${anexoId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
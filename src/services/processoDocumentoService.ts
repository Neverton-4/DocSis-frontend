import api from '@/config/api';

export interface ProcessoDocumento {
  id: number;
  processo_id: number;
  usuario_id: number;
  departamento_id: number;
  departamento_nome?: string; // Campo adicionado para dados consolidados
  nome_arquivo: string;
  docx_gerado?: string;
  docx_enviado?: string;
  pdf_gerado?: string;
  pdf_enviado?: string;
  pdf_assinado?: string;
  thumbnail?: string;
  created_at: string;
}

export interface ProcessoDocumentoCreate {
  processo_id: number;
  usuario_id: number;
  departamento_id: number;
  nome_arquivo: string;
  docx_gerado?: string;
  docx_enviado?: string;
  pdf_gerado?: string;
  pdf_enviado?: string;
  pdf_assinado?: string;
  thumbnail?: string;
}

export interface ProcessoDocumentoUpdate {
  departamento_id?: number;
  nome_arquivo?: string;
  docx_gerado?: string;
  docx_enviado?: string;
  pdf_gerado?: string;
  pdf_enviado?: string;
  pdf_assinado?: string;
  thumbnail?: string;
}

export const listarDocumentos = async (processoId: number): Promise<ProcessoDocumento[]> => {
  const response = await api.get(`/processos/${processoId}/documentos`);
  return response.data;
};

export const uploadDocumento = async (processoId: number, usuarioId: number, departamentoId: number, arquivo: File): Promise<ProcessoDocumento> => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  formData.append('usuario_id', usuarioId.toString());
  formData.append('departamento_id', departamentoId.toString());
  
  const response = await api.post(`/processos/${processoId}/documentos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const atualizarDocumento = async (documentoId: number, data: ProcessoDocumentoUpdate): Promise<ProcessoDocumento> => {
  const response = await api.put(`/documentos/${documentoId}`, data);
  return response.data;
};

export const deletarDocumento = async (documentoId: number): Promise<void> => {
  await api.delete(`/documentos/${documentoId}`);
};
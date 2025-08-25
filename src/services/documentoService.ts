import api from '@/config/api';

export interface Documento {
  id: number;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  processo_id: number;
  departamento_id?: number;
  departamento?: {
    id: number;
    nome: string;
  };
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentoUpload {
  file: File;
  processo_id: number;
  departamento_id?: number;
}

// Buscar documentos por processo
export const getDocumentosByProcessoId = async (processoId: number): Promise<Documento[]> => {
  try {
    const response = await api.get(`/processos/${processoId}/documentos`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    throw error;
  }
};

// Buscar documentos por departamento
export const getDocumentosByDepartamento = async (
  processoId: number, 
  departamentoId: number
): Promise<Documento[]> => {
  try {
    const response = await api.get(`/processo/${processoId}/departamento/${departamentoId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar documentos por departamento:', error);
    throw error;
  }
};

// Upload de documento
export const uploadDocumento = async (documentoData: DocumentoUpload): Promise<Documento> => {
  try {
    const formData = new FormData();
    formData.append('file', documentoData.file);
    formData.append('processo_id', documentoData.processo_id.toString());
    
    if (documentoData.departamento_id) {
      formData.append('departamento_id', documentoData.departamento_id.toString());
    }

    const response = await api.post('/documentos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    throw error;
  }
};

// Deletar documento
export const deleteDocumento = async (documentoId: number): Promise<void> => {
  try {
    await api.delete(`/documentos/${documentoId}`);
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
};

// Download de documento
export const downloadDocumento = async (documentoId: number): Promise<Blob> => {
  try {
    const response = await api.get(`/documentos/${documentoId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer download do documento:', error);
    throw error;
  }
};

// Visualizar documento (para PDFs e imagens)
export const getDocumentoUrl = (documentoId: number): string => {
  return `${api.defaults.baseURL}/documentos/${documentoId}/view`;
};


// import axios from 'axios';
// const API_URL = 'http://localhost:8000/api';


// export interface Documento {
//   id: number;
//   processo_id: number;
//   nome: string;
//   tipo: string;
//   url: string;
//   created_at: string;
// }

// export const getDocumentosByProcesso = async (processoId: number): Promise<Documento[]> => {
//   const response = await axios.get(`${API_URL}/processos/${processoId}/documentos`);
//   return response.data;
// };

// export const uploadDocumento = async (processoId: number, file: File): Promise<Documento> => {
//   const formData = new FormData();
//   formData.append('arquivo', file);

//   const response = await axios.post(`${API_URL}/processos/${processoId}/documentos`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     }
//   });

//   return response.data;
// };

// export const deleteDocumento = async (documentoId: number): Promise<void> => {
//   await axios.delete(`${API_URL}/documentos/${documentoId}`);
// };
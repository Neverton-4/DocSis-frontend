import api from '@/config/api';

export interface Processo {
  id: number;
  tipo_processo: string;
  nome: string;
  detalhes?: string;
  status: string;
  created_at: string;
  servidor: {
    id: number;
    matricula: string;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    sexo: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    contato?: string;
    email?: string;
    tipo_servidor: string;
    cargo: string;
    lotacao: string;
    data_admissao?: string;
    status: string;
    observacoes?: string;
  };
}

export const getProcessoById = async (id: number): Promise<Processo> => {
  const response = await api.get(`/processos/${id}`);
  return response.data;
};

export const updateProcesso = async (id: number, data: Partial<Processo>): Promise<Processo> => {
  const response = await api.put(`/processos/${id}`, data);
  return response.data;
}; 

export const createProcesso = async (data: any): Promise<{ protocolo: string }> => {
  const response = await api.post(`/processos/`, data);
  return response.data;
};

export const getComprovanteHTML = async (protocolo: string): Promise<string> => {
  const response = await api.get(`/processos/${protocolo}/comprovante`);
  return response.data;
};

export const getComprovanteURL = (protocolo: string): string => {
  return `${api.defaults.baseURL}/processos/${protocolo}/comprovante`;
};
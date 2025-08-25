import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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
  const response = await axios.get(`${API_URL}/protocolos/${id}`);
  return response.data;
};

export const updateProtocolo = async (id: number, data: Partial<Protocolo>): Promise<Protocolo> => {
  const response = await axios.put(`${API_URL}/protocolos/${id}`, data);
  return response.data;
}; 

export const getComprovanteHTML = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}/comprovante-html`, {
    headers: { Accept: 'text/html' }
  });
  return response.data;
};

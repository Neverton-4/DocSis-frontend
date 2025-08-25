import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface TipoProcesso {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'licenca' | 'gratificacao' | 'declaracao' | 'outro';
  campos_extras: any;
  created_at: string;
}

export const tipoProcessoService = {
  async getAll(): Promise<TipoProcesso[]> {
    const response = await axios.get(`${API_URL}/tipos-processos`);
    return response.data;
  },

  async getById(id: number): Promise<TipoProcesso> {
    const response = await axios.get(`${API_URL}/tipos-processos/${id}`);
    return response.data;
  },

  async create(tipoProcesso: Omit<TipoProcesso, 'id' | 'created_at'>): Promise<TipoProcesso> {
    const response = await axios.post(`${API_URL}/tipos-processos`, tipoProcesso);
    return response.data;
  },

  async update(id: number, data: Omit<TipoProcesso, 'id' | 'created_at'>): Promise<TipoProcesso> {
    const response = await axios.put(`${API_URL}/tipos-processos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/tipos-processos/${id}`);
  }
};
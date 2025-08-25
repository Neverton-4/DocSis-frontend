import api from '@/config/api';

export interface TipoPortaria {
  id: number;
  nome: string;
  descricao?: string;
  coletiva: boolean;
  exige_cargo: boolean;
  exige_escola: boolean;
  ativo: boolean;
}

export const tipoPortariaService = {
  async getAll(): Promise<TipoPortaria[]> {
    const response = await api.get('/tipos-portaria');
    return response.data;
  },

  async getById(id: number): Promise<TipoPortaria> {
    const response = await api.get(`/tipos-portaria/${id}`);
    return response.data;
  },

  async getAtivos(): Promise<TipoPortaria[]> {
    const response = await api.get('/tipos-portaria?ativo=true');
    return response.data;
  },

  async create(tipoPortaria: Omit<TipoPortaria, 'id'>): Promise<TipoPortaria> {
    const response = await api.post('/tipos-portaria', tipoPortaria);
    return response.data;
  },

  async update(id: number, data: Partial<TipoPortaria>): Promise<TipoPortaria> {
    const response = await api.put(`/tipos-portaria/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tipos-portaria/${id}`);
  }
};
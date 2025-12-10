import api from '@/config/api';

export interface SubtipoProcesso {
  id: number;
  tipo_id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  campos_extras?: any;
  created_at: string;
}

export const subtipoProcessoService = {
  async getAll(params?: { tipo_id?: number; ativo?: boolean }): Promise<SubtipoProcesso[]> {
    const queryParams = new URLSearchParams();
    if (params?.tipo_id) {
      queryParams.append('tipo_id', params.tipo_id.toString());
    }
    if (params?.ativo !== undefined) {
      queryParams.append('ativo', params.ativo.toString());
    }
    
    const url = `/subtipos-processos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  async getByTipoId(tipoId: number): Promise<SubtipoProcesso[]> {
    const response = await api.get(`/tipos-processos/${tipoId}/subtipos`);
    return response.data;
  },

  async getById(id: number): Promise<SubtipoProcesso> {
    const response = await api.get(`/subtipos-processos/${id}`);
    return response.data;
  },

  async create(subtipo: Omit<SubtipoProcesso, 'id' | 'created_at'>): Promise<SubtipoProcesso> {
    const response = await api.post(`/subtipos-processos`, subtipo);
    return response.data;
  },

  async update(id: number, data: Omit<SubtipoProcesso, 'id' | 'created_at'>): Promise<SubtipoProcesso> {
    const response = await api.put(`/subtipos-processos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/subtipos-processos/${id}`);
  }
};
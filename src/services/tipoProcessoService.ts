import api from '@/config/api';

export interface TipoProcesso {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'licenca' | 'gratificacao' | 'declaracao' | 'outro';
  campos_extras: any;
  cidadao: boolean;
  created_at: string;
}

export const tipoProcessoService = {
  async getAll(params?: { iniciador_tipo?: string }): Promise<TipoProcesso[]> {
    const queryParams = new URLSearchParams();
    if (params?.iniciador_tipo) {
      queryParams.append('iniciador_tipo', params.iniciador_tipo);
    }
    
    const url = `/tipos-processos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  async getById(id: number): Promise<TipoProcesso> {
    const response = await api.get(`/tipos-processos/${id}`);
    return response.data;
  },

  async create(tipoProcesso: Omit<TipoProcesso, 'id' | 'created_at'>): Promise<TipoProcesso> {
    const response = await api.post(`/tipos-processos`, tipoProcesso);
    return response.data;
  },

  async update(id: number, data: Omit<TipoProcesso, 'id' | 'created_at'>): Promise<TipoProcesso> {
    const response = await api.put(`/tipos-processos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tipos-processos/${id}`);
  }
};
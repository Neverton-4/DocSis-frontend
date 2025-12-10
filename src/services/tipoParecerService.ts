import api from '@/config/api';

export interface TipoParecer {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'licenca' | 'gratificacao' | 'outro';
  parecer: boolean;
  created_at: string;
}

export const tipoParecerService = {
  async getAll(): Promise<TipoParecer[]> {
    try {
      const response = await api.get(`/tipos-parecer`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de parecer:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<TipoParecer> {
    try {
      const response = await api.get(`/tipos-parecer/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipo de parecer:', error);
      throw error;
    }
  }
};
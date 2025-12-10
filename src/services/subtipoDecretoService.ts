import api from '@/config/api';

export interface SubtipoDecreto {
  id: number;
  tipo_decreto_id: number;
  nome_subtipo: string;
}

export const subtipoDecretoService = {
  async getByTipoId(tipoId: number): Promise<SubtipoDecreto[]> {
    try {
      const response = await api.get(`/decretos/tipos/${tipoId}/subtipos`);
      return response.data;
    } catch (err) {
      console.warn('Endpoint /decretos/tipos/{id}/subtipos indisponível, retornando lista vazia:', err);
      return [];
    }
  },
  async getAll(params?: { tipo_decreto_id?: number }): Promise<SubtipoDecreto[]> {
    try {
      const response = await api.get('/decretos/subtipos', {
        params: params || {}
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint /decretos/subtipos indisponível, retornando lista vazia:', err);
      return [];
    }
  }
};
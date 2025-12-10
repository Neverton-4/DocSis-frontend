import api from '@/config/api';

export interface SubtipoPortaria {
  id: number;
  tipo_portaria_id: number;
  nome_subtipo: string;
}

export const subtipoPortariaService = {
  async getAll(): Promise<SubtipoPortaria[]> {
    try {
      const response = await api.get('/subtipos-portaria');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Erro ao buscar todos os subtipos:', error);
      return [];
    }
  },

  async getByTipoPortariaId(tipoPortariaId: number): Promise<SubtipoPortaria[]> {
    try {
      console.log('🌐 Fazendo requisição para:', `/portarias/tipos/${tipoPortariaId}/subtipos`);
      // Usar a nova rota específica /portarias/tipos/{id}/subtipos
      const response = await api.get(`/portarias/tipos/${tipoPortariaId}/subtipos`);
      console.log('📡 Resposta da API:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Erro ao buscar subtipos por tipo:', error);
      // Retornar array vazio em caso de erro (pode ser que não existam subtipos)
      return [];
    }
  },

  async getById(id: number): Promise<SubtipoPortaria | null> {
    try {
      const response = await api.get(`/subtipos-portaria/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar subtipo por ID:', error);
      return null;
    }
  },

  async create(subtipoPortaria: Omit<SubtipoPortaria, 'id'>): Promise<SubtipoPortaria> {
    const response = await api.post('/subtipos-portaria', subtipoPortaria);
    return response.data;
  },

  async update(id: number, data: Partial<SubtipoPortaria>): Promise<SubtipoPortaria> {
    const response = await api.put(`/subtipos-portaria/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/subtipos-portaria/${id}`);
  }
};
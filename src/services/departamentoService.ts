import api from '@/config/api';
import { Departamento } from '@/types';

// Função para salvar (criar ou atualizar) departamento
export const salvarDepartamento = async (departamento: Omit<Departamento, 'id' | 'created_at' | 'updated_at'> | (Departamento & { id: number })): Promise<Departamento> => {
  try {
    let response;
    if ('id' in departamento && departamento.id) {
      // Atualizar departamento existente
      response = await api.put(`/departamentos/${departamento.id}`, departamento);
    } else {
      // Criar novo departamento
      response = await api.post('/departamentos', departamento);
    }
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar departamento:', error);
    throw error;
  }
};

export const departamentoService = {
  async getAll(): Promise<Departamento[]> {
    const response = await api.get('/departamentos');
    return response.data;
  },

  async getById(id: number): Promise<Departamento> {
    const response = await api.get(`/departamentos/${id}`);
    return response.data;
  }
};
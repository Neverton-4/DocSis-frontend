import api from '@/config/api';
import { Departamento } from '@/types';

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
import api from '../config/api';
import { AcaoDepartamento } from '../types';

export const acaoDepartamentoService = {
    async getAll(): Promise<AcaoDepartamento[]> {
        const response = await api.get('/acoes-departamento');
        return response.data;
    },

    async getByDepartamento(departamentoId: number): Promise<AcaoDepartamento[]> {
        const response = await api.get(`/acoes-departamento/departamento/${departamentoId}`);
        return response.data;
    },

    async getById(id: number): Promise<AcaoDepartamento> {
        const response = await api.get(`/acoes-departamento/${id}`);
        return response.data;
    },

    async create(acao: Omit<AcaoDepartamento, 'id' | 'created_at'>): Promise<AcaoDepartamento> {
        const response = await api.post('/acoes-departamento', acao);
        return response.data;
    },

    async update(id: number, acao: Partial<AcaoDepartamento>): Promise<AcaoDepartamento> {
        const response = await api.put(`/acoes-departamento/${id}`, acao);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/acoes-departamento/${id}`);
    }
}; 
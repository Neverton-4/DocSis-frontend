import api from '../config/api';
import { Modelo } from '../types';

export const modeloService = {
    async getAll(): Promise<Modelo[]> {
        const response = await api.get('/modelos');
        return response.data;
    },

    async getByDepartamento(departamentoId: number): Promise<Modelo[]> {
        const response = await api.get(`/modelos/departamento/${departamentoId}`);
        return response.data;
    },

    async getByTipoProcesso(tipoProcessoId: number): Promise<Modelo[]> {
        const response = await api.get(`/modelos/tipo-processo/${tipoProcessoId}`);
        return response.data;
    },

    async getById(id: number): Promise<Modelo> {
        const response = await api.get(`/modelos/${id}`);
        return response.data;
    },

    async create(modelo: Omit<Modelo, 'id' | 'created_at'>): Promise<Modelo> {
        const response = await api.post('/modelos', modelo);
        return response.data;
    },

    async update(id: number, modelo: Partial<Modelo>): Promise<Modelo> {
        const response = await api.put(`/modelos/${id}`, modelo);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/modelos/${id}`);
    }
}; 
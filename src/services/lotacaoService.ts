import api from '../config/api';
import { Secretaria } from './secretariaService';

// Interface para Lotação (baseada em Secretaria)
export interface Lotacao {
    id: number;
    nome: string;
    abrev: string;
    email: string;
    cod_drh: number | null;
    created_at?: string;
    updated_at?: string;
}

export const lotacaoService = {
    async getAll(): Promise<Lotacao[]> {
        const response = await api.get('/secretarias');
        return response.data;
    },

    async getById(id: number): Promise<Lotacao> {
        const response = await api.get(`/secretarias/${id}`);
        return response.data;
    },

    async create(lotacao: Omit<Lotacao, 'id' | 'created_at' | 'updated_at'>): Promise<Lotacao> {
        const response = await api.post('/secretarias', lotacao);
        return response.data;
    },

    async update(id: number, lotacao: Partial<Lotacao>): Promise<Lotacao> {
        const response = await api.put(`/secretarias/${id}`, lotacao);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/secretarias/${id}`);
    }
};
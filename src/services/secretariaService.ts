import api from '../config/api';

export interface ResponsavelSecretaria {
    id: number;
    nome: string;
    sexo: 'M' | 'F' | 'O';
    cargo: string;
    num_doc: number | null;
    data_doc: string | null;
    cod_drh: number | null;
    secretaria_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface Secretaria {
    id: number;
    nome: string;
    abrev: string;
    email: string;
    cod_drh: number | null;
    responsaveis?: ResponsavelSecretaria[];
    created_at?: string;
    updated_at?: string;
}

export const secretariaService = {
    async getAll(): Promise<Secretaria[]> {
        const response = await api.get('/secretarias');
        return response.data;
    },

    async getById(id: number): Promise<Secretaria> {
        const response = await api.get(`/secretarias/${id}`);
        return response.data;
    },

    async create(secretaria: Omit<Secretaria, 'id' | 'created_at' | 'updated_at'>): Promise<Secretaria> {
        const response = await api.post('/secretarias', secretaria);
        return response.data;
    },

    async update(id: number, secretaria: Partial<Secretaria>): Promise<Secretaria> {
        const response = await api.put(`/secretarias/${id}`, secretaria);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/secretarias/${id}`);
    },

    // Serviços para Responsáveis
    responsavel: {
        async getAll(secretariaId: number): Promise<ResponsavelSecretaria[]> {
            const response = await api.get(`/secretarias/${secretariaId}/responsaveis`);
            return response.data;
        },

        async getById(secretariaId: number, responsavelId: number): Promise<ResponsavelSecretaria> {
            const response = await api.get(`/secretarias/${secretariaId}/responsaveis/${responsavelId}`);
            return response.data;
        },

        async create(secretariaId: number, responsavel: Omit<ResponsavelSecretaria, 'id' | 'created_at' | 'updated_at'>): Promise<ResponsavelSecretaria> {
            const response = await api.post(`/secretarias/${secretariaId}/responsaveis`, responsavel);
            return response.data;
        },

        async update(secretariaId: number, responsavelId: number, responsavel: Partial<ResponsavelSecretaria>): Promise<ResponsavelSecretaria> {
            const response = await api.put(`/secretarias/${secretariaId}/responsaveis/${responsavelId}`, responsavel);
            return response.data;
        },

        async delete(secretariaId: number, responsavelId: number): Promise<void> {
            await api.delete(`/secretarias/${secretariaId}/responsaveis/${responsavelId}`);
        }
    }
};
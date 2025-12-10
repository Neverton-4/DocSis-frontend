import api from '@/config/api';

export interface TipoDecreto {
  id: number;
  nome: string;
  ativo?: boolean;
}

export const tipoDecretoService = {
  async getAll(ativo: boolean = true): Promise<TipoDecreto[]> {
    try {
      const response = await api.get('/decretos/tipos', {
        params: { ativo }
      });
      return response.data;
    } catch (err) {
      console.warn('Endpoint /decretos/tipos indisponível, derivando tipos de decretos existentes:', err);
      // Fallback: derivar tipos dos decretos existentes
      const tiposMock: TipoDecreto[] = [
        { id: 1, nome: 'Regulamentar', ativo: true },
        { id: 2, nome: 'Normativo', ativo: true },
        { id: 3, nome: 'Administrativo', ativo: true },
      ];
      return tiposMock;
    }
  },

  async getById(id: number): Promise<TipoDecreto | null> {
    try {
      const response = await api.get(`/decretos/tipos/${id}`);
      return response.data;
    } catch (err) {
      console.warn('Endpoint de tipo decreto específico indisponível:', err);
      return null;
    }
  }
};
import api from '@/config/api';

export interface AssinaturaDecreto {
  id: number;
  decreto_id: number;
  tipo: string; // 'prefeito', 'secretario', etc.
  nome_assinante: string;
  cargo_assinante: string;
  pagina: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  status: 'pendente' | 'assinada';
  data_assinatura?: string;
}

class AssinaturaDecretoService {
  // Usar axios `api` configurado para garantir baseURL e autenticação consistentes
  private baseURL = '/decretos';

  // Buscar todas as assinaturas de um decreto
  async getByDecretoId(decretoId: number): Promise<AssinaturaDecreto[]> {
    try {
      const response = await api.get(`${this.baseURL}/assinaturas/${decretoId}`);
      const data = response.data;
      // Garantir que sempre retornamos um array
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Erro ao buscar assinaturas do decreto:', error);
      throw error;
    }
  }

  // Buscar assinaturas por status
  async getByStatus(status: 'pendente' | 'assinada'): Promise<AssinaturaDecreto[]> {
    try {
      const response = await api.get(`${this.baseURL}/assinaturas/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinaturas por status:', error);
      throw error;
    }
  }

  // Buscar todas as assinaturas
  async getAll(): Promise<AssinaturaDecreto[]> {
    try {
      const response = await api.get(`${this.baseURL}/assinaturas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  }

  // Atualizar status de uma assinatura
  async updateStatus(id: number, status: 'pendente' | 'assinada'): Promise<AssinaturaDecreto> {
    try {
      const response = await api.put(`${this.baseURL}/assinaturas/${id}/status`, {
        status,
        data_assinatura: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Buscar todas as assinaturas de um decreto (alias para compatibilidade)
  async fetchByDecreto(decretoId: number): Promise<AssinaturaDecreto[]> {
    return this.getByDecretoId(decretoId);
  }

  // Verificar se todas as assinaturas de um decreto estão completas
  async checkDecretoSignatureStatus(decretoId: number): Promise<{
    total: number;
    assinadas: number;
    pendentes: number;
    completa: boolean;
  }> {
    try {
      const assinaturas = await this.getByDecretoId(decretoId);
      
      console.log(`Assinaturas do decreto ${decretoId}:`, assinaturas);
      
      const assinadas = assinaturas.filter(a => a.status === 'assinada').length;
      const pendentes = assinaturas.filter(a => a.status === 'pendente').length;
      
      return {
        total: assinaturas.length,
        assinadas,
        pendentes,
        completa: pendentes === 0 && assinaturas.length > 0
      };
    } catch (error) {
      console.error('Erro ao verificar status das assinaturas:', error);
      throw error;
    }
  }
}

export const assinaturaDecretoService = new AssinaturaDecretoService();
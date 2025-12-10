import api from '@/config/api';

export interface AssinaturaDiaria {
  id: number;
  diaria_id: number;
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
  created_at?: string;
  updated_at?: string;
}

class AssinaturaDiariaService {
  private baseURL = '/diarias';

  // Buscar todas as assinaturas de uma diária
  async getByDiariaId(diariaId: number): Promise<AssinaturaDiaria[]> {
    try {
      const response = await api.get(`${this.baseURL}/assinaturas/${diariaId}`);
      const data = response.data;
      // Garantir que sempre retornamos um array
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Erro ao buscar assinaturas da diária:', error);
      throw error;
    }
  }

  // Buscar uma assinatura específica
  async getById(id: number): Promise<AssinaturaDiaria> {
    try {
      const response = await api.get(`${this.baseURL}/assinaturas/id/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  }

  // Buscar todas as assinaturas
  async getAll(): Promise<AssinaturaDiaria[]> {
    try {
      const response = await api.get(`${this.baseURL}/assinaturas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  }

  // Atualizar status de uma assinatura
  async updateStatus(id: number, status: 'pendente' | 'assinada'): Promise<AssinaturaDiaria> {
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

  // Buscar todas as assinaturas de uma diária (alias para compatibilidade)
  async fetchByDiaria(diariaId: number): Promise<AssinaturaDiaria[]> {
    return this.getByDiariaId(diariaId);
  }

  // Verificar se todas as assinaturas de uma diária estão completas
  async checkDiariaSignatureStatus(diariaId: number): Promise<{
    total: number;
    assinadas: number;
    pendentes: number;
    completa: boolean;
  }> {
    try {
      const assinaturas = await this.getByDiariaId(diariaId);
      
      console.log(`Assinaturas da diária ${diariaId}:`, assinaturas);
      
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

export const assinaturaDiariaService = new AssinaturaDiariaService();
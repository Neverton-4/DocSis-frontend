export interface AssinaturaPortaria {
  id: number;
  portaria_id: number;
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

class AssinaturaService {
  private baseURL = 'http://localhost:8000/api';

  // Buscar todas as assinaturas de uma portaria
  async getByPortariaId(portariaId: number): Promise<AssinaturaPortaria[]> {
    try {
      const response = await fetch(`${this.baseURL}/assinaturas-portaria/${portariaId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar assinaturas da portaria');
      }
      const data = await response.json();
      
      // Garantir que sempre retornamos um array
      // Se a API retorna um objeto único, colocamos em um array
      // Se já é um array, mantemos como está
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  }

  // Buscar assinaturas por status
  async getByStatus(status: 'pendente' | 'assinada'): Promise<AssinaturaPortaria[]> {
    try {
      const response = await fetch(`${this.baseURL}/assinaturas/status/${status}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar assinaturas por status');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar assinaturas por status:', error);
      throw error;
    }
  }

  // Buscar todas as assinaturas
  async getAll(): Promise<AssinaturaPortaria[]> {
    try {
      const response = await fetch(`${this.baseURL}/assinaturas`);
      if (!response.ok) {
        throw new Error('Erro ao buscar todas as assinaturas');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  }

  // Atualizar status de uma assinatura
  async updateStatus(id: number, status: 'pendente' | 'assinada'): Promise<AssinaturaPortaria> {
    try {
      const response = await fetch(`${this.baseURL}/assinaturas/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, data_assinatura: new Date().toISOString() }),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar status da assinatura');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Verificar se todas as assinaturas de uma portaria estão completas
  // Verificar se todas as assinaturas de uma portaria estão completas
  async checkPortariaSignatureStatus(portariaId: number): Promise<{
    total: number;
    assinadas: number;
    pendentes: number;
    completa: boolean;
  }> {
    try {
      const assinaturas = await this.getByPortariaId(portariaId);
      
      console.log(`Assinaturas da portaria ${portariaId}:`, assinaturas);
      
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

export const assinaturaService = new AssinaturaService();


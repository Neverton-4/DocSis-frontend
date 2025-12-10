import api from '@/config/api';

// Interface para Diária baseada no modelo backend
export interface Diaria {
  id: number;
  numero: string;
  ano: number;
  usuario_id: number;
  servidor_id: number;
  tipo_servidor: 'servidor' | 'secretario' | 'prefeito' | 'conselheiro';
  vencida: boolean;
  
  // Dados do requerimento
  num_requerimento?: string;
  data_requerimento?: string;
  
  // Dados da viagem
  cidade_id?: number;
  objetivo?: string;
  local_viagem?: string;
  qtd_dias?: number;
  
  // Dados da diária
  dotacao_id?: number;
  data_diaria?: string;
  valor_unitario?: number;
  valor_total?: number;
  titulo?: string;
  conteudo?: string;
  
  // Relacionamentos
  usuario?: {
    id: number;
    nome: string;
  };
  servidor?: {
    id: number;
    nome_completo: string;
    cpf: string;
  };
  cidade?: {
    id: number;
    nome: string;
    uf: string;
    distancia_km: number;
    tipo_destino: string;
  };
  dotacao?: {
    id: number;
    orgao: string;
    dotacao: string;
    anotacoes?: string;
  };
  
  // Status e numeração
  status?: string;
  status_novo?: string;
  servidor_nome?: string;
  tipo_nome?: string;
  
  created_at?: string;
  updated_at?: string;
}

// Interface para criação de diária
export interface DiariaCreate {
  usuario_id: number;
  servidor_id: number;
  tipo_servidor: 'servidor' | 'secretario' | 'prefeito' | 'conselheiro';
  num_requerimento?: string;
  data_requerimento?: string;
  cidade_id?: number;
  objetivo?: string;
  local_viagem?: string;
  qtd_dias?: number;
  dotacao_id?: number;
  data_diaria?: string;
  valor_unitario?: number;
  valor_total?: number;
  titulo?: string;
  conteudo?: string;
  dias_viagem?: string[];
}

// Interface para atualização de diária
export interface DiariaUpdate {
  numero?: string;
  ano?: number;
  usuario_id?: number;
  servidor_id?: number;
  tipo_servidor?: 'servidor' | 'secretario' | 'prefeito' | 'conselheiro';
  vencida?: boolean;
  num_requerimento?: string;
  data_requerimento?: string;
  cidade_id?: number;
  objetivo?: string;
  local_viagem?: string;
  qtd_dias?: number;
  dotacao_id?: number;
  data_diaria?: string;
  valor_unitario?: number;
  valor_total?: number;
  titulo?: string;
  conteudo?: string;
  dias_viagem?: string[];
}

// Interface para resposta paginada
export interface DiariasResponse {
  diarias: Diaria[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const diariaService = {
  /**
   * Lista todas as diárias com filtros opcionais
   */
  async getAll(params?: {
    ano?: number;
    status?: string;
    servidor_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<Diaria[]> {
    try {
      const response = await api.get('/diarias', { params });
      // A API retorna um array diretamente
      const result = Array.isArray(response.data) ? response.data : [];
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca diárias por status
   */
  async getByStatus(status: string, ano?: number): Promise<Diaria[]> {
    try {
      const params: any = { status };
      if (ano) params.ano = ano;
      
      const response = await api.get('/diarias', { params });
      // A API retorna um array diretamente
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca uma diária por ID
   */
  async getById(id: number): Promise<Diaria> {
    try {
      const response = await api.get(`/diarias/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cria uma nova diária
   */
  async create(diaria: DiariaCreate): Promise<Diaria> {
    try {
      const response = await api.post('/diarias', diaria);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Atualiza uma diária existente
   */
  async update(id: number, diaria: DiariaUpdate): Promise<Diaria> {
    try {
      const response = await api.put(`/diarias/${id}`, diaria);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Deleta uma diária
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/diarias/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Atualiza o status de uma diária
   */
  async updateStatus(id: number, novoStatus: string): Promise<Diaria> {
    try {
      const response = await api.patch(`/diarias/${id}/status`, {
        novo_status: novoStatus
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca numerações disponíveis para um ano
   */
  async getNumeracoes(ano: number): Promise<any[]> {
    try {
      const response = await api.get(`/diarias/numeracoes/${ano}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reserva uma numeração para diária
   */
  async reservarNumeracao(ano: number, numero: string): Promise<any> {
    try {
      const response = await api.post(`/diarias/numeracoes/${ano}/${numero}/reservar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca cidades disponíveis
   */
  async getCidades(): Promise<any[]> {
    try {
      const response = await api.get('/diarias/cidades');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca dotações disponíveis
   */
  async getDotacoes(): Promise<any[]> {
    try {
      const response = await api.get('/diarias/dotacoes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Calcula o valor da diária
   */
  async calcularValor(params: {
    tipo_servidor: string;
    cidade_id: number;
    qtd_dias: number;
  }): Promise<{ valor_unitario: number; valor_total: number }> {
    try {
      const response = await api.post('/diarias/calcular-valor', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default diariaService;
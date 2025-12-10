import api from '../config/api';

export interface Cargo {
  id: number;
  nome: string;
  nome_completo: string;
  cod?: string;
  tipo: 'agente_politico' | 'comissionado' | 'funcao' | 'magisterio' | 'padrao' | 'funcao_gratificada';
  secretaria_id?: number;
  ativo: boolean;
  exige_escola: boolean;
  created_at: string;
  updated_at: string;
  secretaria?: {
    id: number;
    nome: string;
    abrev: string;
  };
}

export const cargoService = {
  // Buscar todos os cargos com filtros opcionais
  async getAll(params?: {
    skip?: number;
    limit?: number;
    nome?: string;
    nome_completo?: string;
    tipo?: string;
    secretaria_id?: number;
  }): Promise<Cargo[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.nome) queryParams.append('nome', params.nome);
    if (params?.nome_completo) queryParams.append('nome_completo', params.nome_completo);
    if (params?.tipo) queryParams.append('tipo', params.tipo);
    if (params?.secretaria_id) queryParams.append('secretaria_id', params.secretaria_id.toString());
    
    const url = `/cargos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Buscar cargos por secretaria (usando a rota específica)
  async getBySecretaria(secretariaId: number): Promise<Cargo[]> {
    const response = await api.get(`/cargos/secretaria/${secretariaId}`);
    return response.data;
  },

  // Buscar cargos por tipo (usando a rota específica)
  async getByTipo(tipo: string): Promise<Cargo[]> {
    const response = await api.get(`/cargos/tipo/${tipo}`);
    return response.data;
  },

  // Buscar cargos por nome com filtro opcional por secretaria
  async buscarPorNome(nome: string, secretariaId?: number): Promise<Cargo[]> {
    const params: any = { nome, limit: 10 };
    if (secretariaId) {
      params.secretaria_id = secretariaId;
    }
    return this.getAll(params);
  },

  // Buscar cargos por nome completo
  async buscarPorNomeCompleto(nomeCompleto: string, secretariaId?: number): Promise<Cargo[]> {
    const params: any = { nome_completo: nomeCompleto, limit: 10 };
    if (secretariaId) {
      params.secretaria_id = secretariaId;
    }
    return this.getAll(params);
  },

  // Buscar cargos ativos apenas
  async getCargosAtivos(secretariaId?: number): Promise<Cargo[]> {
    const params: any = { limit: 100 };
    if (secretariaId) {
      params.secretaria_id = secretariaId;
    }
    const cargos = await this.getAll(params);
    return cargos.filter(cargo => cargo.ativo);
  }
};
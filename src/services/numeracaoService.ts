import api from '@/config/api';

// Tipos para numeração de documento
export interface NumeracaoDocumento {
  id: number;
  numero: string;
  ano?: number; // Pode ser null quando data_referencia for null
  data_referencia?: string; // Data completa no formato ISO (YYYY-MM-DD)
  data_referencia_formatada?: string; // Data formatada no formato mm/dd
  status: 'disponivel' | 'reservado' | 'criado' | 'aguardando_assinatura' | 'assinado' | 'publicado';
  documento_id?: number;
  reservado_por?: number;
  reservado_em?: string;
}

export interface NumeracaoDocumentoCreate {
  numero: string;
  ano: number;
  data_referencia?: string;
  status?: 'disponivel' | 'reservado' | 'criado' | 'aguardando_assinatura' | 'assinado' | 'publicado';
  documento_id?: number;
  reservado_por?: number;
}

export interface NumeracaoDocumentoUpdate {
  numero?: string;
  ano?: number;
  data_referencia?: string;
  status?: 'disponivel' | 'reservado' | 'criado' | 'aguardando_assinatura' | 'assinado' | 'publicado';
  documento_id?: number;
  reservado_por?: number;
}

export const numeracaoService = {
  // Listar todas as numerações para um ano específico, com status opcional
  async listar(ano: number, status?: string, documentType: string = 'portarias'): Promise<NumeracaoDocumento[]> {
    const response = await api.get(`/${documentType}/numeracao`, {
      params: {
        ano,
        ...(status ? { status } : {})
      }
    });
    // A API retorna um objeto com numeracoes, total e ano - extrair apenas o array numeracoes
    return response.data.numeracoes || [];
  },

  // Obter próximo número disponível para um ano
  async obterProximoDisponivel(ano: number, documentType: string = 'portarias'): Promise<NumeracaoDocumento> {
    const response = await api.get(`/${documentType}/numeracao/disponivel?ano=${ano}`);
    return response.data;
  },

  // Obter numeração específica por ID
  async obterPorId(id: number, documentType: string = 'portarias'): Promise<NumeracaoDocumento> {
    const response = await api.get(`/${documentType}/numeracao/${id}`);
    return response.data;
  },

  // Criar nova numeração
  async criar(numeracao: NumeracaoDocumentoCreate, documentType: string = 'portarias'): Promise<NumeracaoDocumento> {
    const response = await api.post(`/${documentType}/numeracao`, numeracao);
    return response.data;
  },

  // Reservar uma numeração
  async reservar(id: number, usuario_id?: number, documentType: string = 'portarias'): Promise<NumeracaoDocumento> {
    // Se usuario_id não for fornecido, usar um valor padrão ou obter do contexto de autenticação
    const userId = usuario_id || 1; // TODO: Obter do contexto de autenticação
    const response = await api.put(`/${documentType}/numeracao/${id}/reservar?usuario_id=${userId}`);
    return response.data;
  },

  // Atualizar numeração
  async atualizar(id: number, numeracao: NumeracaoDocumentoUpdate, documentType: string = 'portarias'): Promise<NumeracaoDocumento> {
    const response = await api.put(`/${documentType}/numeracao/${id}`, numeracao);
    return response.data;
  },

  // Deletar numeração
  async deletar(id: number, documentType: string = 'portarias'): Promise<void> {
    await api.delete(`/${documentType}/numeracao/${id}`);
  },

  // Função removida - não gerar mais numerações em lote
  // As numerações já existem no banco de dados
};

export default numeracaoService;
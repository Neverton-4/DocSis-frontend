import api from '@/config/api';

export interface TipoDocumento {
  id: number;
  nome: string;
}

export type TipoAssinante = 'prefeito' | 'secretario' | 'procurador' | 'controlador';

export interface TiposDocumentosAssinantes {
  id: number;
  tipo_documento_id: number;
  tipo_documento?: TipoDocumento;
  tipo_assinante: TipoAssinante;
  obrigatorio: boolean;
  ordem_assinatura?: number | null;
}

export interface AssinanteMinimo {
  id: number;
  nome: string;
  cpf: string;
}

export interface TiposDocumentosAssinantesDetalhado extends TiposDocumentosAssinantes {
  assinantes: AssinanteMinimo[];
}

const normalizeKey = (nome?: string): string => {
  const base = (nome || '').toLowerCase();
  if (base.includes('portaria')) return 'portarias';
  if (base.includes('decreto')) return 'decretos';
  if (base.includes('diária') || base.includes('diaria')) return 'diarias';
  if (base.includes('lei')) return 'leis';
  if (base.includes('edital')) return 'editais';
  return 'outros';
};

const keyToNomeMap: Record<string, string> = {
  portarias: 'Portarias',
  decretos: 'Decretos',
  diarias: 'Diárias',
  leis: 'Leis',
  editais: 'Editais',
  outros: 'Outros',
};

export const tipoDocumentoService = {
  async listarTiposDocumentos(): Promise<TipoDocumento[]> {
    const resp = await api.get('/tipos-documentos');
    return Array.isArray(resp.data) ? resp.data as TipoDocumento[] : [];
  },
  // Atualizado: agora retorna estrutura detalhada com lista de assinantes por tipo
  async listarAssinantesPorTipo(documentTypeKey: string, nome?: string): Promise<TiposDocumentosAssinantesDetalhado[]> {
    const key = (documentTypeKey || '').toLowerCase();
    const endpointMap: Record<string, string> = {
      portarias: '/portarias/assinantes',
      decretos: '/decretos/assinantes',
      diarias: '/diarias/assinantes',
    };
    const endpoint = endpointMap[key];
    if (!endpoint) {
      throw new Error('Tipo de documento não suportado para assinantes');
    }
    const resp = await api.get(endpoint, { params: { nome } });
    const data = resp.data as { tipos_documentos_assinantes: TiposDocumentosAssinantesDetalhado[] };
    return data?.tipos_documentos_assinantes || [];
  },
  async listarAssinantesDetalhado(documentTypeKey: string): Promise<TiposDocumentosAssinantesDetalhado[]> {
    const key = (documentTypeKey || '').toLowerCase();
    const endpointMap: Record<string, string> = {
      portarias: '/portarias/assinantes',
      decretos: '/decretos/assinantes',
      diarias: '/diarias/assinantes',
    };
    const endpoint = endpointMap[key];
    if (!endpoint) {
      throw new Error('Tipo de documento não suportado para assinantes');
    }
    const resp = await api.get(endpoint);
    const data = resp.data as { tipos_documentos_assinantes: TiposDocumentosAssinantesDetalhado[] };
    return data?.tipos_documentos_assinantes || [];
  },
};
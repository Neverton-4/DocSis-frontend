// Interfaces para processo e documentos (migrado de protocolo)

export interface AnexoProcesso {
  id: number;
  processo_id: number;
  nome_arquivo: string;
  arquivo_url: string;
  tamanho: number;
  tipo: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoPrincipal {
  id: number;
  processo_id: number;
  nome_arquivo: string;
  arquivo_url: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessoBasico {
  id: number;
  numero: string;
  servidor?: {
    id: number;
    nome_completo: string;
    matricula: string;
    cpf: string;
  };
  tipo_processo?: {
    id: number;
    nome: string;
  };
  departamento?: {
    id: number;
    nome: string;
  };
  data_abertura: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AssinaturaProcesso {
  id: number;
  processo_id: number;
  usuario_id: number;
  assinado_em: string;
  usuario?: {
    id: number;
    nome: string;
    cargo: string;
  };
}

export interface ProcessoDocumentosCompletosResponse {
  processo: ProcessoBasico;
  documento_principal?: DocumentoPrincipal;
  documento_thumbnail_base64?: string;
  anexos: AnexoProcesso[];
  assinaturas: AssinaturaProcesso[];
}

// Manter compatibilidade com código existente (deprecated)
/** @deprecated Use ProcessoBasico instead */
export interface ProtocoloBasico extends ProcessoBasico {}
/** @deprecated Use AnexoProcesso instead */
export interface AnexoProtocolo extends AnexoProcesso {}
/** @deprecated Use AssinaturaProcesso instead */
export interface AssinaturaProtocolo extends AssinaturaProcesso {}
/** @deprecated Use ProcessoDocumentosCompletosResponse instead */
export interface ProtocoloDocumentosCompletosResponse extends ProcessoDocumentosCompletosResponse {}
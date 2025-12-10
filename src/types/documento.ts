// Tipos baseados no schema SQL para documentos e anexos

export interface TipoDocumento {
  id: number;
  nome: string;
  descricao: string;
  coletiva: boolean;
  exige_cargo: boolean;
  exige_escola: boolean;
  ativo: boolean;
}

export interface SubTipoDocumento {
  id: number;
  tipo_documento_id: number;
  nome_subtipo: string;
}

export interface Cargo {
  id: number;
  secretaria_id?: number;
  nome: string;
  nome_completo: string;
  cod: string;
  tipo: 'agente_politico' | 'comissionado' | 'funcao' | 'magisterio' | 'padrao' | 'funcao_gratificada';
  ativo: boolean;
  exige_escola: boolean;
}

export interface Escola {
  id: number;
  nome: string;
  abrev: string;
  tipo: 'urbana' | 'rural';
  ativo: boolean;
}

export interface Servidor {
  id: number;
  matricula: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  cargo: string;
  lotacao: string;
  tipo_servidor: 'efetivo' | 'comissionado' | 'temporario' | 'nao_servidor';
  status: 'ativo' | 'inativo' | 'licenca' | 'aposentado' | 'exonerado';
}

export interface CodigoDrh {
  id: number;
  cargo_id: number;
  codigo: string;
  descricao?: string;
  ativo: boolean;
  cargo?: Cargo;
}

export interface Documento {
  id: number;
  numero: string;
  ano: number;
  tipo_id: number;
  subtipo_id?: number;
  servidor_id?: number;
  cargo_id?: number;
  escola_id?: number;
  data_documento: string;
  data_efeito: string;
  status: 'criado' | 'revisado' | 'aguardando_assinatura' | 'assinado' | 'publicado';
  criado_em: string;
  atualizado_em: string;
  
  // Relacionamentos opcionais
  tipo_documento?: TipoDocumento;
  subtipo_documento?: SubTipoDocumento;
  servidor?: Servidor;
  cargo?: Cargo;
  escola?: Escola;
}

export interface DocumentoDocumento {
  id: number;
  documento_id: number;
  docx_gerado?: string;        // Campo real no banco
  docx_enviado?: string;       // Campo real no banco
  pdf_gerado?: string;         // Campo real no banco
  pdf_assinado?: string;       // Campo real no banco
  thumbnail?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AnexoDocumento {
  id: number;
  documento_id: number;
  nome_arquivo: string;
  caminho_arquivo: string;
  tipo_arquivo?: string;
  thumbnail?: string;
  descricao?: string;
  enviado_por?: number;        // Pode ser NULL no banco
  enviado_em: string;
  
  // Relacionamento opcional
  usuario?: {
    id: number;
    nome: string;
    username: string;
  };
}

export interface AssinaturaDocumento {
  id: number;
  documento_id: number;
  tipo: string;
  nome_assinante: string;
  cargo_assinante?: string;
  pagina?: number;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  status: 'pendente' | 'assinada';
  data_assinatura?: string;
}

// Response types para APIs
export interface DocumentoDocumentosCompletosResponse {
  documento_id: number;
  numero: string;
  ano: number;
  tipo_nome: string;
  subtipo_nome?: string;
  
  // Documento principal
  documento_principal?: DocumentoDocumento;
  documento_thumbnail_url?: string;
  documento_thumbnail_base64?: string;
  
  documento: Documento;
  anexos: (AnexoDocumento & {
    thumbnail_url?: string;
    thumbnail_base64?: string;
  })[];
  assinaturas: AssinaturaDocumento[];
  
  total_anexos?: number;
  total_documentos?: number;
}

export interface DocumentoPdfInfoResponse {
  id: number;
  documento_id: number;
  pdf_path?: string;
  nome_arquivo_pdf?: string;
  tamanho_pdf?: number;
  criado_em: string;
  atualizado_em: string;
  tipo_documento: 'documento' | 'anexo';
  anexo_id?: number;
}

export interface AnexosDocumentoResponse {
  documento_id: number;
  anexos: AnexoDocumento[];
  total: number;
}

export interface ModeloDocumento {
  id: number;
  tipo_id: number;
  subtipo_id?: number;
  nome: string;
  texto_template: string;
  exige_gratificacao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  tipo_documento?: TipoDocumento;
  subtipo_documento?: SubTipoDocumento;
}

export interface BlocoPadraoDocumento {
  id: number;
  chave: string;
  nome_exibicao: string;
  conteudo: string;
  obrigatorio: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampoDocumento {
  id: number;
  tipo_id: number;
  subtipo_id?: number;
  nome_campo: string;
  label: string;
  tipo: string;
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
  tipo_documento?: TipoDocumento;
  subtipo_documento?: SubTipoDocumento;
}

export interface ValorDocumentoCampo {
  id: number;
  documento_id: number;
  campo_id: number;
  valor: string;
  documento?: Documento;
  campo?: CampoDocumento;
}
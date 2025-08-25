// Tipos baseados no schema SQL para portarias e anexos

export interface TipoPortaria {
  id: number;
  nome: string;
  descricao: string;
  coletiva: boolean;
  exige_cargo: boolean;
  exige_escola: boolean;
  ativo: boolean;
}

export interface SubTipoPortaria {
  id: number;
  tipo_portaria_id: number;
  nome_subtipo: string;
}

export interface Cargo {
  id: number;
  secretaria_id?: number;
  nome: string;
  nome_completo: string;
  cod: string;
  tipo: 'agente_politico' | 'comissionado' | 'funcao' | 'magisterio' | 'padrao';
  ativo: boolean;
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

export interface Portaria {
  id: number;
  numero: string;
  ano: number;
  tipo_id: number;
  subtipo_id?: number;
  servidor_id?: number;
  cargo_id?: number;
  escola_id?: number;
  data_portaria: string;
  data_efeito: string;
  status: 'criado' | 'revisado' | 'aguardando_assinatura' | 'assinado' | 'publicado';
  criado_em: string;
  atualizado_em: string;
  
  // Relacionamentos
  tipo_portaria?: TipoPortaria;
  subtipo_portaria?: SubTipoPortaria;
  servidor?: Servidor;
  cargo?: Cargo;
  escola?: Escola;
}

export interface DocumentoPortaria {
  id: number;
  portaria_id: number;
  docx_gerado?: string;        // Campo real no banco
  docx_enviado?: string;       // Campo real no banco
  pdf_gerado?: string;         // Campo real no banco
  pdf_assinado?: string;       // Campo real no banco
  thumbnail?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface AnexoPortaria {
  id: number;
  portaria_id: number;
  nome_arquivo: string;
  caminho_arquivo: string;
  tipo_arquivo?: string;
  thumbnail?: string;
  descricao?: string;
  enviado_por?: number;        // Pode ser NULL no banco
  enviado_em: string;
  
  // Relacionamentos
  usuario?: {
    id: number;
    nome: string;
    username: string;
  };
}

export interface AssinaturaPortaria {
  id: number;
  portaria_id: number;
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

// Respostas das APIs
export interface PortariaDocumentosCompletosResponse {
  portaria: Portaria;
  documento_principal?: DocumentoPortaria;
  anexos: AnexoPortaria[];
  assinaturas: AssinaturaPortaria[];
}

export interface PortariaPdfInfoResponse {
  id: number;
  portaria_id: number;
  pdf_path?: string;
  nome_arquivo_pdf?: string;
  tamanho_pdf?: number;
  criado_em: string;
  atualizado_em: string;
  tipo_documento: 'portaria' | 'anexo';
  anexo_id?: number;
}

export interface AnexosPortariaResponse {
  portaria_id: number;
  anexos: AnexoPortaria[];
  total: number;
}

export interface ModeloPortaria {
  id: number;
  tipo_id: number;
  subtipo_id?: number;
  nome: string;
  texto_template: string;
  exige_gratificacao: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  tipo_portaria?: TipoPortaria;
  subtipo_portaria?: SubTipoPortaria;
}

export interface BlocoPadraoPortaria {
  id: number;
  chave: string;
  nome_exibicao: string;
  conteudo: string;
  obrigatorio: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampoPortaria {
  id: number;
  tipo_id: number;
  subtipo_id?: number;
  nome_campo: string;
  label: string;
  tipo: string;
  obrigatorio: boolean;
  ordem: number;
  ativo: boolean;
  tipo_portaria?: TipoPortaria;
  subtipo_portaria?: SubTipoPortaria;
}

export interface ValorPortariaCampo {
  id: number;
  portaria_id: number;
  campo_id: number;
  valor: string;
  portaria?: Portaria;
  campo?: CampoPortaria;
}
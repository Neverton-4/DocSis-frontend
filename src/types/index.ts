import { TipoServidorSimples } from './tipoServidor';

export type Status = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';

export type TipoServidorLegacy = 'efetivo' | 'temporario' | 'comissionado' | 'nao_servidor';

export type TipoCategoria = 'licenca' | 'declaracao' | 'gratificacao' | 'outro';

export interface Customer {
  id: string;
  fullName: string;
  cpf: string;
  rg: string;
  rg_uf?: string;
  orgao_exp?: string;
  logradouro: string;
  bairro: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
  cep: string;
  tipoServidor: TipoServidorLegacy;
  lotacao: string;
  secretaria_id: number;
  cargo: string;
  cargo_id?: number | null; // ✅ NOVO: ID do cargo para o select
  sexo: 'M' | 'F' | 'O';
  secretaria: string;
  contato: string;
  is_whatsapp: boolean;
  email: string;
  data_nascimento: string;
  matricula: string;
  data_admissao: string;
  tipoProcesso: string;
  tipoProcessoOutro?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  createdAt: string;
  updatedAt: string;
  camposExtras: any;
  tipoProcesso_escolhido: string;
  // Campos de expediente
  expediente_tipo?: 'portaria' | 'decreto';
  expediente_numero?: string;
  expediente_data?: string;
  // Campos de amparo
  amparo_tipo?: 'lei_municipal' | 'lei_estadual' | 'lei_federal' | 'decreto';
  amparo_numero?: string;
  amparo_data?: string;
}

export interface StatusSummary {
  pendente: number;
  em_andamento: number;
  concluido: number;
  cancelado: number;
}

export interface Usuario {
    id: number;
    nome: string;
    username: string;
    email: string;
    senha?: string; // Opcional para não expor em responses
    pode_assinar: boolean;
    cargo: string;
    departamento_id: number;
    role: 'admin' | 'user';
    status: 'ativo' | 'inativo';
    ultimo_login: string | null;
    created_at: string;
    updated_at: string;
}

// Nova interface para permissões de usuário
export interface PermissaoUsuario {
  id: number;
  tela: number;
  permissao: string;
  nome: string;
  descricao: string;
  ativo?: boolean;
}


// Interface para usuário com permissões
export interface UsuarioComPermissoes extends Usuario {
    permissoes: PermissaoUsuario[];
}

export interface Departamento {
    id: number;
    secretaria_id: number; // ✅ Adicionado: campo obrigatório conforme schema
    nome: string;
    acesso_total: boolean;
    is_principal: boolean;
    descricao: string | null;
    created_at: string;
    updated_at: string;
    // Relacionamento opcional
    secretaria?: Secretaria;
}

export interface AcaoDepartamento {
    id: number;
    departamento_id: number;
    nome_acao: string;
    codigo_acao: string;
    descricao: string | null;
    ativo: boolean;
    created_at: string;
}

export interface TipoProcesso {
    id: number;
    nome: string;
    descricao: string;
    tipo: 'licenca' | 'gratificacao' | 'declaracao' | 'outro';
    campos_extras: any;
    cidadao?: boolean;
    created_at: string;
}

export interface Modelo {
    id: number;
    departamento_id: number;
    tipos_processos_id: number;
    nome_arquivo: string;
    caminho_arquivo: string;
    created_at: string;
}

export interface ResponsavelSecretaria {
  id: number;
  nome: string;
  sexo: 'M' | 'F' | 'O';
  cargo: string;
  num_doc?: number;
  data_doc?: string;
  cod_drh?: number;
  secretaria_id: number;
  created_at: string;
  updated_at: string;
  secretaria?: Secretaria;
}


export interface Secretaria {
    id: number;
    nome: string;
    abrev: string;
    email: string;
    cod_drh: number | null;
    responsaveis?: ResponsavelSecretaria[];
    created_at?: string;
    updated_at?: string;
}

// Interface para Cargo aninhado no servidor
export interface CargoServidor {
    id: number;
    secretaria_id: number;
    nome: string;
    nome_completo: string;
    cod: string;
    tipo: 'agente_politico' | 'comissionado' | 'funcao' | 'magisterio' | 'padrao' | 'funcao_gratificada';
    ativo: boolean;
    exige_escola: boolean;
    created_at: string;
    updated_at: string;
}

// Interface para Lotação aninhada no servidor
export interface LotacaoServidor {
    id: number;
    nome: string;
    abrev: string;
    email: string;
    cod_drh: number;
    created_at: string;
    updated_at: string;
    responsaveis: ResponsavelSecretaria[];
}

// Interface para Endereços do servidor
export interface EnderecoServidor {
    id: number;
    servidor_id: number;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
}



export interface Servidor {
    id: number;
    matricula: string | null;
    nome_completo: string;
    rg: string | null;
    cpf: string;
    data_nascimento: string | null;
    sexo: 'M' | 'F' | 'O';
    
    // Novos campos RG
    rg_uf: string | null;
    orgao_exp: string | null;
    
    contato: string | null;
    is_whatsapp: boolean;
    email: string | null;
    tipo_servidor_id: number | null;
    
    // Nova estrutura de campos
    secretaria_id: number;
    lotacao: string | null;
    cargo_id: number | null;
    cargo_2_id: number | null;
    
    data_admissao: string | null;
    
    // Novos campos de expediente
    expediente_tipo: 'portaria' | 'decreto' | null;
    expediente_numero: string | null;
    expediente_data: string | null;
    
    // Novos campos de amparo
    amparo_tipo: 'lei_municipal' | 'lei_estadual' | 'lei_federal' | 'decreto' | null;
    amparo_numero: string | null;
    amparo_data: string | null;
    
    status: 'ativo' | 'inativo' | 'licenca' | 'aposentado' | 'exonerado';
    observacoes: string | null;
    created_at: string;
    updated_at: string;
    
    // Relacionamentos aninhados atualizados
    secretaria?: Secretaria;
    cargo?: CargoServidor;
    cargo_2?: CargoServidor;
    tipo_servidor?: TipoServidorSimples;
    enderecos?: EnderecoServidor[];
}

// Novo tipo para dados da tabela de servidores
export interface ServidorTabela {
    id: number;
    nome_completo: string;
    cpf: string;
    cargo_principal: string | null;
    tipo_servidor_nome: string | null;
    secretaria: string | null;
    status: 'ativo' | 'inativo' | 'licenca' | 'aposentado' | 'exonerado';
}

export interface Processo {
    id: number;
    numero: string;
    ano: number;
    servidor_id: number;
    usuario_id: number;
    tipo_processo: 'licenca' | 'declaracao' | 'gratificacao' | 'outro';
    nome: string;
    detalhes: string | null;
    status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
    created_at: string;
    updated_at: string;
}

// Novos tipos para os models atualizados
export interface ProcessoDocumento {
    id: number;
    processo_id: number;
    usuario_id: number;
    nome_arquivo: string;
    docx_gerado?: string;
    docx_enviado?: string;
    pdf_gerado?: string;
    pdf_enviado?: string;
    pdf_assinado?: string;
    thumbnail?: string;
    created_at: string;
}

export interface ProcessoAnexo {
    id: number;
    processo_id: number;
    usuario_id: number;
    nome_arquivo: string;
    caminho_arquivo: string;
    tipo_arquivo: string;
    tamanho_arquivo: number;
    created_at: string;
}

export enum EtapaStatus {
    PENDENTE = 'pendente',
    EM_ANDAMENTO = 'em_andamento',
    CONCLUIDA = 'concluida',
    CANCELADA = 'cancelada'
}

export interface ProcessoEtapa {
    id: number;
    processo_id: number;
    usuario_id: number;
    etapa_status: EtapaStatus;
    observacao?: string;
    etapa_final: boolean;
    ordem: number;
    data_inicio?: string;
    data_fim?: string;
    created_at: string;
}

// Interface para processo completo com relacionamentos
export interface ProcessoCompleto extends Processo {
    documentos: ProcessoDocumento[];
    anexos: ProcessoAnexo[];
    etapas: ProcessoEtapa[];
}


export interface Documento {
  id: number;
  numero: string;
  ano: string;
  descricao: string;
  data_documento: string;
  data_portaria?: string; // Para compatibilidade com portarias
  status: string;
  status_novo?: string; // Campo adicional retornado pela API
  servidor_nome?: string; // Campo adicional retornado pela API
  tipo_nome?: string; // Campo adicional retornado pela API
  subtipo_nome?: string; // Campo adicional retornado pela API
  servidor?: {
    id: number;
    nome_completo: string;
    matricula: string;
    cpf: string;
  };
  tipo_documento?: {
    id: number;
    nome: string;
  };
  tipo_portaria?: { // Para compatibilidade com portarias
    id: number;
    nome: string;
  };
  subtipo_documento?: {
    id: number;
    nome: string;
    tipo_documento_id: number;
  };
}

export interface Tela {
  id: number;
  nome: string;
  codigo: string;
  rota?: string;
  modulo?: string;
  liberado: boolean;
}

export interface Permissao {
  id: number;
  tela_id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  tela?: Tela;
}

// Alias para compatibilidade - será removido em versões futuras
export type Portaria = Documento;

// Interfaces para objetos aninhados na resposta de autenticação
export interface DepartamentoAuth {
  id: number;
  nome: string;
}

export interface SecretariaAuth {
  id: number;
  nome: string;
}


// Interface para Assinantes
export interface Assinante {
  id: number;
  tela_id: number;
  nome: string;
  cpf: string;
  tipo_assinante: 'prefeito' | 'secretario' | 'procurador' | 'controlador';
  ativo: boolean;
  // Relacionamento opcional
  tela?: {
    id: number;
    nome: string;
  };
}

// Interface para relação Usuario-Assinante
export interface UsuarioAssinante {
  id: number;
  usuario_id: number;
  assinante_id: number;
  pode_assinar: boolean;
  // Relacionamentos opcionais
  assinante?: Assinante;
}


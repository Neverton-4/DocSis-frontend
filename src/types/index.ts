export type Status = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';

export type TipoServidor = 'efetivo' | 'temporario' | 'comissionado' | 'nao_servidor';

export type TipoCategoria = 'licenca' | 'declaracao' | 'gratificacao' | 'outro';

export interface Customer {
  id: string;
  fullName: string;
  cpf: string;
  logradouro: string;
  bairro: string;
  numero: string;
  cidade: string;
  uf: string;
  tipoServidor: TipoServidor;
  lotacao: string;
  cargo: string;
  sexo: 'M' | 'F' | 'O';
  secretaria: string;
  contato: string;
  is_whatsapp: boolean; // ✅ Corrigido: era isWhatsapp
  email: string;
  data_nascimento: string; // ✅ Corrigido: era dateOfBirth
  tipoProcesso: string;
  tipoProcessoOutro?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  createdAt: string;
  updatedAt: string;
  camposExtras: any;
  tipoProcesso_escolhido: string;
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

export interface Servidor {
    id: number;
    matricula: string | null;
    nome_completo: string;
    cpf: string;
    data_nascimento: string | null;
    sexo: 'M' | 'F' | 'O';
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    contato: string | null;
    email: string | null;
    tipo_servidor: 'efetivo' | 'comissionado' | 'temporario' | 'nao_servidor';
    cargo: string;
    lotacao: string;
    data_admissao: string | null;
    status: 'ativo' | 'inativo' | 'licenca' | 'aposentado' | 'exonerado';
    observacoes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Processo {
    id: number;
    servidor_id: number;
    usuario_id: number;
    tipo_processo: 'licenca' | 'declaracao' | 'gratificacao' | 'outro';
    nome: string;
    detalhes: string | null;
    status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
    created_at: string;
    updated_at: string;
}

export interface Documento {
    id: number;
    processo_id: number;
    usuario_id: number;
    departamento_id: number;
    nome_arquivo: string;
    detalhes: string | null;
    caminho_arquivo: string;
    created_at: string;
}

export interface EtapaProcesso {
    id: number;
    processo_id: number;
    usuario_id: number;
    departamento_id: number;
    etapa_status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
    data_inicio: string;
    data_fim: string | null;
    observacao: string | null;
    etapa_final: boolean;
    ordem: number;
    created_at: string;
}


export interface Portaria {
  id: number;
  numero: string;
  ano: string;
  descricao: string;
  data_portaria: string;
  status: string;
  servidor?: {
    id: number;
    nome_completo: string;
    matricula: string;
    cpf: string;
  };
  tipo_portaria?: {
    id: number;
    nome: string;
  };
  subtipo_portaria?: {
    id: number;
    nome: string;
    tipo_portaria_id: number;
  };
}

export interface Tela {
  id: number;
  nome: string;
}

export interface Permissao {
  id: number;
  tela_id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  tela?: Tela;
}

export interface Portaria {
  id: number;
  numero: string;
  ano: string;
  descricao: string;
  data_portaria: string;
  status: string;
  servidor?: {
    id: number;
    nome_completo: string;
    matricula: string;
    cpf: string;
  };
  tipo_portaria?: {
    id: number;
    nome: string;
  };
  subtipo_portaria?: {
    id: number;
    nome: string;
    tipo_portaria_id: number;
  };
}

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


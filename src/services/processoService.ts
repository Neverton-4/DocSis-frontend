import api from '@/config/api';
import { ProcessoDocumento } from './processoDocumentoService';
import { ProcessoAnexo } from './processoAnexoService';
import { ProcessoEtapa } from './processoEtapaService';

export interface Processo {
  id: number;
  numero: string;
  ano: number;
  tipo_processo: string;
  tipo_nome?: string;
  tipo_descricao?: string;
  subtipo_nome?: string;
  subtipo_descricao?: string;
  status_dpto?: string;
  nome: string;
  detalhes?: string;
  status: string;
  created_at: string;
  iniciador_tipo: 'servidor' | 'cidadao' | 'juridico';
  interessado_id: number;
  interessado?: {
    // Campos comuns
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento?: string;
    sexo?: string;
    contato?: string;
    is_whatsapp?: boolean;
    email?: string;
    observacoes?: string;
    // Endereço
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    // Campos específicos do servidor
    matricula?: string;
    rg?: string;
    tipo_servidor?: string;
    data_admissao?: string;
    status?: string;
    lotacao?: string;
    secretaria_id?: number;
    cargo?: string;
    // Campos específicos do cidadão
    rg_uf?: string;
    estado_civil?: string;
    profissao?: string;
    // Campos específicos do jurídico
    razao_social?: string;
    nome_fantasia?: string;
    cnpj?: string;
    inscricao_estadual?: string;
    representante_nome?: string;
    representante_cpf?: string;
    representante_rg?: string;
    representante_cargo?: string;
  };
  // Mantendo compatibilidade com código existente
  servidor?: {
    id: number;
    matricula: string;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
    sexo: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    contato?: string;
    email?: string;
    tipo_servidor: string;
    cargo: string;
    lotacao: string;
    data_admissao?: string;
    status: string;
    observacoes?: string;
  };
}

export interface ProcessoCompleto extends Processo {
  documentos: ProcessoDocumento[];
  anexos: ProcessoAnexo[];
  etapas: ProcessoEtapa[];
}

export const getProcessoById = async (id: number): Promise<Processo> => {
  const response = await api.get(`/processos/${id}`);
  const data = response.data;
  
  // Transformar dados para manter compatibilidade com código existente
  if (data.interessado && data.interessado_tipo === 'servidor') {
    data.servidor = {
      id: data.interessado.id,
      matricula: data.interessado.matricula || '',
      nome_completo: data.interessado.nome_completo || '',
      cpf: data.interessado.cpf || '',
      data_nascimento: data.interessado.data_nascimento || '',
      sexo: data.interessado.sexo || '',
      cep: data.interessado.cep,
      logradouro: data.interessado.logradouro,
      numero: data.interessado.numero,
      complemento: data.interessado.complemento,
      bairro: data.interessado.bairro,
      cidade: data.interessado.cidade,
      uf: data.interessado.uf,
      contato: data.interessado.contato,
      email: data.interessado.email,
      tipo_servidor: data.interessado.tipo_servidor || '',
      cargo: data.interessado.cargo || '',
      lotacao: data.interessado.lotacao || '',
      data_admissao: data.interessado.data_admissao,
      status: data.interessado.status || '',
      observacoes: data.interessado.observacoes,
    };
  }
  
  return data;
};

export const getProcessoCompleto = async (id: number): Promise<ProcessoCompleto> => {
  const response = await api.get(`/processos/${id}/completo`);
  return response.data;
};

export const updateProcesso = async (id: number, data: Partial<Processo>): Promise<Processo> => {
  const response = await api.put(`/processos/${id}`, data);
  return response.data;
}; 

export const createProcesso = async (data: any): Promise<{ id: number }> => {
  const response = await api.post(`/processos/`, data);
  return response.data;
};

export const getComprovanteHTML = async (processo: string): Promise<string> => {
  const response = await api.get(`/processos/${processo}/comprovante`);
  return response.data;
};

export const getComprovanteURL = (processo: string): string => {
  return `${api.defaults.baseURL}/processos/${processo}/comprovante`;
};

export const getProcessosByServidor = async (servidorId: number): Promise<ProcessoResumo[]> => {
  const response = await api.get(`/processos/servidor/${servidorId}`);
  return response.data;
};

export interface ProcessoResumo {
  id: number;
  numero: string;
  ano: number;
  tipo_processo: string;
  nome: string;
  created_at: string;
  status: string;
  iniciador_tipo: 'servidor' | 'cidadao' | 'juridico';
  interessado_id: number;
  nome_interessado: string;
}

export const processoService = {
  getProcessoById,
  getProcessoCompleto,
  updateProcesso,
  createProcesso,
  getComprovanteHTML,
  getComprovanteURL,
  getProcessosByServidor
};
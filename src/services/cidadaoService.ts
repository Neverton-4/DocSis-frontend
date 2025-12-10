import api from '@/config/api';
import { Customer } from '@/types';

// Interface para Cidadão baseada na tabela cidadaos
export interface Cidadao {
  id?: number;
  nome_completo: string;
  cpf: string;
  rg: string;
  rg_uf: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  contato: string;
  is_whatsapp: boolean;
  email: string;
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'outro';
  profissao: string;
  observacoes?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  created_at?: string;
  updated_at?: string;
}

// Enums para Cidadão
export enum SexoEnum {
  MASCULINO = 'M',
  FEMININO = 'F'
}

export enum EstadoCivilEnum {
  SOLTEIRO = 'solteiro',
  CASADO = 'casado',
  DIVORCIADO = 'divorciado',
  VIUVO = 'viuvo',
  OUTRO = 'outro'
}

// Busca simplificada por nome (retorna apenas id, nome_completo, cpf)
export const buscarCidadaosPorNome = async (nome: string): Promise<{id: string, nome_completo: string, cpf: string}[]> => {
  const response = await api.get(`/cidadaos?nome=${nome}`);
  return response.data;
};

// Busca simplificada por CPF (retorna apenas id, nome_completo, cpf)
export const buscarCidadaosPorCPF = async (cpf: string): Promise<{id: string, nome_completo: string, cpf: string}[]> => {
  const response = await api.get(`/cidadaos?cpf=${cpf}`);
  return response.data;
};

// Busca com ambos os parâmetros
export const buscarCidadaosPorNomeECPF = async (nome: string, cpf: string): Promise<{id: string, nome_completo: string, cpf: string}[]> => {
  const response = await api.get(`/cidadaos?nome=${nome}&cpf=${cpf}`);
  return response.data;
};

// Cria ou atualiza o cidadão baseado no ID
export const salvarCidadao = async (data: Omit<Cidadao, 'id' | 'created_at' | 'updated_at'> | Cidadao): Promise<Cidadao> => {
    if ('id' in data && data.id) {
      const response = await api.put(`/cidadaos/${data.id}`, data);
      return response.data;
    } else {
      const response = await api.post(`/cidadaos/`, data);
      return response.data;
    }
};

export const buscarCidadaoPorCPF = async (cpf: string): Promise<Cidadao> => {
    const response = await api.get(`/cidadaos/cpf/${cpf}`);
    return response.data;
};

export const buscarTodosCidadaos = async (): Promise<Cidadao[]> => {
    const response = await api.get('/cidadaos');
    return response.data;
};

export const buscarCidadaoPorId = async (id: number): Promise<Cidadao> => {
    const response = await api.get(`/cidadaos/${id}`);
    return response.data;
};

export const excluirCidadao = async (id: number): Promise<void> => {
    await api.delete(`/cidadaos/${id}`);
};

// Função para converter Cidadao para Customer (compatibilidade)
export const cidadaoToCustomer = (cidadao: Cidadao): Customer => {
  return {
    id: cidadao.id.toString(),
    fullName: cidadao.nome_completo,
    cpf: cidadao.cpf,
    rg: cidadao.rg || '',
    contato: cidadao.contato || '',
    email: cidadao.email || '',
    data_nascimento: cidadao.data_nascimento || '',
    sexo: cidadao.sexo || 'M',
    is_whatsapp: cidadao.is_whatsapp || false,
    logradouro: cidadao.logradouro || '',
    bairro: cidadao.bairro || '',
    numero: cidadao.numero || '',
    complemento: cidadao.complemento || '',
    cidade: cidadao.cidade || '',
    uf: cidadao.uf || '',
    cep: cidadao.cep || '',
    // Campos específicos para cidadão
    tipoServidor: 'cidadao',
    cargo: '',
    lotacao: '',
    secretaria_id: 0,
    secretaria: ''
  };
};
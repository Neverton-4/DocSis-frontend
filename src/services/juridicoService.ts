import api from '@/config/api';

// Interface para Jurídico baseada na tabela juridicos
export interface Juridico {
  id?: number;
  razao_social: string;
  cnpj: string;
  representante_nome: string;
  contato: string;
  email: string;
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

// Interface para resposta completa com endereços
export interface JuridicoCompleto extends Juridico {
  enderecos?: {
    id: number;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    pessoa_tipo: string;
    pessoa_id: number;
  }[];
}

// Busca simplificada por razão social (retorna apenas id, razao_social, cnpj)
export const buscarJuridicosPorRazaoSocial = async (razaoSocial: string): Promise<{id: string, razao_social: string, cnpj: string}[]> => {
  const response = await api.get(`/juridicos?razao_social=${razaoSocial}`);
  return response.data;
};

// Busca simplificada por CNPJ (retorna apenas id, razao_social, cnpj)
export const buscarJuridicosPorCNPJ = async (cnpj: string): Promise<{id: string, razao_social: string, cnpj: string}[]> => {
  const response = await api.get(`/juridicos?cnpj=${cnpj}`);
  return response.data;
};

// Busca com ambos os parâmetros
export const buscarJuridicosPorRazaoSocialECNPJ = async (razaoSocial: string, cnpj: string): Promise<{id: string, razao_social: string, cnpj: string}[]> => {
  const response = await api.get(`/juridicos?razao_social=${razaoSocial}&cnpj=${cnpj}`);
  return response.data;
};

// Busca com dados completos incluindo endereços
export const buscarJuridicosCompletos = async (params?: {
  razao_social?: string;
  cnpj?: string;
  completo?: boolean;
}): Promise<JuridicoCompleto[]> => {
  const queryParams = new URLSearchParams();
  if (params?.razao_social) queryParams.append('razao_social', params.razao_social);
  if (params?.cnpj) queryParams.append('cnpj', params.cnpj);
  if (params?.completo) queryParams.append('completo', 'true');
  
  const url = `/juridicos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Cria ou atualiza o jurídico baseado no ID
export const salvarJuridico = async (data: Omit<Juridico, 'id' | 'created_at' | 'updated_at'> | Juridico): Promise<Juridico> => {
    if ('id' in data && data.id) {
      const response = await api.put(`/juridicos/${data.id}`, data);
      return response.data;
    } else {
      const response = await api.post(`/juridicos/`, data);
      return response.data;
    }
};

export const buscarJuridicoPorCNPJ = async (cnpj: string): Promise<JuridicoCompleto> => {
    const response = await api.get(`/juridicos/cnpj/${cnpj}`);
    return response.data;
};

export const buscarTodosJuridicos = async (): Promise<Juridico[]> => {
    const response = await api.get('/juridicos');
    return response.data;
};

export const buscarJuridicoPorId = async (id: number): Promise<JuridicoCompleto> => {
    const response = await api.get(`/juridicos/${id}`);
    return response.data;
};

export const excluirJuridico = async (id: number): Promise<void> => {
    await api.delete(`/juridicos/${id}`);
};

// Função para validar CNPJ (básica)
export const validarCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpjLimpo.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let peso = 2;
  
  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cnpjLimpo[12]) !== digito1) return false;
  
  // Segundo dígito verificador
  soma = 0;
  peso = 2;
  
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(cnpjLimpo[13]) === digito2;
};

// Função para formatar CNPJ
export const formatarCNPJ = (cnpj: string): string => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

// Função para converter Juridico para Customer (compatibilidade com o sistema existente)
export const juridicoToCustomer = (juridico: JuridicoCompleto): any => {
  return {
    id: juridico.id?.toString() || '',
    fullName: juridico.razao_social || '',
    cpf: juridico.cnpj || '', // Usando CNPJ no campo CPF para compatibilidade
    rg: '',
    contato: juridico.contato || '',
    email: juridico.email || '',
    data_nascimento: '',
    sexo: 'M',
    tipoServidor: 'juridico',
    cargo: '',
    lotacao: '',
    secretaria_id: 0,
    secretaria: '',
    is_whatsapp: false,
    // Dados de endereço (primeiro endereço se existir)
    logradouro: juridico.enderecos?.[0]?.logradouro || '',
    bairro: juridico.enderecos?.[0]?.bairro || '',
    numero: juridico.enderecos?.[0]?.numero || '',
    complemento: juridico.enderecos?.[0]?.complemento || '',
    cidade: juridico.enderecos?.[0]?.cidade || '',
    uf: juridico.enderecos?.[0]?.uf || '',
    cep: juridico.enderecos?.[0]?.cep || '',
    // Campos específicos de jurídico
    razao_social: juridico.razao_social,
    cnpj: juridico.cnpj,
    representante: juridico.representante_nome,
    // Campos de processo
    tipoProcesso: '',
    tipoProcesso_escolhido: '',
    tipoProcessoOutro: '',
    camposExtras: {},
    // Campos de controle
    status: 'pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
import api from '@/config/api';
import { TipoServidor, TipoServidorSimples, TipoServidorCreate, TipoServidorUpdate } from '@/types/tipoServidor';

// Buscar todos os tipos de servidor
export const buscarTiposServidor = async (): Promise<TipoServidor[]> => {
  const response = await api.get('/tipos-servidor');
  return response.data;
};

// Buscar tipos de servidor simplificados (para selects)
export const buscarTiposServidorSimples = async (): Promise<TipoServidorSimples[]> => {
  const response = await api.get('/tipos-servidor/simples');
  return response.data;
};

// Buscar tipo de servidor por ID
export const buscarTipoServidorPorId = async (id: number): Promise<TipoServidor> => {
  const response = await api.get(`/tipos-servidor/${id}`);
  return response.data;
};

// Criar novo tipo de servidor
export const criarTipoServidor = async (data: TipoServidorCreate): Promise<TipoServidor> => {
  const response = await api.post('/tipos-servidor', data);
  return response.data;
};

// Atualizar tipo de servidor
export const atualizarTipoServidor = async (id: number, data: TipoServidorUpdate): Promise<TipoServidor> => {
  const response = await api.put(`/tipos-servidor/${id}`, data);
  return response.data;
};

// Excluir tipo de servidor
export const excluirTipoServidor = async (id: number): Promise<void> => {
  await api.delete(`/tipos-servidor/${id}`);
};

export default {
  buscarTiposServidor,
  buscarTiposServidorSimples,
  buscarTipoServidorPorId,
  criarTipoServidor,
  atualizarTipoServidor,
  excluirTipoServidor
};
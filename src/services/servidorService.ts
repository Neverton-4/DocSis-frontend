import api from '@/config/api'; // ✅ Usar configuração centralizada
import { Servidor } from '@/types';

// Busca simplificada por nome (retorna apenas id, nome_completo, cpf)
export const buscarServidoresPorNome = async (nome: string): Promise<{id: string, nome_completo: string, cpf: string}[]> => {
  const response = await api.get(`/servidores?nome=${nome}`);
  return response.data;
};

// Nova função: Busca simplificada por CPF (retorna apenas id, nome_completo, cpf)
export const buscarServidoresPorCPF = async (cpf: string): Promise<{id: string, nome_completo: string, cpf: string}[]> => {
  const response = await api.get(`/servidores?cpf=${cpf}`);
  return response.data;
};

// Nova função: Busca com ambos os parâmetros
export const buscarServidoresPorNomeECPF = async (nome: string, cpf: string): Promise<{id: string, nome_completo: string, cpf: string}[]> => {
  const response = await api.get(`/servidores?nome=${nome}&cpf=${cpf}`);
  return response.data;
};

// Cria ou atualiza o servidor baseado no ID
export const salvarServidor = async (data: Omit<Servidor, 'id' | 'created_at' | 'updated_at'> | Servidor): Promise<Servidor> => {
    if ('id' in data && data.id) {
      const response = await api.put(`/servidores/${data.id}`, data);
      return response.data;
    } else {
      const response = await api.post(`/servidores/`, data);
      return response.data;
    }
};

export const buscarServidorPorCPF = async (cpf: string): Promise<Servidor> => {
    const response = await api.get(`/servidores/cpf/${cpf}`);
    return response.data;
};

export const buscarTodosServidores = async (): Promise<Servidor[]> => {
    const response = await api.get('/servidores');
    return response.data;
};

export const buscarServidorPorId = async (id: number): Promise<Servidor> => {
    const response = await api.get(`/servidores/${id}`);
    return response.data;
};

export const excluirServidor = async (id: number): Promise<void> => {
    await api.delete(`/servidores/${id}`);
};

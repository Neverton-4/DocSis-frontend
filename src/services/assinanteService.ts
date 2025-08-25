import api from '@/config/api';
import { Assinante, UsuarioAssinante } from '@/types';

export const assinanteService = {
  // Buscar todos os assinantes
  async getAll(): Promise<Assinante[]> {
    const response = await api.get('/assinantes');
    return response.data;
  },

  // Buscar assinante por ID
  async getById(id: number): Promise<Assinante> {
    const response = await api.get(`/assinantes/${id}`);
    return response.data;
  },

  // Buscar assinantes por tela
  async getByTela(telaId: number): Promise<Assinante[]> {
    const response = await api.get(`/assinantes?tela_id=${telaId}`);
    return response.data;
  },

  // Buscar assinantes por tipo e tela
  async getByTipoETela(tipo: 'prefeito' | 'secretario' | 'procurador' | 'controlador', telaId: number): Promise<Assinante[]> {
    const response = await api.get(`/assinantes?tipo=${tipo}&tela_id=${telaId}`);
    return response.data;
  },

  // Criar novo assinante (atualizado para incluir tela_id)
  async create(assinante: Omit<Assinante, 'id'>): Promise<Assinante> {
    const response = await api.post('/assinantes', assinante);
    return response.data;
  },

  // Atualizar assinante
  async update(id: number, assinante: Partial<Assinante>): Promise<Assinante> {
    const response = await api.put(`/assinantes/${id}`, assinante);
    return response.data;
  },

  // Deletar assinante
  async delete(id: number): Promise<void> {
    await api.delete(`/assinantes/${id}`);
  },

  // Buscar assinantes de um usuário
  async getByUsuario(usuarioId: number): Promise<UsuarioAssinante[]> {
    const response = await api.get(`/usuarios/${usuarioId}/assinantes`);
    return response.data;
  },

  // Associar assinante a usuário
  async associarUsuario(usuarioId: number, assinanteId: number, podeAssinar: boolean = true): Promise<UsuarioAssinante> {
    const response = await api.post('/usuario-assinantes', {
      usuario_id: usuarioId,
      assinante_id: assinanteId,
      pode_assinar: podeAssinar
    });
    return response.data;
  },

  // Remover associação usuário-assinante
  async desassociarUsuario(usuarioAssinanteId: number): Promise<void> {
    await api.delete(`/usuario-assinantes/${usuarioAssinanteId}`);
  },

  // Atualizar permissão de assinatura
  async atualizarPermissaoAssinatura(usuarioAssinanteId: number, podeAssinar: boolean): Promise<UsuarioAssinante> {
    const response = await api.put(`/usuario-assinantes/${usuarioAssinanteId}`, {
      pode_assinar: podeAssinar
    });
    return response.data;
  },

  // Buscar assinantes por tipo
  async getByTipo(tipo: 'prefeito' | 'secretario' | 'procurador'): Promise<Assinante[]> {
    const response = await api.get(`/assinantes?tipo=${tipo}`);
    return response.data;
  }
};
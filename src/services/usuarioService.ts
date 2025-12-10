import api from '@/config/api'; // ✅ Usar configuração centralizada
import { Usuario, PermissaoUsuario, UsuarioComPermissoes, UsuarioAssinante } from '@/types';

class UsuarioService {
  // Buscar todos os usuários
  async getAll(): Promise<
    Array<{
      id: number;
      nome: string;
      cargo: string;
      secretaria_id: number;
      secretaria_nome: string;
      status: 'ativo' | 'inativo';
    }>
  > {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  // Buscar usuário por ID
  async getById(id: number): Promise<Usuario> {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  // Buscar usuário com permissões
  async getByIdWithPermissions(id: number): Promise<UsuarioComPermissoes> {
    try {
      const response = await api.get(`/usuarios/${id}/permissoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário com permissões:', error);
      throw error;
    }
  }

  // Buscar usuário com assinantes
  async getByIdWithAssinantes(id: number): Promise<Usuario & { assinantes: UsuarioAssinante[] }> {
    const response = await api.get(`/usuarios/${id}/with-assinantes`);
    return response.data;
  }

  // Buscar usuários que podem assinar como determinado tipo
  async getUsuariosQuePodemAssinar(tipoAssinante: 'prefeito' | 'secretario' | 'procurador'): Promise<Usuario[]> {
    const response = await api.get(`/usuarios/podem-assinar/${tipoAssinante}`);
    return response.data;
  }

  // Criar usuário
  async create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    try {
      const response = await api.post('/usuarios', usuario);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário
  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    try {
      const response = await api.put(`/usuarios/${id}`, usuario);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Excluir usuário
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }

  // Atualizar permissões do usuário
  async updatePermissions(userId: number, permissoes: PermissaoUsuario[]): Promise<UsuarioComPermissoes> {
    try {
      const response = await api.put(`/usuarios/${userId}/permissoes`, { permissoes });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  }
}

export const usuarioService = new UsuarioService();
export default usuarioService;
import { useState, useCallback } from 'react';
import { usuarioService } from '@/services/usuarioService';
import { Usuario, PermissaoUsuario, UsuarioComPermissoes } from '@/types';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getById(id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByIdWithPermissions = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getByIdWithPermissions(id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newUsuario = await usuarioService.create(usuario);
      setUsuarios(prev => [...prev, newUsuario]);
      return newUsuario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: number, usuario: Partial<Usuario>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUsuario = await usuarioService.update(id, usuario);
      setUsuarios(prev => prev.map(u => u.id === id ? updatedUsuario : u));
      return updatedUsuario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await usuarioService.delete(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsuariosQuePodemAssinar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getUsuariosQuePodemAssinar();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarPermissao = useCallback(async (usuarioId: number, permissao: string) => {
    setLoading(true);
    setError(null);
    try {
      const newPermissao = await usuarioService.adicionarPermissao(usuarioId, permissao);
      return newPermissao;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removerPermissao = useCallback(async (usuarioId: number, permissao: string) => {
    setLoading(true);
    setError(null);
    try {
      await usuarioService.removerPermissao(usuarioId, permissao);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissoes = useCallback(async (usuarioId: number) => {
    setLoading(true);
    setError(null);
    try {
      const permissoes = await usuarioService.getPermissoes(usuarioId);
      return permissoes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const temPermissao = useCallback(async (usuarioId: number, permissao: string) => {
    try {
      return await usuarioService.temPermissao(usuarioId, permissao);
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      return false;
    }
  }, []);

  return {
    usuarios,
    loading,
    error,
    fetchAll,
    fetchById,
    fetchByIdWithPermissions,
    create,
    update,
    remove,
    fetchUsuariosQuePodemAssinar,
    adicionarPermissao,
    removerPermissao,
    getPermissoes,
    temPermissao
  };
};
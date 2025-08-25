import { useState, useEffect } from 'react';
import { assinanteService } from '@/services/assinanteService';
import { Assinante, UsuarioAssinante } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const useAssinantes = () => {
  const [assinantes, setAssinantes] = useState<Assinante[]>([]);
  const [usuarioAssinantes, setUsuarioAssinantes] = useState<UsuarioAssinante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Buscar todos os assinantes
  const fetchAssinantes = async () => {
    try {
      setLoading(true);
      const data = await assinanteService.getAll();
      setAssinantes(data);
    } catch (err) {
      setError('Erro ao buscar assinantes');
    } finally {
      setLoading(false);
    }
  };

  // Buscar assinantes do usuário atual
  const fetchUsuarioAssinantes = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await assinanteService.getByUsuario(user.id);
      setUsuarioAssinantes(data);
    } catch (err) {
      setError('Erro ao buscar assinantes do usuário');
    } finally {
      setLoading(false);
    }
  };

  // Associar assinante ao usuário
  const associarAssinante = async (assinanteId: number, podeAssinar: boolean = true) => {
    if (!user?.id) return;
    
    try {
      await assinanteService.associarUsuario(user.id, assinanteId, podeAssinar);
      await fetchUsuarioAssinantes();
    } catch (err) {
      setError('Erro ao associar assinante');
    }
  };

  // Remover associação
  const desassociarAssinante = async (usuarioAssinanteId: number) => {
    try {
      await assinanteService.desassociarUsuario(usuarioAssinanteId);
      await fetchUsuarioAssinantes();
    } catch (err) {
      setError('Erro ao desassociar assinante');
    }
  };

  useEffect(() => {
    fetchAssinantes();
    if (user?.id) {
      fetchUsuarioAssinantes();
    }
  }, [user?.id]);

  return {
    assinantes,
    usuarioAssinantes,
    loading,
    error,
    fetchAssinantes,
    fetchUsuarioAssinantes,
    associarAssinante,
    desassociarAssinante
  };
};
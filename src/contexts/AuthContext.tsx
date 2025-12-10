import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import api from '@/config/api';
import { PermissionService } from '@/lib/PermissionService';
import { PermissaoUsuario, Departamento, Secretaria } from '@/types';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  nome: string;
  cargo: string;
  pode_assinar: boolean;
  servidor_id: number;  // Adicionando servidor_id
  department?: string;
  departamento_id: number;
  departamento?: {
    id: number;
    nome: string;
  };
  secretaria?: {
    id: number;
    nome: string;
    abrev:string;
  };
  permissoes?: PermissaoUsuario[];
  usuario_assinantes?: Array<{
    id: number;
    assinante_id: number;
    assinante_nome: string;
    assinante_tipo: string;
    assinante_cargo_id?: number | null;
    assinante_cargo_nome?: string | null;
    documentos: string[];
  }>;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  temPermissao: (permissao: string, telaId?: number) => boolean;
  getNomePermissao: (permissao: string, telaId?: number) => string;
  podeAssinar: () => boolean;
  podeAssinarComo: (tipo: 'prefeito' | 'secretario' | 'procurador') => boolean;
  getAssinantesDoUsuario: () => Array<{ id: number; tela_id: number; tipo: string; nome: string }> | undefined;
  getAssinantesPorTela: (telaId: number) => Array<{ id: number; tela_id: number; tipo: string; nome: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      // Normalizar o payload para garantir departamento_id no topo
      const normalized = {
        ...data,
        departamento_id: data?.departamento?.id ?? data?.departamento_id,
      };
      setUser(normalized);
      PermissionService.setPermissions(normalized?.permissoes || []);
      try {
        const telasResp = await api.get('/telas');
        const map: Record<string, number> = {}
        for (const t of telasResp.data || []) {
          if (t && t.codigo && typeof t.id === 'number') {
            map[t.codigo] = t.id
          }
        }
        PermissionService.setScreenMap(map)
      } catch (e) {
        console.warn('Falha ao carregar telas', e)
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o usuário tem uma permissão específica
  const temPermissao = (permissao: string, telaId?: number): boolean => {
    return PermissionService.has(permissao, telaId);
  };
  
  // Função para obter o nome da permissão
  const getNomePermissao = (permissao: string, telaId?: number): string => {
    return PermissionService.getName(permissao, telaId) || permissao;
  };
  
  // Função para verificar se o usuário pode assinar documentos
  const podeAssinar = (): boolean => {
    return user?.pode_assinar || false;
  };

  const login = async (username: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
  
      const response = await api.post('/auth/token', formData);
  
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
  
      // Configura o token no axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  
      // Agora busca os dados completos do usuário
      await checkAuth();
      PermissionService.load();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          throw new Error('Usuário ou senha inválidos');
        } else if (axiosError.response?.status === 403) {
          throw new Error('Usuário inativo ou sem permissão de acesso');
        } else if (axiosError.response?.status === 404) {
          throw new Error('Servidor de autenticação não encontrado');
        } else if (axiosError.response?.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        } else if (!axiosError.response) {
          throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          throw new Error('Ocorreu um erro durante a autenticação');
        }
      } else {
        throw new Error('Ocorreu um erro inesperado');
      }
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    PermissionService.setPermissions([]);
  };

  // Verificar se pode assinar como determinado tipo
  const podeAssinarComo = (tipo: 'prefeito' | 'secretario' | 'procurador'): boolean => {
    if (!user?.usuario_assinantes) return false;
    return user.usuario_assinantes.some(a => String(a.assinante_tipo).toLowerCase() === tipo);
  };
  
  // Nova função para filtrar assinantes por tela
  const getAssinantesPorTela = (telaId: number) => {
    if (!user?.usuario_assinantes) return [];
    return user.usuario_assinantes.map(a => ({ id: a.id, tela_id: telaId, tipo: String(a.assinante_tipo), nome: a.assinante_nome }));
  };
  
  // Atualizar a função getAssinantesDoUsuario para incluir tela_id
  const getAssinantesDoUsuario = () => {
    if (!user?.usuario_assinantes) return undefined;
    return user.usuario_assinantes.map(a => ({ id: a.id, tela_id: 0, tipo: String(a.assinante_tipo), nome: a.assinante_nome }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading,
      temPermissao,
      getNomePermissao,
      podeAssinar,
      podeAssinarComo,
      getAssinantesDoUsuario,
      getAssinantesPorTela
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
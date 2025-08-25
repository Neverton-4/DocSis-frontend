import React, { createContext, useContext, useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import api from '@/config/api';
import { PermissaoUsuario, Departamento, Secretaria } from '@/types';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  nome: string;
  cargo: string;
  pode_assinar: boolean;
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
  assinantes?: Array<{
    id: number;
    tela_id: number;
    tipo: string;
    nome: string;
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
      setUser(response.data);
      console.log(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o usuário tem uma permissão específica
  const temPermissao = (permissao: string, telaId?: number): boolean => {
    if (!user || !user.permissoes) return false;
    
    return user.permissoes.some(p => {
      const temPermissaoCorreta = p.permissao === permissao && (p.ativo !== false);
      
      // Se telaId foi fornecido, valida também a tela
      if (telaId !== undefined) {
        return temPermissaoCorreta && p.tela === telaId;
      }
      
      return temPermissaoCorreta;
    });
  };
  
  // Função para obter o nome da permissão
  const getNomePermissao = (permissao: string, telaId?: number): string => {
    if (!user || !user.permissoes) return permissao;
    
    const permissaoEncontrada = user.permissoes.find(p => {
      const temPermissaoCorreta = p.permissao === permissao && (p.ativo !== false);
      
      if (telaId !== undefined) {
        return temPermissaoCorreta && p.tela === telaId;
      }
      
      return temPermissaoCorreta;
    });
    
    return permissaoEncontrada?.nome || permissao;
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
  };

  // Verificar se pode assinar como determinado tipo
  const podeAssinarComo = (tipo: 'prefeito' | 'secretario' | 'procurador'): boolean => {
    if (!user?.assinantes) return false;
    return user.assinantes.some(assinante => assinante.tipo === tipo);
  };
  
  // Nova função para filtrar assinantes por tela
  const getAssinantesPorTela = (telaId: number) => {
    if (!user?.assinantes) return [];
    return user.assinantes.filter(assinante => assinante.tela_id === telaId);
  };
  
  // Atualizar a função getAssinantesDoUsuario para incluir tela_id
  const getAssinantesDoUsuario = () => {
    return user?.assinantes;
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
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionService } from '@/lib/PermissionService';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedDepartments?: string[];
  requiredPermission?: { codigo: string; telaId?: number };
  telaId?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  allowedDepartments = [],
  requiredPermission,
  telaId
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return null;
  }

  // Verifica se o usuário tem a role necessária
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn('[route-denied]', { path: location.pathname, userId: user.id, reason: 'role' });
    toast.error('Você não tem permissão para acessar esta página');
    return <Navigate to="/" replace />;
  }

  // Se for um usuário comum, verifica se tem acesso ao departamento
  if (user.role === 'user' && allowedDepartments.length > 0) {
    if (!user.department || !allowedDepartments.includes(user.department)) {
      console.warn('[route-denied]', { path: location.pathname, userId: user.id, reason: 'department' });
      toast.error('Você não tem permissão para acessar este departamento');
      return <Navigate to="/" replace />;
    }
  }

  if (requiredPermission) {
    const hasTela = typeof requiredPermission.telaId === 'number'
    const ok = hasTela ? PermissionService.has(requiredPermission.codigo, requiredPermission.telaId) : false
    if (!ok) {
      console.warn('[route-denied]', { path: location.pathname, userId: user.id, reason: 'permission', codigo: requiredPermission.codigo, telaId: requiredPermission.telaId });
      toast.error('Acesso negado por falta de permissão')
      return <Navigate to="/" replace />
    }
  } else if (typeof telaId === 'number') {
    const ok = PermissionService.canAccessScreen(telaId)
    if (!ok) {
      console.warn('[route-denied]', { path: location.pathname, userId: user.id, reason: 'screen', telaId });
      toast.error('Acesso negado à tela')
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
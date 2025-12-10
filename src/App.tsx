import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
const Protocolo = lazy(() => import('./pages/protocol/ProtocolDashboard/ProtocolDashboard'));
const ProtocolDetails = lazy(() => import('./pages/protocol/ProtocolDetails/ProtocolDetails'));
const ProtocolDocumentViewer = lazy(() => import('./pages/protocol/ProtocolViewer/ProtocolViewer'));
const NovoProtocolo = lazy(() => import('./pages/protocol/NewProtocol/NewProtocol'));
const CadastrarServidor = lazy(() => import('./pages/registrations/CadastrarServidor'));
const CadastrarCidadao = lazy(() => import('./pages/registrations/CadastrarCidadao'));
const CadastrarJuridico = lazy(() => import('./pages/registrations/CadastrarJuridico'));
const CadastrarUsuario = lazy(() => import('./pages/registrations/CadastrarUsuario/CadastrarUsuario'));
const Departamentos = lazy(() => import('./pages/registrations/departamentos/Departamentos'));
const Secretarias = lazy(() => import('./pages/registrations/secretarias/Secretarias'));
const Servidores = lazy(() => import('./pages/registrations/Servidores/Servidores'));
const ServidorDetails = lazy(() => import('./pages/registrations/ServidorDetails/ServidorDetails'));
const Usuarios = lazy(() => import('./pages/registrations/usuarios/Usuarios'));
const TiposProcessos = lazy(() => import('./pages/registrations/tipos de processos/TiposProcessos'));
const Documentos = lazy(() => import('./pages/documents/DocumentDashboard/management'));
const AddDocument = lazy(() => import('./pages/documents/AddDocument/AddDocument'));
const Publications = lazy(() => import('./pages/publications/Publications'));
const Signatures = lazy(() => import('./pages/signatures/Signatures/Signatures'));
const DocumentViewer = lazy(() => import('./pages/signatures/SignatureViewer/SignatureViewer'));
const DocumentViewerPage = lazy(() => import('./pages/documents/viewing/viewing'));
const Assessorias = lazy(() => import('./pages/assessorias/Assessorias'));
const Servidor = lazy(() => import('./pages/servidor/Servidor'));
const ServidorProcessDetails = lazy(() => import('./pages/servidor/ServidorProcessDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const EsqueciSenha = lazy(() => import('./pages/auth/EsqueciSenha'));
const MainScreen = lazy(() => import('./pages/dashboard/MainScreen'));
const MainScreenWithHeader = lazy(() => import('./pages/dashboard/MainScreenWithHeader'));
import { ProtectedRoute } from './components/layout';
import { PermissionService } from '@/lib/PermissionService';

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const isLoginPage = location.pathname === '/login';
  const isEsqueciSenhaPage = location.pathname === '/esqueci-senha';
  const isAdmin = user?.role === 'admin';
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <TooltipProvider>
      <div className="h-screen bg-background">
        <main className="h-full">
<Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
  <Routes>
    <Route path="/" element={<MainScreen />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/esqueci-senha" element={<EsqueciSenha />} />

    <Route path="/main" element={<ProtectedRoute><MainScreenWithHeader /></ProtectedRoute>} />

    <Route path="/publications" element={<Publications />} />
    <Route path="/servidor" element={<Servidor />} />
    <Route path="/servidor/:id" element={<ServidorDetails />} />

    <Route path="/protocolo" element={<ProtectedRoute telaId={1}><Protocolo /></ProtectedRoute>} />
    <Route path="/processo/:id" element={<ProtectedRoute telaId={1}><ProtocolDetails /></ProtectedRoute>} />
    <Route path="/processos/:id/documento/:documentoId" element={<ProtectedRoute telaId={1}><ProtocolDocumentViewer /></ProtectedRoute>} />
    <Route path="/processo/novo" element={<ProtectedRoute requiredPermission={{ codigo: 'novo_protocolo', telaId: 1 }}><NovoProtocolo /></ProtectedRoute>} />

    <Route path="/documentos" element={<ProtectedRoute telaId={2}><Documentos /></ProtectedRoute>} />
    <Route path="/create-document" element={<ProtectedRoute allowedRoles={['admin']}><AddDocument /></ProtectedRoute>} />

    <Route path="/signatures" element={<ProtectedRoute telaId={3}><Signatures /></ProtectedRoute>} />
    <Route path="/document-viewer/:tipo/:id" element={<ProtectedRoute><DocumentViewer /></ProtectedRoute>} />
    <Route path="/documentos/viewer/:tipo/:id" element={<ProtectedRoute><DocumentViewerPage /></ProtectedRoute>} />

    <Route path="/assessorias" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('assessorias') }}><Assessorias /></ProtectedRoute>} />

    <Route path="/cadastros/departamentos" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('registrations') }}><Departamentos /></ProtectedRoute>} />
    <Route path="/cadastros/secretarias" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('registrations') }}><Secretarias /></ProtectedRoute>} />
    <Route path="/cadastros/servidores" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('registrations') }}><Servidores /></ProtectedRoute>} />
    <Route path="/cadastros/servidores/:id" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('registrations') }}><ServidorDetails /></ProtectedRoute>} />
    <Route path="/cadastros/usuarios" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('registrations') }}><Usuarios /></ProtectedRoute>} />
    <Route path="/cadastros/tipos-processos" element={<ProtectedRoute requiredPermission={{ codigo: 'acesso_tela', telaId: PermissionService.resolveTelaId('registrations') }}><TiposProcessos /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
</Suspense>
        </main>
      </div>
      <Toaster />
    </TooltipProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

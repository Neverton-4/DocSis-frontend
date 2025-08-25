import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from './pages/protocolos/Dashboard/Dashboard';
import ProtocolDetails from './pages/protocolos/ProtocolDetails/ProtocolDetails';
import NovoProtocolo from './pages/protocolos/NovoProtocolo/NovoProtocolo';
import Departamentos from './pages/cadastros/Departamentos';
import Servidores from './pages/cadastros/Servidores';
import TiposProcessos from './pages/cadastros/TiposProcessos';
import ProcessoDetalhes from './pages/testes/ProcessoDetalhes';
import Criacao from './pages/documentos/Criacao';
import Create from './pages/documentos/CreateDocument';
import NewDocument from './pages/documentos/NewDocument';
import Publications from './pages/documentos/Publications';
import Signatures from './pages/signatures/Signatures';
import DocumentViewer from './pages/signatures/DocumentViewer';
import NotFound from "./pages/NotFound";
import Login from './pages/login/Login';
import EsqueciSenha from './pages/EsqueciSenha';
import ProtectedRoute from './components/ProtectedRoute';

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
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/protocolos/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            {isAdmin && (
              <>
                <Route path="/protocolo/:id" element={<ProtectedRoute allowedRoles={['admin']}><ProtocolDetails /></ProtectedRoute>} />
                <Route path="/protocolo/novo" element={<ProtectedRoute allowedRoles={['admin']}><NovoProtocolo /></ProtectedRoute>} />
                <Route path="/departamentos" element={<ProtectedRoute allowedRoles={['admin']}><Departamentos /></ProtectedRoute>} />
                <Route path="/servidores" element={<ProtectedRoute allowedRoles={['admin']}><Servidores /></ProtectedRoute>} />
                <Route path="/tipos-processos" element={<ProtectedRoute allowedRoles={['admin']}><TiposProcessos /></ProtectedRoute>} />
                <Route path="/documentos/criacao" element={<ProtectedRoute allowedRoles={['admin']}><Criacao /></ProtectedRoute>} />
                <Route path="/documentos/CreateDocument" element={<ProtectedRoute allowedRoles={['admin']}><Create /></ProtectedRoute>} />
                <Route path="/create-document" element={<ProtectedRoute allowedRoles={['admin']}><NewDocument /></ProtectedRoute>} />
                <Route path="/documentos/publications" element={<ProtectedRoute allowedRoles={['admin']}><Publications /></ProtectedRoute>} />
                <Route path="/documentos/signatures" element={<ProtectedRoute allowedRoles={['admin']}><Signatures /></ProtectedRoute>} />
                <Route path="/document-viewer/:id" element={<ProtectedRoute allowedRoles={['admin']}><DocumentViewer /></ProtectedRoute>} />
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
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

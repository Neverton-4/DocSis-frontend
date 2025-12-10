import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout';
import { useAuth } from '../../contexts/AuthContext';

const MainScreenWithHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    // Reabrir a tela principal (recarregar a página atual)
    window.location.reload();
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header com todas as opções */}
      <Header 
        userName={user?.nome || 'Usuário'} 
        userRole={user?.role || 'user'} 
        breadcrumb="Tela Principal" 
      />
      
      {/* Conteúdo principal */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          {/* Logo completa centralizada */}
          <div className="mb-8">
            <img
              src="/logo-completa.png"
              alt="Logo Completa"
              className="mx-auto cursor-pointer hover:scale-105 transition-transform duration-300 max-w-md w-full h-auto"
              onClick={handleLogoClick}
            />
          </div>
          
          {/* Mensagem de boas-vindas */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Bem-vindo ao Sistema de Protocolos
            </h2>
            <p className="text-gray-600 mb-6">
              Utilize o menu superior para navegar pelas funcionalidades do sistema
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainScreenWithHeader;
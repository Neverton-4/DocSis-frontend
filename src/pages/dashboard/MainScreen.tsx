import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Reabrir a tela principal (recarregar a página atual)
    window.location.reload();
  };

  const handleEnterSystem = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
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
        
        {/* Botão para entrar no sistema */}
        <button
          onClick={handleEnterSystem}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors duration-300 text-lg"
        >
          Entrar no Sistema
        </button>
      </div>
    </div>
  );
};

export default MainScreen;
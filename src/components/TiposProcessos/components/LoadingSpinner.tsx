// components/LoadingSpinner.tsx
import React from 'react';
import Header from '@/components/Header';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <Header 
        userName="João Silva" 
        userRole="Administrador" 
        breadcrumb="Tipos de Processos" 
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tipos de processos...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
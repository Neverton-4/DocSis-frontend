import React from 'react';
import { Loader2 } from 'lucide-react';

const ServidoresLoading: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Carregando servidores...</h2>
          <p className="text-gray-600">Aguarde enquanto buscamos os dados dos servidores.</p>
        </div>
      </div>
    </div>
  );
};

export default ServidoresLoading;
// components/EmptyState.tsx
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg mb-4">Nenhum tipo de processo encontrado</p>
      <p className="text-gray-400">Clique em "ADICIONAR PROCESSO" para criar o primeiro tipo de processo.</p>
    </div>
  );
};

export default EmptyState;
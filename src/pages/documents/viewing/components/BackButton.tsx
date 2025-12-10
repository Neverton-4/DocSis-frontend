import React from 'react';

interface BackButtonProps {
  onBack: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <button
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer mb-4"
      >
        ← Voltar
      </button>
    </div>
  );
};
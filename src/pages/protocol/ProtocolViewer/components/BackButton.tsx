import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onBack }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4">
      <Button 
        onClick={onBack} 
        variant="outline"
        className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
    </div>
  );
};
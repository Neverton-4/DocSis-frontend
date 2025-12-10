import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ServidoresActions: React.FC = () => {
  const navigate = useNavigate();

  const handleNovoServidor = () => {
    navigate('/servidores/cadastrar');
  };

  return (
    <div className="flex items-center gap-4">
      {/* Botão Novo Servidor */}
      <Button 
        onClick={handleNovoServidor}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Servidor
      </Button>
    </div>
  );
};

export default ServidoresActions;
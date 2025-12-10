import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UsuariosActions: React.FC = () => {
  const navigate = useNavigate();

  const handleNovoUsuario = () => {
    // Redireciona para nova tela de cadastro de usuário
    navigate('/usuarios/cadastrar');
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={handleNovoUsuario}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        aria-label="Criar Novo Usuário"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar Novo Usuário
      </Button>
    </div>
  );
};

export default UsuariosActions;
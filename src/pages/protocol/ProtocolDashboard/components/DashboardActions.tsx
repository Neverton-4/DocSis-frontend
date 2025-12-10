import React from 'react';
import { Plus, Loader2, User, Users, Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PermissionGate from '@/components/shared/PermissionGate';

interface DashboardActionsProps {
  yearDialogOpen: boolean;
  setYearDialogOpen: (open: boolean) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  isLoading: boolean;
  handleYearChange: (year: string) => void;
  protocolTypeDialogOpen: boolean;
  setProtocolTypeDialogOpen: (open: boolean) => void;
  registrationDialogOpen: boolean;
  setRegistrationDialogOpen: (open: boolean) => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  yearDialogOpen,
  setYearDialogOpen,
  selectedYear,
  setSelectedYear,
  isLoading,
  handleYearChange,
  protocolTypeDialogOpen,
  setProtocolTypeDialogOpen,
  registrationDialogOpen,
  setRegistrationDialogOpen
}) => {
  const navigate = useNavigate();

  const handleProtocolTypeSelect = (type: 'servidor' | 'cidadao' | 'juridico') => {
    setProtocolTypeDialogOpen(false);
    if (type === 'servidor') {
      navigate('/processo/novo');
    } else if (type === 'cidadao') {
      navigate('/processo/novo?tipo=cidadao');
    } else if (type === 'juridico') {
      navigate('/processo/novo?tipo=juridico');
    }
  };

  const handleRegistrationTypeSelect = (type: 'servidor' | 'cidadao' | 'juridico') => {
    setRegistrationDialogOpen(false);
    if (type === 'servidor') {
      navigate('/servidores/cadastrar');
    } else if (type === 'cidadao') {
      navigate('/cidadaos/cadastrar');
    } else if (type === 'juridico') {
      navigate('/juridicos/cadastrar');
    }
  };

  return (
    <div className="flex gap-4">
      {/* Botão de Cadastro */}
      <PermissionGate codigo="novo_cadastro" telaId={1}>
        <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              CADASTRAR
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold">
                Selecione o tipo de cadastro
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Botão Servidor */}
                <Button
                  onClick={() => handleRegistrationTypeSelect('servidor')}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <User className="h-8 w-8" />
                  <span className="text-lg font-medium">Servidor</span>
                </Button>
                
                {/* Botão Cidadão */}
                <Button
                  onClick={() => handleRegistrationTypeSelect('cidadao')}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Users className="h-8 w-8" />
                  <span className="text-lg font-medium">Cidadão</span>
                </Button>

                {/* Botão Jurídico */}
                <Button
                  onClick={() => handleRegistrationTypeSelect('juridico')}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Building2 className="h-8 w-8" />
                  <span className="text-lg font-medium">Jurídico</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PermissionGate>

      {/* Dialog de seleção de tipo de protocolo */}
      <PermissionGate codigo="novo_protocolo" telaId={1}>
        <Dialog open={protocolTypeDialogOpen} onOpenChange={setProtocolTypeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              NOVO PROTOCOLO
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold">
                Selecione o tipo de protocolo
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Botão Servidor */}
                <Button
                  onClick={() => handleProtocolTypeSelect('servidor')}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <User className="h-8 w-8" />
                  <span className="text-lg font-medium">Servidor</span>
                </Button>
                
                {/* Botão Cidadão */}
                <Button
                  onClick={() => handleProtocolTypeSelect('cidadao')}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Users className="h-8 w-8" />
                  <span className="text-lg font-medium">Cidadão</span>
                </Button>

                {/* Botão Jurídico */}
                <Button
                  onClick={() => handleProtocolTypeSelect('juridico')}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-3 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  <Building2 className="h-8 w-8" />
                  <span className="text-lg font-medium">Jurídico</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PermissionGate>

      {/* Dialog de seleção de ano (existente) */}
      <Dialog open={yearDialogOpen} onOpenChange={setYearDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            {selectedYear}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escolha um ano para acessar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => handleYearChange(selectedYear)}
              disabled={isLoading}
              className="bg-primary text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardActions;
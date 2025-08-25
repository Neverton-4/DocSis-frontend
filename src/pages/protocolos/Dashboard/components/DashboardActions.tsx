import React from 'react';
import { Plus, Loader2, User, Users } from 'lucide-react';
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

interface DashboardActionsProps {
  yearDialogOpen: boolean;
  setYearDialogOpen: (open: boolean) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  isLoading: boolean;
  handleYearChange: (year: string) => void;
  protocolTypeDialogOpen: boolean;
  setProtocolTypeDialogOpen: (open: boolean) => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({
  yearDialogOpen,
  setYearDialogOpen,
  selectedYear,
  setSelectedYear,
  isLoading,
  handleYearChange,
  protocolTypeDialogOpen,
  setProtocolTypeDialogOpen
}) => {
  const navigate = useNavigate();

  const handleProtocolTypeSelect = (type: 'servidor' | 'cidadao') => {
    setProtocolTypeDialogOpen(false);
    if (type === 'servidor') {
      navigate('/protocolo/novo');
    } else {
      // Para cidadão, você pode navegar para uma rota diferente ou implementar lógica específica
      // Por enquanto, vou manter a mesma rota
      navigate('/protocolo/novo?tipo=cidadao');
    }
  };

  return (
    <div className="flex gap-4">
      {/* Dialog de seleção de tipo de protocolo */}
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
// components/AddProcessDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tipoProcessoService } from '@/services/tipoProcessoService';
import { useToast } from '@/hooks/use-toast';

interface AddProcessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const processTypes = [
  { value: 'licenca', label: 'Licenças' },
  { value: 'declaracao', label: 'Declarações' },
  { value: 'gratificacao', label: 'Gratificações' },
  { value: 'outro', label: 'Outros' }
];

const AddProcessDialog: React.FC<AddProcessDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [newProcess, setNewProcess] = useState<{ 
    type: string; 
    name: string; 
    description: string 
  }>({
    type: '',
    name: '',
    description: ''
  });

  const handleAddProcess = async () => {
    if (newProcess.type && newProcess.name) {
      try {
        await tipoProcessoService.create({
          nome: newProcess.name,
          descricao: newProcess.description,
          tipo: newProcess.type as 'licenca' | 'gratificacao' | 'declaracao' | 'outro',
          campos_extras: {}
        });
        
        toast({
          title: "Sucesso",
          description: "Tipo de processo criado com sucesso.",
        });
        
        setNewProcess({ type: '', name: '', description: '' });
        onSuccess();
      } catch (error) {
        console.error('Erro ao criar tipo de processo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar o tipo de processo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setNewProcess({ type: '', name: '', description: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          ADICIONAR PROCESSO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Tipo de Processo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Categoria</Label>
            <Select
              value={newProcess.type}
              onValueChange={(value) => setNewProcess({ ...newProcess, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {processTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Processo</Label>
            <Input
              id="name"
              placeholder="Digite o nome do processo"
              value={newProcess.name}
              onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Digite a descrição (opcional)"
              value={newProcess.description}
              onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleAddProcess} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProcessDialog;
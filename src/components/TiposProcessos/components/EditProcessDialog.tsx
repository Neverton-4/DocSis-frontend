// components/EditProcessDialog.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { tipoProcessoService, TipoProcesso } from '@/services/tipoProcessoService';
import { useToast } from '@/hooks/use-toast';

interface EditProcessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingProcess: TipoProcesso | null;
  onEditingProcessChange: (process: TipoProcesso | null) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

const processTypes = [
  { value: 'licenca', label: 'Licenças' },
  { value: 'declaracao', label: 'Declarações' },
  { value: 'gratificacao', label: 'Gratificações' },
  { value: 'outro', label: 'Outros' }
];

const EditProcessDialog: React.FC<EditProcessDialogProps> = ({
  isOpen,
  onOpenChange,
  editingProcess,
  onEditingProcessChange,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();

  const handleUpdateProcess = async () => {
    if (editingProcess && editingProcess.nome.trim()) {
      try {
        await tipoProcessoService.update(editingProcess.id, {
          nome: editingProcess.nome,
          descricao: editingProcess.descricao || '',
          tipo: editingProcess.tipo,
          campos_extras: editingProcess.campos_extras || {}
        });
        
        toast({
          title: "Sucesso",
          description: "Tipo de processo atualizado com sucesso.",
        });
        
        onSuccess();
      } catch (error) {
        console.error('Erro ao atualizar tipo de processo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o tipo de processo.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tipo de Processo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-type">Categoria</Label>
            <Select
              value={editingProcess?.tipo || ''}
              onValueChange={(value) => 
                onEditingProcessChange(
                  editingProcess ? { 
                    ...editingProcess, 
                    tipo: value as 'licenca' | 'gratificacao' | 'declaracao' | 'outro' 
                  } : null
                )
              }
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
            <Label htmlFor="edit-name">Nome do Processo</Label>
            <Input
              id="edit-name"
              placeholder="Digite o nome do processo"
              value={editingProcess?.nome || ''}
              onChange={(e) => 
                onEditingProcessChange(
                  editingProcess ? { ...editingProcess, nome: e.target.value } : null
                )
              }
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              placeholder="Digite a descrição (opcional)"
              value={editingProcess?.descricao || ''}
              onChange={(e) => 
                onEditingProcessChange(
                  editingProcess ? { ...editingProcess, descricao: e.target.value } : null
                )
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateProcess} className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProcessDialog;
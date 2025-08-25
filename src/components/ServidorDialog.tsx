import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServidorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; cargo: string; departamento: string }) => void;
  departamentos: string[];
  defaultValues?: { nome: string; cargo: string; departamento: string };
  mode?: 'create' | 'edit';
}

const ServidorDialog: React.FC<ServidorDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  departamentos,
  defaultValues,
  mode = 'create'
}) => {
  const [formData, setFormData] = React.useState({
    nome: '',
    cargo: '',
    departamento: ''
  });

  useEffect(() => {
    if (open && mode === 'edit' && defaultValues) {
      setFormData({
        nome: defaultValues.nome,
        cargo: defaultValues.cargo,
        departamento: defaultValues.departamento
      });
    } else if (!open) {
      setFormData({
        nome: '',
        cargo: '',
        departamento: ''
      });
    }
  }, [open, mode, defaultValues]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nome: '', cargo: '', departamento: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Servidor' : 'Editar Servidor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Servidor</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Digite o nome do servidor"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cargo">Cargo/Função</Label>
              <Select
                value={formData.cargo}
                onValueChange={(value) => handleChange('cargo', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diretor Geral">Diretor Geral</SelectItem>
                  <SelectItem value="Chefe de Setor">Chefe de Setor</SelectItem>
                  <SelectItem value="Procurador Geral">Procurador Geral</SelectItem>
                  <SelectItem value="Advogado">Advogado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="departamento">Órgão</Label>
              <Select
                value={formData.departamento}
                onValueChange={(value) => handleChange('departamento', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServidorDialog; 
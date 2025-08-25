import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServidorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    nome: string;
    cargo: string;
    matricula: string;
    cpf: string;
    rg: string;
    lotacao: string;
  }) => void;
  defaultValues?: {
    nome: string;
    cargo: string;
    matricula: string;
    cpf: string;
    rg: string;
    lotacao: string;
  };
  mode?: 'create' | 'edit';
}

const ServidorFormDialog: React.FC<ServidorFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = 'create'
}) => {
  const [formData, setFormData] = React.useState({
    nome: '',
    cargo: '',
    matricula: '',
    cpf: '',
    rg: '',
    lotacao: ''
  });

  React.useEffect(() => {
    if (open && mode === 'edit' && defaultValues) {
      setFormData(defaultValues);
    } else if (!open) {
      setFormData({
        nome: '',
        cargo: '',
        matricula: '',
        cpf: '',
        rg: '',
        lotacao: ''
      });
    }
  }, [open, mode, defaultValues]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (mode === 'create') {
      setFormData({
        nome: '',
        cargo: '',
        matricula: '',
        cpf: '',
        rg: '',
        lotacao: ''
      });
    }
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
              <Label htmlFor="nome">Nome</Label>
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
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={formData.matricula}
                onChange={(e) => handleChange('matricula', e.target.value)}
                placeholder="Digite a matrícula"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="Digite o CPF"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleChange('rg', e.target.value)}
                placeholder="Digite o RG"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lotacao">Lotação</Label>
              <Select
                value={formData.lotacao}
                onValueChange={(value) => handleChange('lotacao', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a lotação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SECAD">SECAD</SelectItem>
                  <SelectItem value="SEMED">SEMED</SelectItem>
                  <SelectItem value="SEMAS">SEMAS</SelectItem>
                  <SelectItem value="SUOV">SUOV</SelectItem>
                  <SelectItem value="SEMMA">SEMMA</SelectItem>
                  <SelectItem value="GABINETE">GABINETE</SelectItem>
                  <SelectItem value="SEFIN">SEFIN</SelectItem>
                  <SelectItem value="SEMAGRI">SEMAGRI</SelectItem>
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

export default ServidorFormDialog; 
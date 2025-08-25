import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Departamento, Secretaria } from '@/types';
import { secretariaService } from '@/services/secretariaService';

interface DepartamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>) => void;
  defaultValues?: Partial<Departamento>;
  mode?: 'create' | 'edit';
}

const DepartamentoDialog: React.FC<DepartamentoDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<Partial<Departamento>>({
    nome: '',
    secretaria_id: 0,
    acesso_total: false,
    is_principal: false,
    descricao: ''
  });
  
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSecretarias();
      if (mode === 'edit' && defaultValues) {
        setFormData(defaultValues);
      }
    } else {
      setFormData({
        nome: '',
        secretaria_id: 0,
        acesso_total: false,
        is_principal: false,
        descricao: ''
      });
    }
  }, [open, mode, defaultValues]);

  const loadSecretarias = async () => {
    try {
      setLoading(true);
      const data = await secretariaService.getAll();
      setSecretarias(data);
    } catch (error) {
      console.error('Erro ao carregar secretarias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Departamento, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.secretaria_id || formData.secretaria_id === 0) {
      alert('Por favor, selecione uma secretaria.');
      return;
    }
    onSubmit(formData as Omit<Departamento, 'id' | 'created_at' | 'updated_at'>);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Adicionar Departamento' : 'Editar Departamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Departamento *</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Digite o nome do departamento"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="secretaria_id">Secretaria *</Label>
              <Select 
                value={formData.secretaria_id?.toString() || ''} 
                onValueChange={(value) => handleChange('secretaria_id', parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando..." : "Selecione uma secretaria"} />
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={secretaria.id.toString()}>
                      {secretaria.nome} ({secretaria.abrev})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ''}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descrição do departamento (opcional)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acesso_total"
                checked={formData.acesso_total || false}
                onCheckedChange={(checked) => handleChange('acesso_total', checked)}
              />
              <Label htmlFor="acesso_total">Acesso Total</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_principal"
                checked={formData.is_principal || false}
                onCheckedChange={(checked) => handleChange('is_principal', checked)}
              />
              <Label htmlFor="is_principal">Departamento Principal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === 'create' ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartamentoDialog;
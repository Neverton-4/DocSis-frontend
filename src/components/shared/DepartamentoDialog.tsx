import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Departamento } from '@/types';
import { salvarDepartamento } from '@/services/departamentoService';

interface DepartamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepartamentoAdded?: (departamento: Departamento) => void;
  onDepartamentoUpdated?: (departamento: Departamento) => void;
  departamentoToEdit?: Departamento | null;
}

const DepartamentoDialog: React.FC<DepartamentoDialogProps> = ({
  open,
  onOpenChange,
  onDepartamentoAdded,
  onDepartamentoUpdated,
  departamentoToEdit
}) => {
  const [formData, setFormData] = useState<Omit<Departamento, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }>({
    nome: '',
    sigla: '',
    status: 'ativo'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (departamentoToEdit) {
      setFormData(departamentoToEdit);
    } else {
      setFormData({
        nome: '',
        sigla: '',
        status: 'ativo'
      });
    }
    setErrors({});
  }, [departamentoToEdit, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.sigla.trim()) {
      newErrors.sigla = 'Sigla é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const departamentoData = {
        ...formData,
        // Remover id se estiver presente (para criação)
        ...(departamentoToEdit ? {} : { id: undefined })
      };

      const result = await salvarDepartamento(departamentoData);
      
      if (departamentoToEdit) {
        onDepartamentoUpdated?.(result);
        toast.success('Departamento atualizado com sucesso!');
      } else {
        onDepartamentoAdded?.(result);
        toast.success('Departamento cadastrado com sucesso!');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
      toast.error('Erro ao salvar departamento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md bg-white p-6 rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {departamentoToEdit ? 'Editar Departamento' : 'Cadastrar Novo Departamento'}
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
              </div>

              {/* Sigla */}
              <div>
                <Label htmlFor="sigla">Sigla *</Label>
                <Input
                  id="sigla"
                  name="sigla"
                  value={formData.sigla}
                  onChange={handleChange}
                  className={errors.sigla ? 'border-red-500' : ''}
                />
                {errors.sigla && <p className="text-red-500 text-sm mt-1">{errors.sigla}</p>}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleSelectChange('status', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (departamentoToEdit ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DepartamentoDialog;
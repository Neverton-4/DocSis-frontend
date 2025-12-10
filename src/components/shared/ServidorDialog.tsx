import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Servidor } from '@/types';
import { salvarServidor } from '@/services/servidorService';

interface ServidorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServidorAdded?: (servidor: Servidor) => void;
  onServidorUpdated?: (servidor: Servidor) => void;
  servidorToEdit?: Servidor | null;
}

const ServidorDialog: React.FC<ServidorDialogProps> = ({
  open,
  onOpenChange,
  onServidorAdded,
  onServidorUpdated,
  servidorToEdit
}) => {
  const [formData, setFormData] = useState<Omit<Servidor, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }>({
    nome_completo: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    sexo: 'M',
    logradouro: '',
    bairro: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
    cep: '',
    contato: '',
    email: '',
    tipo_servidor: 'efetivo',
    lotacao: '',
    cargo: '',
    status: 'ativo',
    matricula: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (servidorToEdit) {
      setFormData({
        ...servidorToEdit,
        data_nascimento: servidorToEdit.data_nascimento ? new Date(servidorToEdit.data_nascimento).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        nome_completo: '',
        cpf: '',
        rg: '',
        data_nascimento: '',
        sexo: 'M',
        logradouro: '',
        bairro: '',
        numero: '',
        complemento: '',
        cidade: '',
        uf: '',
        cep: '',
        contato: '',
        email: '',
        tipo_servidor: 'efetivo',
        lotacao: '',
        cargo: '',
        status: 'ativo',
        matricula: ''
      });
    }
    setErrors({});
  }, [servidorToEdit, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox && 'checked' in e.target ? (e.target as HTMLInputElement).checked : false;
    let fieldValue: string | boolean = isCheckbox ? checked : value;

    // Formatação de campos específicos
    if (typeof fieldValue === 'string') {
      if (name === 'cpf') {
        fieldValue = fieldValue.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (name === 'rg') {
        fieldValue = fieldValue.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
      } else if (name === 'cep') {
        fieldValue = fieldValue.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
      } else if (name === 'contato') {
        const cleanValue = fieldValue.replace(/\D/g, '');
        if (cleanValue.length <= 11) {
          if (cleanValue.length === 11) {
            fieldValue = cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
          } else if (cleanValue.length === 10) {
            fieldValue = cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
          } else {
            fieldValue = cleanValue;
          }
        }
      } else if (name === 'email') {
        fieldValue = fieldValue.toLowerCase();
      } else {
        fieldValue = fieldValue.toUpperCase();
      }
    }

    setFormData(prev => ({ ...prev, [name]: fieldValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = 'Nome completo é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      const cleanCPF = formData.cpf.replace(/\D/g, '');
      if (cleanCPF.length !== 11) {
        newErrors.cpf = 'CPF inválido';
      }
    }

    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    }

    if (!formData.logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.uf.trim()) {
      newErrors.uf = 'UF é obrigatória';
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else {
      const cleanCEP = formData.cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) {
        newErrors.cep = 'CEP inválido';
      }
    }

    if (!formData.contato.trim()) {
      newErrors.contato = 'Contato é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.tipo_servidor) {
      newErrors.tipo_servidor = 'Tipo de servidor é obrigatório';
    }

    if (!formData.lotacao.trim()) {
      newErrors.lotacao = 'Lotação é obrigatória';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (!formData.matricula.trim()) {
      newErrors.matricula = 'Matrícula é obrigatória';
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
      // Preparar dados para envio
      const servidorData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        contato: formData.contato.replace(/\D/g, ''),
        cep: formData.cep.replace(/\D/g, ''),
        // Remover id se estiver presente (para criação)
        ...(servidorToEdit ? {} : { id: undefined })
      };

      const result = await salvarServidor(servidorData);
      
      if (servidorToEdit) {
        onServidorUpdated?.(result);
        toast.success('Servidor atualizado com sucesso!');
      } else {
        onServidorAdded?.(result);
        toast.success('Servidor cadastrado com sucesso!');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar servidor:', error);
      toast.error('Erro ao salvar servidor. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-4xl bg-white p-6 rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {servidorToEdit ? 'Editar Servidor' : 'Cadastrar Novo Servidor'}
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="md:col-span-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  className={errors.nome_completo ? 'border-red-500' : ''}
                />
                {errors.nome_completo && <p className="text-red-500 text-sm mt-1">{errors.nome_completo}</p>}
              </div>

              {/* CPF e RG */}
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  className={errors.cpf ? 'border-red-500' : ''}
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
              </div>

              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  placeholder="00.000.000-0"
                />
              </div>

              {/* Data de Nascimento e Sexo */}
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  className={errors.data_nascimento ? 'border-red-500' : ''}
                />
                {errors.data_nascimento && <p className="text-red-500 text-sm mt-1">{errors.data_nascimento}</p>}
              </div>

              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <Select name="sexo" value={formData.sexo} onValueChange={(value) => handleSelectChange('sexo', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Matrícula */}
              <div>
                <Label htmlFor="matricula">Matrícula *</Label>
                <Input
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  className={errors.matricula ? 'border-red-500' : ''}
                />
                {errors.matricula && <p className="text-red-500 text-sm mt-1">{errors.matricula}</p>}
              </div>

              {/* Tipo de Servidor */}
              <div>
                <Label htmlFor="tipo_servidor">Tipo de Servidor *</Label>
                <Select name="tipo_servidor" value={formData.tipo_servidor} onValueChange={(value) => handleSelectChange('tipo_servidor', value)}>
                  <SelectTrigger className={errors.tipo_servidor ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efetivo">Efetivo</SelectItem>
                    <SelectItem value="comissionado">Comissionado</SelectItem>
                    <SelectItem value="estagiário">Estagiário</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_servidor && <p className="text-red-500 text-sm mt-1">{errors.tipo_servidor}</p>}
              </div>

              {/* Lotação e Cargo */}
              <div>
                <Label htmlFor="lotacao">Lotação *</Label>
                <Input
                  id="lotacao"
                  name="lotacao"
                  value={formData.lotacao}
                  onChange={handleChange}
                  className={errors.lotacao ? 'border-red-500' : ''}
                />
                {errors.lotacao && <p className="text-red-500 text-sm mt-1">{errors.lotacao}</p>}
              </div>

              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className={errors.cargo ? 'border-red-500' : ''}
                />
                {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>}
              </div>

              {/* Contato e E-mail */}
              <div>
                <Label htmlFor="contato">Contato *</Label>
                <Input
                  id="contato"
                  name="contato"
                  value={formData.contato}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className={errors.contato ? 'border-red-500' : ''}
                />
                {errors.contato && <p className="text-red-500 text-sm mt-1">{errors.contato}</p>}
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="exemplo@dominio.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Endereço */}
              <div className="md:col-span-2">
                <Label htmlFor="logradouro">Logradouro *</Label>
                <Input
                  id="logradouro"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                  className={errors.logradouro ? 'border-red-500' : ''}
                />
                {errors.logradouro && <p className="text-red-500 text-sm mt-1">{errors.logradouro}</p>}
              </div>

              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className={errors.numero ? 'border-red-500' : ''}
                />
                {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
              </div>

              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className={errors.bairro ? 'border-red-500' : ''}
                />
                {errors.bairro && <p className="text-red-500 text-sm mt-1">{errors.bairro}</p>}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className={errors.cidade ? 'border-red-500' : ''}
                />
                {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>}
              </div>

              <div>
                <Label htmlFor="uf">UF *</Label>
                <Input
                  id="uf"
                  name="uf"
                  value={formData.uf}
                  onChange={handleChange}
                  maxLength={2}
                  className={errors.uf ? 'border-red-500' : ''}
                />
                {errors.uf && <p className="text-red-500 text-sm mt-1">{errors.uf}</p>}
              </div>

              <div>
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className={errors.cep ? 'border-red-500' : ''}
                />
                {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (servidorToEdit ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ServidorDialog;
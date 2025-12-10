import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Edit, Save, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { toast } from 'sonner';
import { Customer } from '@/types';
import { secretariaService } from '@/services/secretariaService';
import { cargoService, Cargo } from '@/services/cargoService';
import { salvarServidor } from '@/services/servidorService';
import { salvarCidadao } from '@/services/cidadaoService';

interface WizardStep2Props {
  formData: Customer;
  setFormData: React.Dispatch<React.SetStateAction<Customer>>;
  onNext: () => void;
  onPrev: () => void;
  tipoPessoa?: 'servidor' | 'cidadao';
}

const WizardStep2: React.FC<WizardStep2Props> = ({ formData, setFormData, onNext, onPrev, tipoPessoa = 'servidor' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [showCargoAutocomplete, setShowCargoAutocomplete] = useState(false);

  useEffect(() => {
    const fetchSecretarias = async () => {
      try {
        const data = await secretariaService.getAll();
        setSecretarias(data);
      } catch (error) {
        toast.error('Erro ao carregar secretarias');
      }
    };
    fetchSecretarias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox && 'checked' in e.target ? (e.target as HTMLInputElement).checked : false;
    let fieldValue: string | boolean = isCheckbox ? checked : value;

    // Aplicar formatações apenas se fieldValue for string
    if (typeof fieldValue === 'string') {
      if (["cpf", "contato", "rg", "cep"].includes(name)) {
        fieldValue = fieldValue.replace(/\D/g, '');
      }

      if (name === 'cpf' && fieldValue.length <= 11) {
        fieldValue = fieldValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }

      if (name === 'rg' && fieldValue.length <= 9) {
        fieldValue = fieldValue.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
      }

      if (name === 'cep' && fieldValue.length <= 8) {
        fieldValue = fieldValue.replace(/(\d{5})(\d{3})/, '$1-$2');
      }

      if (name === 'contato' && fieldValue.length <= 11) {
        if (fieldValue.length === 11) {
          fieldValue = fieldValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (fieldValue.length === 10) {
          fieldValue = fieldValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
      }

      fieldValue = name === 'email' ? fieldValue.toLowerCase() : fieldValue.toUpperCase();
    }

    // Se mudou a secretaria, limpar o cargo
    if (name === 'lotacao') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: typeof fieldValue === 'string' ? fieldValue : '', 
        cargo: '' 
      }));
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: typeof fieldValue === 'boolean' ? fieldValue : fieldValue 
    }));
  };

  const handleCargoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cargo: value }));

    if (value.length < 2) {
      setCargos([]);
      setShowCargoAutocomplete(false);
      return;
    }

    try {
      const data = await cargoService.buscarPorNome(value);
      setCargos(data);
      setShowCargoAutocomplete(data.length > 0);
    } catch (error) {
      toast.error('Erro ao buscar cargos');
      setCargos([]);
      setShowCargoAutocomplete(false);
    }
  };

  const handleCargoSelect = (cargo: Cargo) => {
    setFormData(prev => ({ 
      ...prev, 
      cargo: cargo.nome
    }));
    setCargos([]);
    setShowCargoAutocomplete(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (tipoPessoa === 'cidadao') {
        await salvarCidadao(formData);
      } else {
        await salvarServidor(formData);
      }
      toast.success('Dados salvos com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error(`Erro ao salvar dados do ${tipoPessoa === 'servidor' ? 'servidor' : 'cidadão'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Card de Dados Pessoais */}
      <Card className="p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </h2>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {/* Linha 1: Nome, CPF, RG */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                disabled={!isEditing}
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                disabled={!isEditing}
                maxLength={12}
              />
            </div>
          </div>

          {/* Linha 1.5: Matrícula (apenas para servidores) */}
          {tipoPessoa === 'servidor' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  name="matricula"
                  value={formData.matricula || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Digite a matrícula do servidor"
                />
              </div>
              <div></div>
              <div></div>
            </div>
          )}

          {/* Linha 2: Contato com WhatsApp, Email, Data Nascimento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contato">Contato</Label>
              <div className="flex gap-2">
                <Input
                  id="contato"
                  name="contato"
                  value={formData.contato}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                  className="flex-1"
                />
                <div className="flex items-center space-x-2 min-w-fit">
                  <input
                    type="checkbox"
                    id="is_whatsapp"
                    checked={formData.is_whatsapp || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_whatsapp: e.target.checked }))}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="is_whatsapp" className="text-sm whitespace-nowrap">WhatsApp</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              {isEditing ? (
                <Input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                />
              ) : (
                <Input
                  value={formatDate(formData.data_nascimento)}
                  disabled
                />
              )}
            </div>
          </div>

          {/* Linha 3: Sexo, Tipo Servidor (apenas para servidores) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select 
                value={formData.sexo} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tipoPessoa === 'servidor' && (
              <div className="space-y-2">
                <Label htmlFor="tipoServidor">Tipo de Servidor</Label>
                <Select 
                  value={formData.tipoServidor} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipoServidor: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efetivo">Efetivo</SelectItem>
                    <SelectItem value="comissionado">Comissionado</SelectItem>
                    <SelectItem value="temporario">Temporário</SelectItem>
                    <SelectItem value="nao_servidor">Não Servidor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Linha 4: Lotação, Cargo (apenas para servidores) */}
          {tipoPessoa === 'servidor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotacao">Lotação</Label>
                <Select 
                  value={formData.lotacao} 
                  onValueChange={(value) => {
                    const secretaria = secretarias.find(s => s.nome === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      lotacao: value,
                      secretaria_id: secretaria?.id || 0,
                      secretaria: value
                    }));
                  }}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a lotação" />
                  </SelectTrigger>
                  <SelectContent>
                    {secretarias.map((secretaria) => (
                      <SelectItem key={secretaria.id} value={secretaria.nome}>
                        {secretaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleCargoChange}
                  disabled={!isEditing}
                  placeholder="Digite para buscar cargo"
                />
                {showCargoAutocomplete && cargos.length > 0 && isEditing && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {cargos.map((cargo) => (
                      <div
                        key={cargo.id}
                        onClick={() => handleCargoSelect(cargo)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {cargo.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Botões de Navegação */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          className="flex items-center gap-2"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WizardStep2;
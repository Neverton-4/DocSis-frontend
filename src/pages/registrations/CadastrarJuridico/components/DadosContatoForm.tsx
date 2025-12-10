import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface JuridicoFormData {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  inscricao_estadual: string;
  representante_nome: string;
  representante_cpf: string;
  representante_rg: string;
  contato: string;
  is_whatsapp: boolean;
  email: string;
}

interface DadosContatoFormProps {
  formData: JuridicoFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const DadosContatoForm: React.FC<DadosContatoFormProps> = ({
  formData,
  onInputChange,
  onSelectChange
}) => {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onInputChange({ ...e, target: { ...e.target, value: formatted } });
  };

  const handleCheckboxChange = (checked: boolean) => {
    const event = {
      target: {
        name: 'is_whatsapp',
        value: checked.toString(),
        type: 'checkbox',
        checked
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Dados de Contato
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contato">Telefone</Label>
            <Input
              id="contato"
              name="contato"
              value={formData.contato}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="email@empresa.com"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_whatsapp"
            checked={formData.is_whatsapp}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="is_whatsapp">O telefone é WhatsApp</Label>
        </div>
      </div>
    </div>
  );
};

export default DadosContatoForm;
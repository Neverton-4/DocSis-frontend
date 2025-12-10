import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface DadosRepresentanteFormProps {
  formData: JuridicoFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const DadosRepresentanteForm: React.FC<DadosRepresentanteFormProps> = ({
  formData,
  onInputChange,
  onSelectChange
}) => {
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    onInputChange({ ...e, target: { ...e.target, value: formatted } });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Dados do Representante Legal
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="representante_nome">Nome do Representante *</Label>
          <Input
            id="representante_nome"
            name="representante_nome"
            value={formData.representante_nome}
            onChange={onInputChange}
            placeholder="Nome completo do representante legal"
            maxLength={255}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="representante_cpf">CPF do Representante *</Label>
            <Input
              id="representante_cpf"
              name="representante_cpf"
              value={formData.representante_cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="representante_rg">RG do Representante</Label>
            <Input
              id="representante_rg"
              name="representante_rg"
              value={formData.representante_rg}
              onChange={onInputChange}
              placeholder="12345678"
              maxLength={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DadosRepresentanteForm;
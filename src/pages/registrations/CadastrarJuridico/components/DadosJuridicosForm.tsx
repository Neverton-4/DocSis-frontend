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

interface DadosJuridicosFormProps {
  formData: JuridicoFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const DadosJuridicosForm: React.FC<DadosJuridicosFormProps> = ({
  formData,
  onInputChange,
  onSelectChange
}) => {
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    onInputChange({ ...e, target: { ...e.target, value: formatted } });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Dados da Empresa
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input
            id="razao_social"
            name="razao_social"
            value={formData.razao_social}
            onChange={onInputChange}
            placeholder="Razão social da empresa"
            maxLength={255}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
          <Input
            id="nome_fantasia"
            name="nome_fantasia"
            value={formData.nome_fantasia}
            onChange={onInputChange}
            placeholder="Nome fantasia da empresa"
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
            <Input
              id="inscricao_estadual"
              name="inscricao_estadual"
              value={formData.inscricao_estadual}
              onChange={onInputChange}
              placeholder="Inscrição estadual"
              maxLength={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DadosJuridicosForm;
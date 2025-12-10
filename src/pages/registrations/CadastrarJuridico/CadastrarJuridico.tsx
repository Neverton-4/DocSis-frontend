import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import DadosJuridicosForm from './components/DadosJuridicosForm';
import DadosRepresentanteForm from './components/DadosRepresentanteForm';
import DadosContatoForm from './components/DadosContatoForm';

interface JuridicoFormData {
  id?: string;
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

const CadastrarJuridico = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<JuridicoFormData>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    representante_nome: '',
    representante_cpf: '',
    representante_rg: '',
    contato: '',
    is_whatsapp: false,
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['razao_social', 'cnpj', 'representante_nome', 'representante_cpf'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof JuridicoFormData]) {
        toast.error(`Campo obrigatório: ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Validação de CNPJ (formato básico)
    if (formData.cnpj.replace(/\D/g, '').length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos');
      return false;
    }

    // Validação de CPF do representante (formato básico)
    if (formData.representante_cpf.replace(/\D/g, '').length !== 11) {
      toast.error('CPF do representante deve ter 11 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implementar serviço para salvar jurídico
      // await salvarJuridico(formData);
      
      toast.success('Pessoa jurídica cadastrada com sucesso!');
      navigate(-1);
    } catch (error) {
      console.error('Erro ao cadastrar pessoa jurídica:', error);
      toast.error('Erro ao cadastrar pessoa jurídica. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Pessoa Jurídica</h1>
          <p className="text-gray-600 mt-2">
            Preencha os dados da pessoa jurídica para realizar o cadastro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <DadosJuridicosForm
              formData={formData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
          </Card>

          <Card className="p-6">
            <DadosRepresentanteForm
              formData={formData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
          </Card>

          <Card className="p-6">
            <DadosContatoForm
              formData={formData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Pessoa Jurídica'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarJuridico;
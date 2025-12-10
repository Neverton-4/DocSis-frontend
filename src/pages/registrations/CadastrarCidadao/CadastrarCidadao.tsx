import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import DadosPessoaisForm from './components/DadosPessoaisForm';
import DadosComplementaresForm from './components/DadosComplementaresForm';

interface CidadaoFormData {
  id?: string;
  nome_completo: string;
  cpf: string;
  rg: string;
  rg_uf: string;
  orgao_exp: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  contato: string;
  is_whatsapp: boolean;
  email: string;
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'outro';
  profissao: string;
  observacoes: string;
}

const CadastrarCidadao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CidadaoFormData>({
    nome_completo: '',
    cpf: '',
    rg: '',
    rg_uf: '',
    orgao_exp: '',
    data_nascimento: '',
    sexo: 'M',
    contato: '',
    is_whatsapp: false,
    email: '',
    estado_civil: 'solteiro',
    profissao: '',
    observacoes: ''
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
    const requiredFields = ['nome_completo', 'cpf', 'rg', 'rg_uf', 'orgao_exp', 'data_nascimento', 'sexo'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof CidadaoFormData]) {
        toast.error(`Campo obrigatório: ${field.replace('_', ' ')}`);
        return false;
      }
    }

    // Validação de CPF (formato básico)
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
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
      // TODO: Implementar serviço para salvar cidadão
      // await salvarCidadao(formData);
      
      toast.success('Cidadão cadastrado com sucesso!');
      navigate(-1);
    } catch (error) {
      console.error('Erro ao cadastrar cidadão:', error);
      toast.error('Erro ao cadastrar cidadão. Tente novamente.');
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
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Cidadão</h1>
          <p className="text-gray-600 mt-2">
            Preencha os dados do cidadão para realizar o cadastro
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <DadosPessoaisForm
              formData={formData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
          </Card>

          <Card className="p-6">
            <DadosComplementaresForm
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
              {isSubmitting ? 'Salvando...' : 'Salvar Cidadão'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarCidadao;
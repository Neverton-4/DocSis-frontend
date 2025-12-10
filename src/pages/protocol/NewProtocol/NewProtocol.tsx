import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout';
import { useAuth } from '../../../contexts/AuthContext';
import WizardStep1 from './components/WizardStep1';
import WizardStep2 from './components/WizardStep2';
import WizardStep3 from './components/WizardStep3';
import { Customer } from '@/types';

const NovoProtocolo = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServidor, setSelectedServidor] = useState<Customer | null>(null);
  const [tipoPessoa, setTipoPessoa] = useState<'servidor' | 'cidadao' | 'juridico'>('servidor');
  const [formData, setFormData] = useState<Customer>({
    id: '', fullName: '', cpf: '', rg: '',
    logradouro: '', bairro: '', numero: '', complemento: '', cidade: '', uf: '', cep: '',
    tipoServidor: 'efetivo', lotacao: '', secretaria_id: 0, cargo: '', sexo: 'M', secretaria: '', is_whatsapp: false,
    status: 'pendente', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    contato: '', email: '', data_nascimento: '', matricula: '', data_admissao: '', tipoProcesso: '', tipoProcesso_escolhido: '', tipoProcessoOutro: '', camposExtras: {}
  });

  // Verificar tipo de pessoa via URL params e estado
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    if (tipo === 'cidadao') {
      setTipoPessoa('cidadao');
    } else if (tipo === 'juridico') {
      setTipoPessoa('juridico');
    } else {
      setTipoPessoa('servidor');
    }
    
    if (location.state?.novoServidor) {
      const novoServidor = location.state.novoServidor;
      setSelectedServidor(novoServidor);
      setFormData(novoServidor);
      setCurrentStep(2); // Ir direto para a Etapa 2
      
      // Limpar o state para evitar reprocessamento
      window.history.replaceState({}, document.title);
    }
  }, [location.state, searchParams]);

  const handleServidorSelect = (servidor: Customer) => {
    setSelectedServidor(servidor);
    setFormData(servidor);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WizardStep1 onServidorSelect={handleServidorSelect} tipoPessoa={tipoPessoa} />;
      case 2:
        return (
          <WizardStep2 
            formData={formData}
            setFormData={setFormData}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            tipoPessoa={tipoPessoa}
          />
        );
      case 3:
        return (
          <WizardStep3 
            formData={formData}
            setFormData={setFormData}
            onPrev={handlePrevStep}
            tipoPessoa={tipoPessoa}
          />
        );
      default:
        return <WizardStep1 onServidorSelect={handleServidorSelect} tipoPessoa={tipoPessoa} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb="Novo Protocolo"
      />
      <div className="flex-1 p-8 pt-0 max-w-[1280px] mx-auto">
        {/* Indicador de Etapas */}
        <div className="mb-8 pt-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Busca'}
                  {step === 2 && 'Dados Pessoais'}
                  {step === 3 && 'Processo'}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Conteúdo da Etapa */}
        {renderStep()}
      </div>
    </div>
  );
};

export default NovoProtocolo;
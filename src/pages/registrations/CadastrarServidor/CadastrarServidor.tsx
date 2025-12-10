import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { salvarServidor } from '@/services/servidorService';
import { cargoService, Cargo } from '@/services/cargoService';
import { secretariaService, Secretaria } from '@/services/secretariaService';
import { Customer } from '@/types';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTiposServidor } from '@/hooks/useTiposServidor';
import DadosPessoaisForm from './components/DadosPessoaisForm';
import DadosFuncionaisForm from './components/DadosFuncionaisForm';
import DadosComplementaresForm from './components/DadosComplementaresForm';

const CadastrarServidor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { tiposServidorSimples } = useTiposServidor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<Customer>({
    id: '',
    fullName: '',
    cpf: '',
    rg: '',
    matricula: '',
    data_nascimento: '',
    sexo: 'M',
    contato: '',
    email: '',
    tipoServidor: 'efetivo',
    cargo: '',
    lotacao: '',
    secretaria_id: 0,
    data_admissao: '',
    secretaria: '',
    is_whatsapp: false,
    status: 'ativo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tipoProcesso: '',
    tipoProcesso_escolhido: '',
    tipoProcessoOutro: '',
    camposExtras: {},
    // Campos RG
    rg_uf: '',
    orgao_exp: '',
    // Campos de expediente
    expediente_tipo: 'portaria',
    expediente_numero: '',
    expediente_data: '',
    // Campos de amparo
    amparo_tipo: 'lei_municipal',
    amparo_numero: '',
    amparo_data: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cargosData, secretariasData] = await Promise.all([
          cargoService.getAll(),
          secretariaService.getAll()
        ]);
        setCargos(cargosData);
        setSecretarias(secretariasData);
      } catch (error) {
        toast.error('Erro ao carregar dados necessários');
      }
    };

    fetchData();
  }, []);

  // Pré-preencher dados quando vindo da edição
  useEffect(() => {
    const { servidorData, isEditing } = location.state || {};
    
    if (isEditing && servidorData && cargos.length > 0 && secretarias.length > 0) {
      console.log('Dados do servidor para pré-preenchimento:', servidorData); // Debug
      console.log('🔍 Dados do servidor recebidos:', servidorData);
      console.log('🔍 cargo_id:', servidorData.cargo_id);
      console.log('🔍 secretaria_id:', servidorData.secretaria_id);
      console.log('🔍 tipo_servidor:', servidorData.tipo_servidor);
      console.log('🔍 Cargos disponíveis:', cargos.length);
      console.log('🔍 Secretarias disponíveis:', secretarias.length);
      
      setFormData({
        id: servidorData.id?.toString() || '', // ✅ Converter para string
        fullName: servidorData.nome_completo || '', // ✅ Corrigido: nome_completo em vez de nome
        cpf: servidorData.cpf || '',
        rg: servidorData.rg || '',
        matricula: servidorData.matricula || '',
        data_nascimento: servidorData.data_nascimento || '',
        sexo: servidorData.sexo || 'M',
        contato: servidorData.contato || '',
        email: servidorData.email || '',
        tipoServidor: servidorData.tipo_servidor || 'efetivo', // ✅ CORRIGIDO: Customer usa tipoServidor
        cargo: servidorData.cargo?.nome || '', // ✅ Nome do cargo para exibição
        cargo_id: servidorData.cargo_id, // ✅ NOVO: ID do cargo para o select
        lotacao: servidorData.lotacao || '',
        secretaria_id: servidorData.secretaria_id || 0, // ✅ ID da secretaria para o select
        data_admissao: servidorData.data_admissao || '',
        secretaria: servidorData.secretaria?.nome || '', // ✅ Nome da secretaria para exibição
        is_whatsapp: servidorData.is_whatsapp || false,
        status: servidorData.status || 'ativo',
        createdAt: servidorData.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tipoProcesso: '',
        tipoProcesso_escolhido: '',
        tipoProcessoOutro: '',
        camposExtras: {},
        // Campos adicionais da interface Customer que não existem em Servidor
        logradouro: '',
        bairro: '',
        numero: '',
        complemento: '',
        cidade: '',
        uf: '',
        cep: '',
        // Campos RG
        rg_uf: servidorData.rg_uf || '',
        orgao_exp: servidorData.orgao_exp || '', // ✅ Corrigido: orgao_exp em vez de orgao_expedidor
        // Campos de expediente
        expediente_tipo: servidorData.expediente_tipo || 'portaria',
        expediente_numero: servidorData.expediente_numero || '',
        expediente_data: servidorData.expediente_data || '',
        // Campos de amparo
        amparo_tipo: servidorData.amparo_tipo || 'lei_municipal',
        amparo_numero: servidorData.amparo_numero || '',
        amparo_data: servidorData.amparo_data || ''
      });
      
      setIsUpdating(true);
    }
  }, [location.state, cargos, secretarias]); // ✅ Adicionando cargos e secretarias como dependências

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
    const requiredFields = ['fullName', 'cpf', 'rg', 'matricula', 'data_nascimento', 'sexo'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof Customer]) {
        toast.error(`Campo ${field} é obrigatório`);
        return false;
      }
    }

    // Validação de CPF (formato básico)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
      toast.error('CPF deve estar no formato XXX.XXX.XXX-XX');
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
      const payload = {
        nome_completo: formData.fullName,
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg,
        contato: formData.contato.replace(/\D/g, ''),
        email: formData.email,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        tipo_servidor_id: formData.tipoServidor ? parseInt(formData.tipoServidor) : null,
        secretaria_id: formData.secretaria_id,
        matricula: formData.matricula,
        data_admissao: formData.data_admissao,
        lotacao: formData.lotacao,
        // Campos RG
        rg_uf: formData.rg_uf,
        orgao_exp: formData.orgao_exp,
        // Campos de expediente
        expediente_tipo: formData.expediente_tipo,
        expediente_numero: formData.expediente_numero,
        expediente_data: formData.expediente_data,
        // Campos de amparo
        amparo_tipo: formData.amparo_tipo,
        amparo_numero: formData.amparo_numero,
        amparo_data: formData.amparo_data
      };

      await salvarServidor(payload);
      toast.success('Servidor cadastrado com sucesso!');
      navigate('/protocolos');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Por favor, selecione apenas arquivos PDF');
      e.target.value = '';
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    setIsUpdating(true);
    try {
      // Aqui você implementaria a lógica para enviar o arquivo PDF
      // Por exemplo, usando FormData para upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Simular upload - substitua pela chamada real da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Ficha pessoal atualizada com sucesso!');
      setUpdateModalOpen(false);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar ficha pessoal');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header 
        breadcrumb="Painel > Cadastrar Servidor" 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
          {/* Header com botões superiores */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                ← Voltar
              </button>
              <span className="text-lg font-semibold text-gray-700">
                Cadastrar Servidor
              </span>
            </div>
            
            {/* Botões de ação alinhados à direita */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setUpdateModalOpen(true)}
                disabled={isSubmitting}
              >
                Atualizar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Servidor'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <DadosPessoaisForm
                formData={formData}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
              />

              {/* Dados Funcionais */}
              <DadosFuncionaisForm
                formData={formData}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                cargos={cargos}
                secretarias={secretarias}
              />

              {/* Dados Complementares */}
              <DadosComplementaresForm
                formData={formData}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
              />
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Atualização */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar ficha pessoal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-file">Selecionar arquivo PDF</Label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUpdating}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setUpdateModalOpen(false);
                setSelectedFile(null);
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateSubmit}
              disabled={isUpdating || !selectedFile}
            >
              {isUpdating ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CadastrarServidor;
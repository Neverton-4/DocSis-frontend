import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { tipoProcessoService } from '@/services/tipoProcessoService';
import { secretariaService } from '@/services/secretariaService';
import { cargoService, Cargo } from '@/services/cargoService';
import { createProcesso } from '@/services/processoService';
import { 
  salvarServidor, 
  buscarServidoresPorNome, 
  buscarServidoresPorCPF,
  buscarServidoresPorNomeECPF,
  buscarServidorPorCPF,
  buscarServidorPorId 
} from '@/services/servidorService';
import { Customer, TipoServidor, TipoProcesso, Secretaria } from '@/types';
import DadosPessoaisForm from './DadosPessoaisForm';
import ProcessoForm from './ProcessoForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import AnexarDialog from './AnexarDialog';
import { Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ComprovanteDialog from '@/components/ComprovanteDialog';

const NovoProtocoloFormWrapper = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Customer>({
    id: '', fullName: '', cpf: '',
    logradouro: '', bairro: '', numero: '', cidade: '', uf: '',
    tipoServidor: 'efetivo', lotacao: '', cargo: '', sexo: 'M', secretaria: '', isWhatsapp: false,
    status: 'pendente', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    contato: '', email: '', data_nascimento: '', tipoProcesso: '', tipoProcesso_escolhido: '', tipoProcessoOutro: '', camposExtras: {}
  });
  const [tiposProcesso, setTiposProcesso] = useState<TipoProcesso[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [servidores, setServidores] = useState<any[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showCargoAutocomplete, setShowCargoAutocomplete] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [showAnexarDialog, setShowAnexarDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [protocoloId, setProtocoloId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipos, secretarias] = await Promise.all([
          tipoProcessoService.getAll(), secretariaService.getAll()
        ]);
        setTiposProcesso(tipos);
        setSecretarias(secretarias);
      } catch (e) {
        toast.error("Erro ao carregar dados necessários");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox && 'checked' in e.target ? (e.target as HTMLInputElement).checked : false;
    let fieldValue: string | boolean = isCheckbox ? checked : value;

    if (name.startsWith('extra_')) {
      const campo = name.replace('extra_', '');
      setFormData(prev => ({
        ...prev,
        camposExtras: {
          ...(prev.camposExtras || {}),
          [campo]: fieldValue
        }
      }));
      return;
    }

    // Só aplicar transformações de string se fieldValue for string
    if (typeof fieldValue === 'string') {
      if (["cpf", "contato"].includes(name)) {
        fieldValue = fieldValue.replace(/\D/g, '');
      }

      if (name === 'cpf' && fieldValue.length <= 11) {
        fieldValue = fieldValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }

      if (name === 'contato' && fieldValue.length <= 11) {
        fieldValue = fieldValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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

  // Função para buscar servidores (nome, CPF ou ambos)
  const buscarServidores = async (nome: string, cpf: string) => {
    try {
      let data = [];
      
      if (nome.length >= 3 && cpf.length >= 3) {
        // Buscar por ambos
        data = await buscarServidoresPorNomeECPF(nome, cpf.replace(/\D/g, ''));
      } else if (nome.length >= 3) {
        // Buscar apenas por nome
        data = await buscarServidoresPorNome(nome);
      } else if (cpf.length >= 3) {
        // Buscar apenas por CPF
        data = await buscarServidoresPorCPF(cpf.replace(/\D/g, ''));
      }
      
      setServidores(data);
      setShowAutocomplete(data.length > 0);
    } catch (error) {
      toast.error('Erro ao buscar servidores');
      setServidores([]);
      setShowAutocomplete(false);
    }
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, fullName: value }));

    if (value.length < 3) {
      setServidores([]);
      setShowAutocomplete(false);
      return;
    }

    await buscarServidores(value, formData.cpf);
  };

  // Nova função para lidar com mudanças no CPF
  const handleCPFChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let cpfValue = value.replace(/\D/g, '');
    
    // Formatar CPF
    if (cpfValue.length <= 11) {
      cpfValue = cpfValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    setFormData(prev => ({ ...prev, cpf: cpfValue }));

    // Buscar servidores se tiver pelo menos 3 dígitos
    const cleanCPF = value.replace(/\D/g, '');
    if (cleanCPF.length < 3) {
      setServidores([]);
      setShowAutocomplete(false);
      return;
    }

    await buscarServidores(formData.fullName, cleanCPF);
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
      // Buscar secretaria selecionada
      const secretariaSelecionada = secretarias.find(s => s.abrev === formData.lotacao);
      const secretariaId = secretariaSelecionada?.id;
      
      const data = await cargoService.buscarPorNome(value, secretariaId);
      setCargos(data);
      setShowCargoAutocomplete(true);
    } catch (error) {
      toast.error('Erro ao buscar cargos');
    }
  };

  // Função modificada para buscar dados completos do servidor
  const handleServidorSelect = async (servidor: any) => {
    try {
      // Buscar dados completos do servidor pelo ID
      const servidorCompleto = await buscarServidorPorId(parseInt(servidor.id));
      
      // Adicione este log para debugar
      console.log('Dados do servidor completo:', servidorCompleto);
      console.log('Data nascimento:', servidorCompleto.data_nascimento);
      console.log('Cargo:', servidorCompleto.cargo);
      console.log('Lotação:', servidorCompleto.lotacao);
      
      // Função para converter data para formato ISO
      const formatDateForInput = (dateString: string | null): string => {
        if (!dateString) return '';
        
        // Se a data já estiver no formato ISO (AAAA-MM-DD), retorna como está
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString;
        }
        
        // Se estiver no formato brasileiro (DD/MM/AAAA), converte
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = dateString.split('/');
          return `${year}-${month}-${day}`;
        }
        
        return dateString;
      };
      
      // Na função handleServidorSelect, após o setFormData
      setFormData(prev => {
        const newFormData = {
          ...prev,
          id: servidorCompleto.id?.toString() || '',
          fullName: servidorCompleto.nome_completo || '',
          cpf: servidorCompleto.cpf || '',
          data_nascimento: formatDateForInput(servidorCompleto.data_nascimento),
          sexo: servidorCompleto.sexo || 'M',
          logradouro: servidorCompleto.logradouro || '',
          numero: servidorCompleto.numero || '',
          bairro: servidorCompleto.bairro || '',
          cidade: servidorCompleto.cidade || '',
          uf: servidorCompleto.uf || '',
          contato: servidorCompleto.contato || '',
          email: servidorCompleto.email || '',
          tipoServidor: servidorCompleto.tipo_servidor || 'efetivo',
          cargo: servidorCompleto.cargo || '',
          lotacao: servidorCompleto.lotacao || '',
        };
        
        // Log para verificar o formData atualizado
        console.log('FormData atualizado:', newFormData);
        console.log('Data de nascimento no formData:', newFormData.data_nascimento);
        console.log('Cargo no formData:', newFormData.cargo);
        console.log('Lotação no formData:', newFormData.lotacao);
        
        return newFormData;
      });
      
      setShowAutocomplete(false);
      toast.success('Dados do servidor carregados com sucesso!');
    } catch (error) {
      toast.error('Erro ao carregar dados completos do servidor');
      console.error(error);
    }
  };

  const handleCargoSelect = (cargo: Cargo) => {
    setFormData(prev => ({ ...prev, cargo: cargo.nome }));
    setShowCargoAutocomplete(false);
  };

  const handleProcessoSelect = ({ nome, tipo }) => {
    setFormData(prev => ({
      ...prev,
      tipoProcesso: nome,
      tipoProcesso2: tipo,
      tipoProcessoOutro: '',
      camposExtras: {}
    }));
    setCategoriaSelecionada(tipo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let servidorId = formData.id;

      if (!servidorId) {
        const servidorExistente = await buscarServidorPorCPF(formData.cpf);
        if (servidorExistente) {
          servidorId = servidorExistente.id;
        } else {
          const novoServidor = await salvarServidor(formData);
          servidorId = novoServidor.id;
        }
      }

      const processoPayload = {
        servidor_id: servidorId,
        usuario_id: user?.id,
        tipo_processo: formData.tipoProcesso_escolhido.toLowerCase(),
        nome: formData.tipoProcesso,
        detalhes: formData.tipoProcessoOutro || '',
        status: 'pendente',
        campos_extras: formData.camposExtras || {}
      };

      const response = await createProcesso(processoPayload);
      setProtocoloId(response.protocolo);
      toast.success('Protocolo criado com sucesso!');
      setShowDialog(true);
    } catch (error) {
      toast.error('Erro ao criar protocolo.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Botão Voltar */}
      <div className="mb-4">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          ← Voltar
        </button>
      </div>

      {/* Card de Dados Pessoais */}
      <Card className="p-6 bg-white">
        <DadosPessoaisForm
          formData={formData}
          handleChange={handleChange}
          handleNameChange={handleNameChange}
          handleCPFChange={handleCPFChange}
          handleCargoChange={handleCargoChange}
          servidores={servidores}
          cargos={cargos}
          showAutocomplete={showAutocomplete}
          showCargoAutocomplete={showCargoAutocomplete}
          handleServidorSelect={handleServidorSelect}
          handleCargoSelect={handleCargoSelect}
          secretarias={secretarias}
        />
      </Card>

      {/* Card de Processo com botões */}
      <Card className="p-6 bg-white">
        <ProcessoForm
          formData={formData}
          tiposProcesso={tiposProcesso}
          categoriaSelecionada={categoriaSelecionada}
          handleProcessoSelect={handleProcessoSelect}
          handleChange={handleChange}
        />
        
        {/* Botões de ação dentro do card Processo */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button type="button" variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setShowAnexarDialog(true)}>
            <Paperclip className="h-4 w-4" /> Anexar
          </Button>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Criar'}
            </Button>
          </div>
        </div>
      </Card>

      <ComprovanteDialog
        open={showDialog}
        protocoloId={protocoloId}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) navigate('/');
        }}
      />

      {showAnexarDialog && (
        <AnexarDialog
          onClose={() => setShowAnexarDialog(false)}
          onSelecionarArquivo={(file) => toast.success(`Arquivo selecionado: ${file.name}`)}
        />
      )}
    </form>
  );
};

export default NovoProtocoloFormWrapper;

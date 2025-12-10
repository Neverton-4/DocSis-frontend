import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { ArrowLeft, FileText, Paperclip, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Customer, TipoProcesso } from '@/types';
import { tipoProcessoService } from '@/services/tipoProcessoService';
import { createProcesso } from '@/services/processoService';
import { useAuth } from '@/contexts/AuthContext';
import ProcessoForm from './ProcessoForm';
import ProcessoFormCidadao from './ProcessoFormCidadao';
import AnexarDialog from './AnexarDialog';
import { ComprovanteDialog } from '@components/shared';

interface WizardStep3Props {
  formData: Customer;
  setFormData: React.Dispatch<React.SetStateAction<Customer>>;
  onPrev: () => void;
  tipoPessoa?: 'servidor' | 'cidadao' | 'juridico';
}

const WizardStep3: React.FC<WizardStep3Props> = ({ formData, setFormData, onPrev, tipoPessoa = 'servidor' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tiposProcesso, setTiposProcesso] = useState<TipoProcesso[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [showAnexarDialog, setShowAnexarDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [protocoloId, setProtocoloId] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);

  useEffect(() => {
    const fetchTiposProcesso = async () => {
      try {
        // Usar o parâmetro iniciador_tipo para filtrar os tipos de processo
        const tipos = await tipoProcessoService.getAll({ iniciador_tipo: tipoPessoa });
        setTiposProcesso(tipos);
      } catch (error) {
        toast.error('Erro ao carregar tipos de processo');
      }
    };
    fetchTiposProcesso();
  }, [tipoPessoa]);

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

    setFormData(prev => ({ 
      ...prev, 
      [name]: typeof fieldValue === 'boolean' ? fieldValue : fieldValue 
    }));
  };

  const handleProcessoSelect = (tipo: TipoProcesso) => {
    setFormData(prev => ({
      ...prev,
      tipoProcesso: tipo.nome,
      tipoProcesso_escolhido: tipo.id.toString()
    }));
    setCategoriaSelecionada(tipo.tipo);
  };

  const handleAnexarArquivo = (file: File) => {
    setAnexos(prev => [...prev, file]);
    toast.success(`Arquivo ${file.name} anexado com sucesso`);
  };

  const removeAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
    toast.info('Arquivo removido');
  };

  const validateForm = () => {
    if (!formData.tipoProcesso) {
      toast.error('Selecione um tipo de processo');
      return false;
    }

    // Validar campos extras obrigatórios se existirem
    const tipoSelecionado = tiposProcesso.find(t => t.id.toString() === formData.tipoProcesso_escolhido);
    if (tipoSelecionado?.campos_extras) {
      for (const campo of tipoSelecionado.campos_extras) {
        if (campo.obrigatorio && !formData.camposExtras?.[campo.nome]) {
          toast.error(`O campo ${campo.label} é obrigatório`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DEBUG SUBMIT ===');
    console.log('formData:', formData);
    console.log('tiposProcesso:', tiposProcesso);
    console.log('formData.tipoProcesso_escolhido:', formData.tipoProcesso_escolhido);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Buscar o tipo de processo selecionado para obter o enum correto
      const tipoSelecionado = tiposProcesso.find(t => t.id.toString() === formData.tipoProcesso_escolhido);
      
      console.log('tipoSelecionado encontrado:', tipoSelecionado);
      
      if (!tipoSelecionado) {
        console.error('Tipo de processo não encontrado!');
        console.log('Procurando por ID:', formData.tipoProcesso_escolhido);
        console.log('IDs disponíveis:', tiposProcesso.map(t => t.id.toString()));
        toast.error('Tipo de processo não encontrado');
        return;
      }

      // Gerar número e ano do processo
      const currentYear = new Date().getFullYear();
      // Gerar número sequencial de 4 dígitos (0001, 0002, etc.)
      const numeroProcesso = Math.floor(Math.random() * 9999 + 1).toString().padStart(4, '0');
      
      const processoData = {
        secretaria_id: user?.secretaria?.id || 1, // Secretaria do usuário logado
        usuario_id: user?.id || 1,
        iniciador_tipo: tipoPessoa, // Usar iniciador_tipo em vez de interessado_tipo
        interessado_id: parseInt(formData.id),
        tipo_id: parseInt(tipoSelecionado.id), // Usar tipo_id em vez de tipo_processo
        subtipo_id: null, // Pode ser implementado futuramente
        numero: numeroProcesso,
        ano: currentYear,
        nome: formData.tipoProcesso || `Processo de ${tipoSelecionado.nome}`,
        detalhes: formData.camposExtras ? JSON.stringify(formData.camposExtras) : null,
        status: "pendente",
        campos_extras: formData.camposExtras || null
      };

      console.log('Dados que serão enviados:', processoData);

      const response = await createProcesso(processoData);
      setProtocoloId(response.id.toString());
      setShowDialog(true);
      toast.success('Protocolo criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar processo:', error);
      toast.error(error.message || 'Erro ao criar protocolo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card de Processo */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Processo
        </h2>
        
        {tipoPessoa === 'cidadao' || tipoPessoa === 'juridico' ? (
           <ProcessoFormCidadao
             formData={formData}
             tiposProcesso={tiposProcesso}
             handleProcessoSelect={handleProcessoSelect}
             handleChange={handleChange}
           />
         ) : (
           <ProcessoForm
             formData={formData}
             tiposProcesso={tiposProcesso}
             categoriaSelecionada={categoriaSelecionada}
             handleProcessoSelect={handleProcessoSelect}
             handleChange={handleChange}
             tipoPessoa={tipoPessoa}
           />
         )}
      </Card>

      {/* Card de Anexos */}
      <Card className="p-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Anexos (Opcional)
          </h3>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowAnexarDialog(true)}
            className="flex items-center gap-2"
          >
            <Paperclip className="h-4 w-4" />
            Anexar Arquivo
          </Button>
        </div>
        
        {anexos.length > 0 ? (
          <div className="space-y-2">
            {anexos.map((arquivo, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{arquivo.name}</span>
                  <span className="text-xs text-gray-500">({(arquivo.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeAnexo(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum arquivo anexado</p>
            <p className="text-sm">Clique em "Anexar Arquivo" para adicionar documentos</p>
          </div>
        )}
      </Card>

      {/* Botões de Navegação */}
      <div className="flex justify-between">
        <Button 
          type="button"
          variant="outline" 
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? 'Criando...' : 'Finalizar'}
        </Button>
      </div>

      {/* Diálogos */}
      <ComprovanteDialog
        open={showDialog}
        protocoloId={protocoloId}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) navigate('/protocolos');
        }}
      />

      {showAnexarDialog && (
        <AnexarDialog
          onClose={() => setShowAnexarDialog(false)}
          onSelecionarArquivo={handleAnexarArquivo}
        />
      )}
    </form>
  );
};

export default WizardStep3;
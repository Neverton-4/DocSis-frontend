import React, { useState, useEffect } from 'react';
import { Upload, Loader2, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useOptimizedTiposPortaria } from '@/hooks/useOptimizedTiposPortaria';
import { useOptimizedServidorSearch } from '@/hooks/useOptimizedServidorSearch';
import { NumeracaoDialog } from '@components/shared';
import { NumeracaoDocumento } from '@/services/numeracaoService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DocumentUploadDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
  documentType: string;
  setDocumentType: (type: string) => void;
  serverName: string;
  setServerName: (name: string) => void;
  documentNumber: string;
  setDocumentNumber: (number: string) => void;
  documentDate: string;
  setDocumentDate: (date: string) => void;
  onSubmit: (data: any) => Promise<void>;
  getSingularName: (type: string) => string;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  documentFile,
  setDocumentFile,
  documentType,
  setDocumentType,
  serverName,
  setServerName,
  documentNumber,
  setDocumentNumber,
  documentDate,
  setDocumentDate,
  onSubmit,
  getSingularName
}) => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [tipoPortariaId, setTipoPortariaId] = useState('');
  const [subtipoPortariaId, setSubtipoPortariaId] = useState('');
  const [dataEfeitos, setDataEfeitos] = useState('');
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState(false);
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  
  // Configuração de validação
  const validationConfig = {
    titulo: {
      required: false,
      maxLength: 200
    },
    tipoPortariaId: {
      required: true,
      custom: (value: string) => {
        if (!value || value === '') return 'Selecione um tipo de portaria';
        return null;
      }
    },
    serverName: {
      required: true,
      minLength: 3,
      custom: (value: string) => {
        if (!selectedServidor) return 'Selecione um servidor válido da lista';
        return null;
      }
    },
    documentNumber: {
      required: true,
      custom: (value: string) => {
        if (!selectedNumeracao) return 'Selecione uma numeração';
        return null;
      }
    },
    documentDate: {
      required: true,
      custom: (value: string) => {
        if (!value) return 'Data da portaria é obrigatória';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Data inválida';
        return null;
      }
    },
    dataEfeitos: {
      required: false,
      custom: (value: string) => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Data inválida';
          
          // Verificar se data de efeitos não é anterior à data da portaria
          if (documentDate) {
            const dataPortaria = new Date(documentDate);
            if (date < dataPortaria) return 'Data de efeitos não pode ser anterior à data da portaria';
          }
        }
        return null;
      }
    },
    documentFile: {
      required: true,
      custom: (value: File | null) => {
        if (!value) return 'Selecione um arquivo .docx';
        if (value.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          return 'Apenas arquivos .docx são permitidos';
        }
        if (value.size > 10 * 1024 * 1024) { // 10MB
          return 'Arquivo muito grande (máximo 10MB)';
        }
        return null;
      }
    }
  };

  const {
    validateSingleField,
    validateAllFields,
    resetValidation,
    isFormValid,
    getFieldError,
    getFieldSuccess
  } = useFormValidation(validationConfig);
  
  // Hooks otimizados
  const { 
    tiposPortaria, 
    subtiposPortaria, 
    loading: loadingTipos, 
    loadingSubtipos,
    error: errorTipos,
    errorSubtipos,
    refetch: fetchTiposPortaria,
    fetchSubtiposByTipo 
  } = useOptimizedTiposPortaria();

  const {
    servidores,
    loading: loadingServidores,
    showAutocomplete,
    selectedServidor,
    buscarServidores,
    handleServidorSelect,
    resetSelection
  } = useOptimizedServidorSearch();

  // Carregar tipos de portaria quando o diálogo for aberto
  useEffect(() => {
    if (isDialogOpen && tiposPortaria.length === 0 && !loadingTipos && !errorTipos) {
      fetchTiposPortaria();
    }
  }, [isDialogOpen, tiposPortaria.length, loadingTipos, errorTipos, fetchTiposPortaria]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setDocumentFile(file);
    } else {
      alert('Por favor, selecione apenas arquivos .docx');
    }
  };

  const handleTipoPortariaChange = (value: string) => {
    console.log('handleTipoPortariaChange called with:', value);
    setTipoPortariaId(value);
    setSubtipoPortariaId(''); // Reset subtipo quando tipo muda
    
    // Carregar subtipos para o tipo selecionado
    if (value) {
      console.log('Calling fetchSubtiposByTipo with:', parseInt(value));
      fetchSubtiposByTipo(parseInt(value));
    }
  };

  const handleServerNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setServerName(value);
    
    // Buscar servidores se o valor tiver pelo menos 3 caracteres
    if (value.length >= 3) {
      await buscarServidores(value);
    } else {
      resetSelection();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos
    const isValid = await validateAllFields({
      titulo,
      tipoPortariaId,
      serverName,
      documentNumber,
      documentDate,
      dataEfeitos,
      documentFile
    });

    if (!isValid) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      // Preparar dados para envio
      const submissionData = {
        titulo,
        tipoPortariaId: parseInt(tipoPortariaId),
        subtipoPortariaId: subtipoPortariaId ? parseInt(subtipoPortariaId) : undefined,
        servidorId: selectedServidor?.id,
        numero: selectedNumeracao?.numero,
        ano: selectedNumeracao?.ano,
        dataPortaria: documentDate,
        dataEfeitos,
        arquivo: documentFile
      };

      await onSubmit(submissionData);
      
      // Resetar formulário após sucesso
      setTitulo('');
      setTipoPortariaId('');
      setSubtipoPortariaId('');
      setServerName('');
      setDocumentNumber('');
      setDocumentDate('');
      setDataEfeitos('');
      setDocumentFile(null);
      setSelectedNumeracao(null);
      resetValidation();
      resetSelection();
      
      setIsDialogOpen(false);
      toast.success(`${getSingularName(documentType)} criada com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao criar documento:', error);
      toast.error(error.message || `Erro ao criar ${getSingularName(documentType)}`);
    }
  };

  // Função para lidar com a seleção de numeração
  const handleNumeracaoSelect = (numeracao: NumeracaoDocumento) => {
    setSelectedNumeracao(numeracao);
    const numeroFormatado = numeracao.ano ? `${numeracao.numero}/${numeracao.ano}` : numeracao.numero;
    setDocumentNumber(numeroFormatado);
    setIsNumeracaoDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar {getSingularName(documentType)}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tipo de Portaria *"
                error={getFieldError('tipoPortariaId')}
                success={getFieldSuccess('tipoPortariaId')}
              >
                <Select
                  value={tipoPortariaId}
                  onValueChange={handleTipoPortariaChange}
                  disabled={loadingTipos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingTipos ? "Carregando..." : "Selecione o tipo"}>
                      {loadingTipos ? "Carregando..." : 
                       tipoPortariaId ? tiposPortaria.find(t => t.id === parseInt(tipoPortariaId))?.nome : "Selecione o tipo"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPortaria.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Subtipo de Portaria - só aparece se o tipo selecionado tiver subtipos */}
              {subtiposPortaria.length > 0 && (
                <FormField
                  label="Subtipo de Portaria *"
                  error={getFieldError('subtipoPortariaId')}
                  success={getFieldSuccess('subtipoPortariaId')}
                >
                  <Select
                    value={subtipoPortariaId}
                    onValueChange={setSubtipoPortariaId}
                    disabled={loadingSubtipos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSubtipos ? "Carregando..." : "Selecione o subtipo"}>
                        {loadingSubtipos ? "Carregando..." : 
                         subtipoPortariaId ? subtiposPortaria.find(s => s.id === parseInt(subtipoPortariaId))?.nome : "Selecione o subtipo"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {subtiposPortaria.map((subtipo) => (
                        <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                          {subtipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            </div>

            {/* Título */}
            <FormField
              label="Título"
              error={getFieldError('titulo')}
              success={getFieldSuccess('titulo')}
            >
              <Input
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  validateSingleField('titulo', e.target.value);
                }}
                placeholder="Digite o título da portaria"
              />
            </FormField>

            {/* Servidor */}
            <FormField
              label="Servidor *"
              error={getFieldError('serverName')}
              success={getFieldSuccess('serverName')}
            >
              <div className="relative">
                <Input
                  value={serverName}
                  onChange={handleServerNameChange}
                  placeholder="Digite o nome do servidor"
                  className={showAutocomplete && servidores.length > 0 ? "rounded-b-none" : ""}
                />
                {showAutocomplete && servidores.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-t-0 border-gray-200 rounded-b-md shadow-lg max-h-60 overflow-y-auto">
                    {servidores.map((servidor) => (
                      <div
                        key={servidor.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleServidorSelect(servidor)}
                      >
                        <div className="font-medium">{servidor.nome_completo}</div>
                        <div className="text-sm text-gray-500">CPF: {servidor.cpf}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            {/* Numeração e Data da Portaria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Numeração *"
                error={getFieldError('documentNumber')}
                success={getFieldSuccess('documentNumber')}
              >
                <div className="flex gap-2">
                  <Input
                    value={documentNumber}
                    readOnly
                    placeholder="Selecione uma numeração"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    disabled={loadingTipos}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </FormField>

              <FormField
                label="Data da Portaria *"
                error={getFieldError('documentDate')}
                success={getFieldSuccess('documentDate')}
              >
                <Input
                  type="date"
                  value={documentDate}
                  onChange={(e) => {
                    setDocumentDate(e.target.value);
                    validateSingleField('documentDate', e.target.value);
                  }}
                />
              </FormField>
            </div>

            {/* Data dos Efeitos */}
            <FormField
              label="Data dos Efeitos"
              error={getFieldError('dataEfeitos')}
              success={getFieldSuccess('dataEfeitos')}
            >
              <Input
                type="date"
                value={dataEfeitos}
                onChange={(e) => {
                  setDataEfeitos(e.target.value);
                  validateSingleField('dataEfeitos', e.target.value);
                }}
              />
            </FormField>

            {/* Upload do Documento */}
            <FormField
              label="Documento da Portaria (Docx) *"
              error={getFieldError('documentFile')}
              success={getFieldSuccess('documentFile')}
            >
              <div className="space-y-2">
                {!documentFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Selecionar Arquivo</span>
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Apenas arquivos .docx são aceitos
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Upload className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {documentFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocumentFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </FormField>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid}
              >
                Criar {getSingularName(documentType)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Numeração */}
      <NumeracaoDialog
        isOpen={isNumeracaoDialogOpen}
        onClose={() => setIsNumeracaoDialogOpen(false)}
        onNumeracaoSelect={handleNumeracaoSelect}
        tipoDocumento="portarias"
        ano={documentDate ? new Date(documentDate).getFullYear() : new Date().getFullYear()}
      />
    </>
  );
};
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
import { NumeracaoDialog } from '@/components/NumeracaoDialog';
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
    setTipoPortariaId(value);
    setSubtipoPortariaId(''); // Reset subtipo quando tipo muda
    
    // Carregar subtipos para o tipo selecionado
    if (value) {
      fetchSubtiposByTipo(parseInt(value));
    }
  };

  const handleServerNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setServerName(value);
    
    // Reset seleção quando o usuário digita
    if (selectedServidor && selectedServidor.nome_completo !== value) {
      resetSelection();
    }
    
    // Buscar servidores com debounce automático
    await buscarServidores(value);
  };

  const handleServidorSelectLocal = (servidor: any) => {
    setServerName(servidor.nome_completo);
    handleServidorSelect(servidor);
  };

  const handleNumeracaoSelect = (numeracao: NumeracaoDocumento) => {
    setSelectedNumeracao(numeracao);
    // Exibir apenas o número se o ano for null, caso contrário exibir numero/ano
    const numeroFormatado = numeracao.ano ? `${numeracao.numero}/${numeracao.ano}` : numeracao.numero;
    setDocumentNumber(numeroFormatado);
    setIsNumeracaoDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!documentFile || !documentType || !serverName || !documentNumber || !documentDate) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!selectedServidor) {
      toast.error('Por favor, selecione um servidor válido da lista.');
      return;
    }

    if (!tipoPortariaId) {
      toast.error('Por favor, selecione um tipo de portaria.');
      return;
    }

    if (!selectedNumeracao) {
      toast.error('Por favor, selecione uma numeração.');
      return;
    }

    try {
      // Extrair ano da data_portaria se selectedNumeracao.ano for null
      const anoPortaria = selectedNumeracao.ano || new Date(documentDate).getFullYear();
      
      // Usar data_portaria como data_efeito se dataEfeitos não for fornecida
      const dataEfeitoFinal = dataEfeitos || documentDate;
      
      // Criar dados da portaria
      const portariaData = {
        numero: selectedNumeracao.numero,
        ano: anoPortaria,
        tipo_id: parseInt(tipoPortariaId),
        subtipo_id: subtipoPortariaId && subtipoPortariaId !== 'none' ? parseInt(subtipoPortariaId) : null,
        servidor_id: selectedServidor.id,
        // Campo de escola do servidor
        escola_id: selectedServidor.escola_id || null,
        data_portaria: documentDate,
        data_efeito: dataEfeitoFinal,
        status: 'criado',
        titulo: titulo
      };

      // Chamar a função onSubmit com os dados completos
      await onSubmit({
        file: documentFile,
        type: documentType,
        serverName,
        number: documentNumber,
        date: documentDate,
        effectDate: dataEfeitos,
        tipoPortariaId,
        subtipoPortariaId,
        portariaData,
        selectedServidor
      });

      // Reset form apenas se a criação foi bem-sucedida
      setDocumentFile(null);
      setDocumentType('');
      setServerName('');
      setDocumentNumber('');
      setDocumentDate('');
      setDataEfeitos('');
      setTipoPortariaId('');
      setSubtipoPortariaId('');
      setSelectedServidor(null);
      setServidores([]);
      setShowAutocomplete(false);
      setSelectedNumeracao(null);
      setTitulo('');
      
      toast.success('Portaria criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar portaria. Tente novamente.');
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => navigate('/create-document')}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Adicionar {getSingularName('portarias')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar {getSingularName(documentType)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="document-file">Carregar Documento (.docx)</Label>
            <Input
              id="document-file"
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {documentFile && (
              <p className="text-sm text-green-600">
                Arquivo selecionado: {documentFile.name}
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da portaria"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="tipo-portaria">Tipo de Portaria</Label>
            <Select 
              value={tipoPortariaId} 
              onValueChange={handleTipoPortariaChange}
              disabled={loadingTipos}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTipos ? "Carregando..." : "Selecione o tipo de portaria"} />
              </SelectTrigger>
              <SelectContent>
                {loadingTipos ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando tipos...
                    </div>
                  </SelectItem>
                ) : errorTipos ? (
                  <SelectItem value="error" disabled>
                    Erro ao carregar tipos
                  </SelectItem>
                ) : tiposPortaria.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Nenhum tipo encontrado
                  </SelectItem>
                ) : (
                  tiposPortaria.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errorTipos && (
              <p className="text-sm text-red-600 mt-1">{errorTipos}</p>
            )}
          </div>

          {/* Campo Subtipo de Portaria - aparece apenas quando um tipo é selecionado E há subtipos disponíveis */}
          {tipoPortariaId && (
            <div className="grid gap-2">
              <Label htmlFor="subtipo-portaria">Subtipo de Portaria</Label>
              {loadingSubtipos ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando subtipos...
                </div>
              ) : errorSubtipos ? (
                <p className="text-sm text-red-600">{errorSubtipos}</p>
              ) : !Array.isArray(subtiposPortaria) || subtiposPortaria.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum subtipo disponível para este tipo</p>
              ) : (
                <Select 
                  value={subtipoPortariaId} 
                  onValueChange={setSubtipoPortariaId}
                  disabled={loadingSubtipos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o subtipo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum subtipo</SelectItem>
                    {subtiposPortaria.map((subtipo) => (
                      <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                        {subtipo.nome_subtipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="server-name">Nome do Servidor</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="server-name"
                  value={serverName}
                  onChange={handleServerNameChange}
                  className="pl-10"
                  placeholder="Digite o nome do servidor"
                />
              </div>
              {showAutocomplete && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {loadingServidores ? (
                    <div className="px-4 py-2 flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando servidores...
                    </div>
                  ) : servidores.length > 0 ? (
                    servidores.map((servidor) => (
                      <div
                        key={servidor.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleServidorSelectLocal(servidor)}
                      >
                        <div className="font-medium">{servidor.nome_completo}
                          <span className="text-sm text-gray-500"> | CPF: {servidor.cpf}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      Nenhum servidor encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="document-number">Numeração</Label>
              <div className="flex gap-2">
                <Input
                  id="document-number"
                  value={documentNumber}
                  readOnly
                  placeholder="Selecione uma numeração"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNumeracaoDialogOpen(true)}
                  className="px-3"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="document-date">Data da Portaria</Label>
              <Input
                id="document-date"
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="data-efeitos">Data dos Efeitos</Label>
              <Input
                id="data-efeitos"
                type="date"
                value={dataEfeitos}
                onChange={(e) => setDataEfeitos(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Adicionar {getSingularName(documentType)}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={documentDate ? new Date(documentDate).getFullYear() : new Date().getFullYear()}
        documentType={documentType}
      />
    </Dialog>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Calendar, Loader2, CheckCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useOptimizedTiposPortaria } from '@/hooks/useOptimizedTiposPortaria';
import { buscarServidoresPorNome } from '@/services/servidorService';
import { NumeracaoDialog } from '@/components/NumeracaoDialog';
import { NumeracaoDocumento } from '@/services/numeracaoService';
import { documentoService } from '@/services/documentoPortariaService';
import { DocumentUpload, AnexosCard } from '@components/shared';
import { useNavigate } from 'react-router-dom';
import { extractTitleFromFilename } from '@/utils/fileUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ServidorSearchDialog } from '@/components/shared/ServidorSearchDialog';
import type { AssinaturasState } from '@/components/signatures/AssinaturasModal';

  interface Servidor {
    id: string;
    nome_completo: string;
    cpf: string;
  }

  const formatCpf = (cpf: string) => {
    const digits = (cpf || '').replace(/\D/g, '');
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
    return cpf;
  };

interface PortariaFormProps {
  documentType?: string;
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  assinaturasState?: AssinaturasState | null;
  assinaturasValid?: boolean;
  formId?: string;
}

// Tipos de documentos suportados
const DOCUMENT_TYPES = {
  'portarias': { name: 'Portaria', plural: 'Portarias' },
  'decretos': { name: 'Decreto', plural: 'Decretos' },
  'diarias': { name: 'Diária', plural: 'Diárias' },
  'leis': { name: 'Lei', plural: 'Leis' },
  'editais': { name: 'Edital', plural: 'Editais' },
  'outros': { name: 'Documento', plural: 'Outros Documentos' }
};

export const DocumentForm = ({ documentType = 'portarias', selectedFile, onFileChange, assinaturasState, assinaturasValid = true, formId = 'document-form' }: PortariaFormProps) => {
  const navigate = useNavigate();
  const [isColetiva, setIsColetiva] = useState<boolean>(false);
  const [numeracao, setNumeracao] = useState<string>('');
  const [tipoPortaria, setTipoPortaria] = useState<string>('');
  const [subtipoPortaria, setSubtipoPortaria] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [dataPortaria, setDataPortaria] = useState<string>('');
  const [preambulo, setPreambulo] = useState<string>('');
  const [nomeServidor, setNomeServidor] = useState<string>('');
  const [servidoresSelecionados, setServidoresSelecionados] = useState<Servidor[]>([]);
  
  // Estados para o diálogo de numeração
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState(false);
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  
  // Estados para loading e confirmação
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdPortariaData, setCreatedPortariaData] = useState<any>(null);
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  // Estado de assinaturas controlado externamente via modal
  
  // Obter informações do tipo de documento atual
  const currentDocType = DOCUMENT_TYPES[documentType] || DOCUMENT_TYPES['portarias'];
  
  const { tiposPortaria, subtiposPortaria, loading, loadingSubtipos, error, errorSubtipos, refetch: fetchTiposPortaria, fetchSubtiposByTipo } = useOptimizedTiposPortaria();
  const [servidoresEncontrados, setServidoresEncontrados] = useState<Servidor[]>([]);
  const [showServidoresList, setShowServidoresList] = useState(false);
  const [isServidorDialogOpen, setIsServidorDialogOpen] = useState(false);

  // Carregar tipos de portaria na inicialização e pré-carregar data atual
  useEffect(() => {
    fetchTiposPortaria();
    
    // Pré-carregar data da portaria com data atual
    const hoje = new Date().toISOString().split('T')[0];
    setDataPortaria(hoje);
  }, []);

  // Buscar subtipos quando o tipo for selecionado
  useEffect(() => {
    if (tipoPortaria) {
      setSubtipoPortaria(''); // Reset subtipo quando tipo muda
      fetchSubtiposByTipo(parseInt(tipoPortaria));
    }
  }, [tipoPortaria, fetchSubtiposByTipo]);

  // Log para debug dos subtipos
  useEffect(() => {
    // Silenciar logs de debug ao carregar subtipos
  }, [subtiposPortaria]);

  // Buscar servidores quando o nome for digitado
  useEffect(() => {
    const buscarServidores = async () => {
      if (nomeServidor.length >= 3) {
        try {
          const servidores = await buscarServidoresPorNome(nomeServidor);
          setServidoresEncontrados(servidores);
          setShowServidoresList(true);
        } catch (error) {
          console.error('Erro ao buscar servidores:', error);
          setServidoresEncontrados([]);
          setShowServidoresList(false);
        }
      } else {
        setShowServidoresList(false);
      }
    };

    buscarServidores();
  }, [nomeServidor]);

  // Função para lidar com a seleção de numeração
  const handleNumeracaoSelect = (numeracao: NumeracaoDocumento) => {
    setSelectedNumeracao(numeracao);
    // Exibir apenas o número se o ano for null, caso contrário exibir numero/ano
    const numeroFormatado = numeracao.ano ? `${numeracao.numero}/${numeracao.ano}` : numeracao.numero;
    setNumeracao(numeroFormatado);
    setIsNumeracaoDialogOpen(false);
  };

  const adicionarServidor = (servidor: Servidor) => {
    const jaSelecionado = servidoresSelecionados.find(s => s.id === servidor.id);
    const permiteMultipla = isColetiva === true;
    if (!permiteMultipla && servidoresSelecionados.length >= 1 && !jaSelecionado) {
      toast.error('Seleção múltipla desativada. Habilite "Coletiva: Sim" para selecionar mais de um servidor.');
      return;
    }
    if (!jaSelecionado) {
      setServidoresSelecionados([...servidoresSelecionados, servidor]);
    }
  };

  const removerServidor = (servidorId: string) => {
    setServidoresSelecionados(servidoresSelecionados.filter(s => s.id !== servidorId));
  };

  // Função para lidar com mudança de arquivo e auto-preenchimento do título
  const handleFileChangeWithAutoTitle = (file: File | null) => {
    // Chama a função original de mudança de arquivo
    onFileChange?.(file);
    
    // Se um arquivo foi selecionado e o título está vazio, auto-preenche
    if (file && !titulo.trim()) {
      const extractedTitle = extractTitleFromFilename(file.name);
      setTitulo(extractedTitle);
    }
  };

  // Função de validação
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validar numeração
    if (!numeracao) {
      newErrors.numeracao = 'Digite a numeração';
    }

    // Validar tipo de portaria
    if (!tipoPortaria) {
      newErrors.tipoPortaria = 'Selecione um tipo de portaria';
    }


    // Validar título
    if (!titulo.trim()) {
      newErrors.titulo = 'Digite o título da portaria';
    }
    if (!preambulo.trim()) {
      newErrors.preambulo = 'Digite o preâmbulo da portaria';
    }

    // Validar data da portaria
    if (!dataPortaria) {
      newErrors.dataPortaria = 'Selecione a data da portaria';
    }

    // Validar arquivo - agora será validado pelo componente DocumentUpload
    if (!selectedFile) {
      newErrors.documentFile = 'Selecione o arquivo da portaria (.docx)';
    }

    // Validação de assinaturas obrigatórias
    if (!assinaturasValid) {
      newErrors.assinaturas = 'Preencha todas as assinaturas obrigatórias';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Montar payload de assinaturas selecionadas (nome e CPF são somente exibição)
      const assinaturasPayload = Object.entries(assinaturasState || {}).map(([tipo_assinante, item]) => ({
        tipo_assinante,
        habilitado: !!item?.enabled,
        assinante_id: item?.assinante?.id || undefined,
      }));

      // Preparar dados da portaria
      const portariaData = {
        numero: numeracao.includes('/') ? numeracao.split('/')[0] : numeracao,
        ano: dataPortaria ? new Date(dataPortaria).getFullYear() : new Date().getFullYear(),
        titulo: titulo,
        tipo_id: parseInt(tipoPortaria),
        subtipo_id: subtipoPortaria ? parseInt(subtipoPortaria) : undefined,
        data_portaria: dataPortaria,
        preambulo: preambulo,
        coletiva: isColetiva,
        // servidor_id é opcional - só enviar se um servidor foi selecionado
        ...(servidoresSelecionados.length > 0 && { servidor_id: servidoresSelecionados[0].id }),
        conteudo: titulo, // Usando título como conteúdo por enquanto
        // Contexto do tipo e assinaturas selecionadas
        tipo_documento: (documentType || 'portarias'),
        assinaturas: assinaturasPayload,
      };

      console.log('Enviando dados da portaria:', portariaData);
      
      // Chamar o serviço para criar a portaria com documento
      const resultado = await documentoService.createWithDocument(portariaData, selectedFile!);
      
      console.log('Portaria criada com sucesso:', resultado);
      setCreatedPortariaData(resultado);
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Erro ao criar portaria:', error);
      alert('Erro ao criar portaria. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    
    // Limpar formulário
    setNumeracao('');
    setSelectedNumeracao(null);
    setTipoPortaria('');
    setSubtipoPortaria('');
    setTitulo('');
    setDataPortaria(new Date().toISOString().split('T')[0]);
    setPreambulo('');
    onFileChange?.(null);
    setServidoresSelecionados([]);
    setIsColetiva(false);
    setErrors({});
    
    // Redirecionar para a tela de documentos
    navigate('/documentos');
  };

  return (
    <div className="w-full space-y-6">
      {/* Layout Principal - Grid com Card Principal à esquerda e Cards secundários à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Card Principal - Informações da Portaria (3/4 da largura) */}
        <div className="lg:col-span-3">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Informações da {currentDocType.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                {/* Linha Superior */}
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="basis-[15%] min-w-[140px] space-y-2">
                    <Label htmlFor="numeracao">Numeração *</Label>
                    <Input
                      id="numeracao"
                      value={numeracao}
                      onChange={(e) => setNumeracao(e.target.value)}
                      placeholder="Digite a numeração"
                      className={errors.numeracao ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.numeracao && (
                      <p className="text-sm text-red-600">{errors.numeracao}</p>
                    )}
                  </div>
                  <div className="basis-[15%] min-w-[140px] space-y-2">
                    <Label htmlFor="coletiva">{currentDocType.name} Coletiva</Label>
                    <Select value={isColetiva ? "Sim" : "Não"} onValueChange={(value) => setIsColetiva(value === "Sim")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="basis-[15%] min-w-[140px] space-y-2">
                    <Label htmlFor="dataPortaria">Data da {currentDocType.name} *</Label>
                    <Input
                      id="dataPortaria"
                      type="date"
                      value={dataPortaria}
                      onChange={(e) => setDataPortaria(e.target.value)}
                      className={errors.dataPortaria ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.dataPortaria && (
                      <p className="text-sm text-red-600">{errors.dataPortaria}</p>
                    )}
                  </div>
                  <div className="basis-[45%] min-w-[240px] space-y-2">
                    <Label htmlFor="tipo">Tipo de {currentDocType.name} *</Label>
                    <Select 
                      value={tipoPortaria} 
                      onValueChange={setTipoPortaria}
                      disabled={loading || isSubmitting}
                    >
                      <SelectTrigger className={errors.tipoPortaria ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loading ? "Carregando..." : "Selecione o tipo..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <span className="mr-2">⏳</span>
                              Carregando tipos...
                            </div>
                          </SelectItem>
                        ) : error ? (
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
                    {error && (
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    )}
                    {errors.tipoPortaria && (
                      <p className="text-sm text-red-600">{errors.tipoPortaria}</p>
                    )}
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da {currentDocType.name} *</Label>
                    <Input
                      id="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder={`Digite o título da ${currentDocType.name.toLowerCase()}`}
                      className={errors.titulo ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                  {errors.titulo && (
                    <p className="text-sm text-red-600">{errors.titulo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preambulo">Preâmbulo *</Label>
                  <Textarea
                    id="preambulo"
                    value={preambulo}
                    onChange={(e) => setPreambulo(e.target.value)}
                    placeholder={`Escreva o preâmbulo da ${currentDocType.name.toLowerCase()}`}
                    className={errors.preambulo ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.preambulo && (
                    <p className="text-sm text-red-600">{errors.preambulo}</p>
                  )}
                </div>

                

                {/* Card de Seleção do Servidor */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Seleção do Servidor/Responsável</CardTitle>
                      <Badge variant={isColetiva ? 'default' : 'secondary'} aria-live="polite">
                        {isColetiva ? 'Seleção múltipla ativada' : 'Seleção simples'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 relative hidden">
                        <Label htmlFor="nomeServidor">Nome do Servidor</Label>
                        <Input
                          id="nomeServidor"
                          value={nomeServidor}
                          onChange={(e) => setNomeServidor(e.target.value)}
                          placeholder="Digite o nome do servidor"
                          disabled={isSubmitting}
                        />
                        {/* Botão de busca para abrir diálogo */}
                        <div className="absolute right-2 top-7"></div>
                        
                        {/* Lista de servidores encontrados */}
                        {showServidoresList && servidoresEncontrados.length > 0 && !isSubmitting && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {servidoresEncontrados.map((servidor) => (
                              <div
                                key={servidor.id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => adicionarServidor(servidor)}
                              >
                                <div className="font-medium">{servidor.nome_completo}</div>
                                <div className="text-sm text-gray-500">
                                  CPF: {servidor.cpf}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" className="gap-2 transition-colors" aria-label="Buscar Servidor" onClick={() => setIsServidorDialogOpen(true)} disabled={isSubmitting}>
                          <Search className="h-4 w-4" />
                          Buscar Servidor
                        </Button>
                        <Button type="button" variant="outline" className="gap-2 transition-colors" aria-label="Cadastrar Servidor" onClick={() => navigate('/servidores/cadastrar')} disabled={isSubmitting}>
                          <Plus className="h-4 w-4" />
                          Cadastrar Servidor
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground ml-2">
                        {isColetiva ? 'Você pode selecionar múltiplos servidores.' : 'Seleção de apenas um servidor.'}
                      </p>
                    </div>

                    {/* Lista de servidores selecionados */}
                    {servidoresSelecionados.length > 0 && (
                      <div className="space-y-2">
                        <Label>Servidores Selecionados:</Label>
                        <div className="space-y-2">
                          {servidoresSelecionados.map((servidor) => (
                            <div
                              key={servidor.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                            >
                              <div>
                                <div className="font-medium uppercase">{servidor.nome_completo?.toUpperCase()} - {formatCpf(servidor.cpf)}</div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 transition-colors"
                                onClick={() => removerServidor(servidor.id)}
                                disabled={isSubmitting}
                                aria-label={`Remover ${servidor.nome_completo}`}
                              >
                                <X className="h-4 w-4" />
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assinaturas removidas da UI principal; controle via modal */}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Cards Secundários - Upload e Anexos (1/3 da largura) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de Upload do Documento */}
          <DocumentUpload 
            documentType={documentType}
            selectedFile={selectedFile}
            onFileChange={handleFileChangeWithAutoTitle}
          />
          
          {/* Card de Anexos */}
          <AnexosCard documentType={documentType} />
        </div>
      </div>
      
      {/* Overlay de Loading */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <p className="font-medium">Criando {currentDocType.name.toLowerCase()}...</p>
              <p className="text-sm text-gray-500">Por favor, aguarde.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Diálogo de Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>{currentDocType.name} Criada com Sucesso!</span>
            </DialogTitle>
            <DialogDescription>
              A {currentDocType.name.toLowerCase()} foi criada e salva com sucesso no sistema.
              {createdPortariaData && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">
                    <strong>Número:</strong> {createdPortariaData.numero || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <strong>Título:</strong> {createdPortariaData.titulo || titulo}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessConfirm}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Numeração */}
      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataPortaria ? new Date(dataPortaria).getFullYear() : new Date().getFullYear()}
        mode="select"
        documentType={documentType}
      />

      {/* Diálogo de Busca de Servidor */}
      <ServidorSearchDialog
        open={isServidorDialogOpen}
        onOpenChange={setIsServidorDialogOpen}
        onSelect={(srv) => {
          adicionarServidor({ id: String(srv.id), nome_completo: srv.nome_completo, cpf: srv.cpf });
        }}
      />
    </div>
  );
};
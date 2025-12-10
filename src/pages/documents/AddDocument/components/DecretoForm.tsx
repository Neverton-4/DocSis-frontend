import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, Plus, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { NumeracaoDialog } from '@components/shared';
import { NumeracaoDocumento, numeracaoService } from '@/services/numeracaoService';
import { useDecretos } from '@/hooks/useDecretos';
import { useOptimizedTiposDecreto } from '@/hooks/useOptimizedTiposDecreto';
import { buscarServidoresPorNome } from '@/services/servidorService';
import { DocumentUpload, AnexosCard } from '@components/shared';
import { ServidorSearchDialog } from '@/components/shared/ServidorSearchDialog';
import type { AssinaturasState } from '@/components/signatures/AssinaturasModal';

interface DecretoFormProps {
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  assinaturasState?: AssinaturasState | null;
  assinaturasValid?: boolean;
  formId?: string;
}

export const DecretoForm: React.FC<DecretoFormProps> = ({ selectedFile, onFileChange, assinaturasState, assinaturasValid = true, formId = 'document-form' }) => {
  const navigate = useNavigate();
  const [isColetiva, setIsColetiva] = useState<boolean>(false);
  const [numeracao, setNumeracao] = useState<string>('');
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState<boolean>(false);
  const [dataDecreto, setDataDecreto] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [preambulo, setPreambulo] = useState<string>('');
  const [tipoDecreto, setTipoDecreto] = useState<string>('');
  const [subtipoDecreto, setSubtipoDecreto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { decretos, loading: loadingDecretos, error: errorDecretos, refetch: refetchDecretos } = useDecretos();
  const [decretoTipos, setDecretoTipos] = useState<Array<{ id: string; nome: string }>>([]);
  const {
    tiposDecreto,
    loading: loadingTipos,
    error: errorTipos,
    refetch: fetchTiposDecreto,
  } = useOptimizedTiposDecreto();

  // Servidor/Responsável
interface Servidor { id: string; nome_completo: string; cpf: string; }
  const formatCpf = (cpf: string) => {
    const digits = (cpf || '').replace(/\D/g, '');
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
    return cpf;
  };
  const [nomeServidor, setNomeServidor] = useState<string>('');
  const [servidoresEncontrados, setServidoresEncontrados] = useState<Servidor[]>([]);
  const [servidoresSelecionados, setServidoresSelecionados] = useState<Servidor[]>([]);
  const [showServidoresList, setShowServidoresList] = useState(false);
  const [isServidorDialogOpen, setIsServidorDialogOpen] = useState(false);
  // Estado de assinaturas controlado via modal externo

  useEffect(() => {
    // Inicializa data com hoje
    const hoje = new Date().toISOString().split('T')[0];
    setDataDecreto(hoje);
    // Carrega decretos e tipos/subtipos de decreto
    fetchTiposDecreto();
    refetchDecretos();
  }, [refetchDecretos, fetchTiposDecreto]);

  useEffect(() => {
    // Preferir API otimizada de tipos; fallback para derivação dos decretos
    if (!(Array.isArray(tiposDecreto) && tiposDecreto.length > 0)) {
      const nomesTipos = Array.from(new Set(
        (decretos || [])
          .map((d: any) => d.tipo_nome)
          .filter((n: string) => typeof n === 'string' && n.trim().length > 0)
      ));
      const tipos = nomesTipos.map((nome, idx) => ({ id: String(idx + 1), nome }));
      setDecretoTipos(tipos);
    }
    setSubtipoDecreto('');
  }, [tiposDecreto, decretos]);

  useEffect(() => {
    if (tipoDecreto) {
      setSubtipoDecreto('');
    }
  }, [tipoDecreto]);



  const handleNumeracaoSelect = (numeracao: NumeracaoDocumento) => {
    setSelectedNumeracao(numeracao);
    const numeroFormatado = numeracao.ano ? `${numeracao.numero}/${numeracao.ano}` : numeracao.numero;
    setNumeracao(numeroFormatado);
  };

  // Busca de servidores
  useEffect(() => {
    const buscar = async () => {
      if (nomeServidor.length >= 3) {
        try {
          const servidores = await buscarServidoresPorNome(nomeServidor);
          setServidoresEncontrados(servidores);
          setShowServidoresList(true);
        } catch (err) {
          console.error('Erro ao buscar servidores:', err);
          setServidoresEncontrados([]);
          setShowServidoresList(false);
        }
      } else {
        setShowServidoresList(false);
      }
    };
    buscar();
  }, [nomeServidor]);

  const adicionarServidor = (servidor: Servidor) => {
    const jaSelecionado = servidoresSelecionados.find(s => s.id === servidor.id);
    const permiteMultipla = isColetiva === true;
    if (!permiteMultipla && servidoresSelecionados.length >= 1 && !jaSelecionado) {
      toast.error('Seleção múltipla desativada. Habilite "Coletivo: Sim" para selecionar mais de um servidor.');
      return;
    }
    if (!jaSelecionado) {
      setServidoresSelecionados([...servidoresSelecionados, servidor]);
    }
  };

  const removerServidor = (servidorId: string) => {
    setServidoresSelecionados(servidoresSelecionados.filter(s => s.id !== servidorId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!numeracao.trim()) newErrors.numeracao = 'Digite a numeração';
    if (!tipoDecreto) newErrors.tipoDecreto = 'Selecione um tipo';
    if (!titulo.trim()) newErrors.titulo = 'Digite o título do decreto';
    if (!preambulo.trim()) newErrors.preambulo = 'Digite o preâmbulo do decreto';
    if (!dataDecreto) newErrors.dataDecreto = 'Informe a data do decreto';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Corrija os campos destacados.');
      return;
    }

    if (!assinaturasValid) {
      toast.error('Preencha todas as assinaturas obrigatórias.');
      return;
    }

    setIsSubmitting(true);
    try {
      const numeroSomente = numeracao.includes('/') ? numeracao.split('/')[0] : numeracao;
      const anoNumeracao = selectedNumeracao?.ano || (dataDecreto ? new Date(dataDecreto).getFullYear() : new Date().getFullYear());

      const payload = {
        numero: numeroSomente,
        ano: anoNumeracao,
        titulo: titulo,
        tipo_id: parseInt(tipoDecreto),
        data_decreto: dataDecreto,
        coletiva: isColetiva,
        ...(servidoresSelecionados.length > 0 && { servidor_id: servidoresSelecionados[0].id }),
        conteudo: preambulo,
      };

      const arquivo = selectedFile as File | null;
      if (arquivo) {
        await decretoService.createWithDocument(payload as any, arquivo);
      } else {
        await decretoService.create(payload as any);
      }

      toast.success('Decreto criado com sucesso');
      navigate('/documentos');
    } catch (err) {
      console.error('Erro ao criar decreto:', err);
      toast.error('Erro ao criar decreto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Informações do Decreto</CardTitle>
            </CardHeader>
            <CardContent>
              <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                {/* Primeira linha: Numeração, Coletiva, Data, Tipo */}
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="basis-[15%] min-w-[140px] space-y-2">
                    <Label htmlFor="numeracao">Numeração *</Label>
                    <Input id="numeracao" value={numeracao} onChange={(e) => setNumeracao(e.target.value)} placeholder="Digite a numeração" disabled={isSubmitting} className={errors.numeracao ? 'border-red-500' : ''} />
                    {errors.numeracao && (
                      <p className="text-sm text-red-600">{errors.numeracao}</p>
                    )}
                  </div>
                  <div className="basis-[15%] min-w-[140px] space-y-2">
                    <Label htmlFor="coletiva">Decreto Coletivo</Label>
                    <Select value={isColetiva ? 'Sim' : 'Não'} onValueChange={(v) => setIsColetiva(v === 'Sim')}>
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
                    <Label htmlFor="dataDecreto">Data do Decreto *</Label>
                    <Input id="dataDecreto" type="date" value={dataDecreto} onChange={(e) => setDataDecreto(e.target.value)} disabled={isSubmitting} className={errors.dataDecreto ? 'border-red-500' : ''} />
                    {errors.dataDecreto && (
                      <p className="text-sm text-red-600">{errors.dataDecreto}</p>
                    )}
                  </div>
                  <div className="basis-[45%] min-w-[240px] space-y-2">
                    <Label htmlFor="tipo">Tipo de Decreto *</Label>
                    <Select value={tipoDecreto || undefined} onValueChange={setTipoDecreto} disabled={loadingTipos || isSubmitting}>
                      <SelectTrigger className={errors.tipoDecreto ? 'border-red-500' : ''}>
                        <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Selecione o tipo...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTipos ? (
                          <SelectItem value="loading" disabled><div className="flex items-center"><span className="mr-2">⏳</span>Carregando tipos...</div></SelectItem>
                        ) : errorTipos ? (
                          <SelectItem value="error" disabled>Erro ao carregar tipos</SelectItem>
                        ) : Array.isArray(tiposDecreto) && tiposDecreto.length > 0 ? (
                          tiposDecreto.map((tipo) => (
                            <SelectItem key={tipo.id} value={String(tipo.id)}>{tipo.nome}</SelectItem>
                          ))
                        ) : decretoTipos.length === 0 ? (
                          <SelectItem value="empty" disabled>Nenhum tipo encontrado</SelectItem>
                        ) : (
                          decretoTipos.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Terceira linha: Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Decreto *</Label>
                  <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título do decreto" disabled={isSubmitting} className={errors.titulo ? 'border-red-500' : ''} />
                  {errors.titulo && (
                    <p className="text-sm text-red-600">{errors.titulo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preambulo">Preâmbulo *</Label>
                  <Textarea id="preambulo" value={preambulo} onChange={(e) => setPreambulo(e.target.value)} placeholder="Escreva o preâmbulo do decreto" disabled={isSubmitting} className={errors.preambulo ? 'border-red-500' : ''} />
                  {errors.preambulo && (
                    <p className="text-sm text-red-600">{errors.preambulo}</p>
                  )}
                </div>


                {/* Seleção do Servidor/Responsável */}
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
                        <Input id="nomeServidor" value={nomeServidor} onChange={(e) => setNomeServidor(e.target.value)} placeholder="Digite o nome do servidor" />
                        <div className="absolute right-2 top-7"></div>
                        {false && showServidoresList && servidoresEncontrados.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" className="gap-2 transition-colors" aria-label="Buscar Servidor" onClick={() => setIsServidorDialogOpen(true)}>
                          <Search className="h-4 w-4" />
                          Buscar Servidor
                        </Button>
                        <Button type="button" variant="outline" className="gap-2 transition-colors" aria-label="Cadastrar Servidor" onClick={() => navigate('/servidores/cadastrar')}>
                          <Plus className="h-4 w-4" />
                          Cadastrar Servidor
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground ml-2">
                        {isColetiva ? 'Você pode selecionar múltiplos servidores.' : 'Seleção de apenas um servidor.'}
                      </p>
                    </div>
                    {servidoresSelecionados.length > 0 && (
                      <div className="space-y-2">
                        <Label>Servidores Selecionados:</Label>
                        <div className="space-y-2">
                          {servidoresSelecionados.map((servidor) => (
                            <div key={servidor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div>
                                <div className="font-medium uppercase">{servidor.nome_completo?.toUpperCase()} - {formatCpf(servidor.cpf)}</div>
                              </div>
                              <Button type="button" variant="outline" size="sm" className="gap-2 transition-colors" onClick={() => removerServidor(servidor.id)} aria-label={`Remover ${servidor.nome_completo}`}>
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

        <div className="lg:col-span-1 space-y-6">
          <DocumentUpload 
            documentType={'decretos'}
            selectedFile={selectedFile}
            onFileChange={onFileChange}
          />
          <AnexosCard documentType={'decretos'} />
        </div>
      </div>

      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataDecreto ? new Date(dataDecreto).getFullYear() : new Date().getFullYear()}
        mode="select"
        documentType={'decretos'}
      />

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

export default DecretoForm;
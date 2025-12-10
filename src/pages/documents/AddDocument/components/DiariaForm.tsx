import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, Plus, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { NumeracaoDialog } from '@components/shared';
import { NumeracaoDocumento, numeracaoService } from '@/services/numeracaoService';
import { buscarServidoresPorNome } from '@/services/servidorService';
import { DocumentUpload, AnexosCard } from '@components/shared';
import { ServidorSearchDialog } from '@/components/shared/ServidorSearchDialog';
import type { AssinaturasState } from '@/components/signatures/AssinaturasModal';

interface DiariaFormProps {
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
  assinaturasState?: AssinaturasState | null;
  assinaturasValid?: boolean;
  formId?: string;
}

export const DiariaForm: React.FC<DiariaFormProps> = ({ selectedFile, onFileChange, assinaturasState, assinaturasValid = true, formId = 'document-form' }) => {
  const navigate = useNavigate();
  const [numeracao, setNumeracao] = useState<string>('');
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState<boolean>(false);
  const [dataDiaria, setDataDiaria] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [tipoDiaria, setTipoDiaria] = useState<string>('');
  const [valorDiaria, setValorDiaria] = useState<string>('');
  const [destino, setDestino] = useState<string>('');
  const [finalidade, setFinalidade] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diariaVencida, setDiariaVencida] = useState<string>('nao');

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

  // Tipos de diária
  const tiposDiaria = [
    { id: 'servidor', nome: 'Servidor' },
    { id: 'secretario', nome: 'Secretário' },
    { id: 'prefeito', nome: 'Prefeito e Vice-Prefeito' },
    { id: 'conselheiro', nome: 'Conselheiro' }
  ];

  useEffect(() => {
    // Inicializa data com hoje
    const hoje = new Date().toISOString().split('T')[0];
    setDataDiaria(hoje);
    // Define tipo padrão
    if (tiposDiaria.length > 0) {
      setTipoDiaria(tiposDiaria[0].id);
    }
  }, []);

  useEffect(() => {
    // Preencher automaticamente próxima numeração disponível para diárias
    const preencherNumeracaoPadrao = async () => {
      try {
        const ano = dataDiaria ? new Date(dataDiaria).getFullYear() : new Date().getFullYear();
        const proximo = await numeracaoService.obterProximoDisponivel(ano, 'diarias');
        setSelectedNumeracao(proximo);
        const numeroFormatado = proximo.ano ? `${proximo.numero}/${proximo.ano}` : proximo.numero;
        setNumeracao(numeroFormatado);
      } catch (error) {
        console.error('Erro ao obter próxima numeração de diárias:', error);
      }
    };
    preencherNumeracaoPadrao();
  }, [dataDiaria]);

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
    const permiteMultipla = false; // Diária não possui campo Coletiva, manter seleção simples
    if (!permiteMultipla && servidoresSelecionados.length >= 1 && !jaSelecionado) {
      toast.error('Seleção múltipla não permitida nesta tela. Selecione apenas um servidor.');
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
    if (!assinaturasValid) {
      toast.error('Preencha todas as assinaturas obrigatórias.');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('Submissão de diária (UI-only):', {
        numeracao,
        titulo,
        tipoDiaria,
        dataDiaria,
        valorDiaria,
        destino,
        finalidade,
        servidoresSelecionados
      });
      navigate('/documentos');
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
              <CardTitle>Informações da Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                {/* Primeira linha: Numeração & Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeracao">Numeração *</Label>
                    <div className="flex gap-2">
                      <Input id="numeracao" value={numeracao} readOnly placeholder="Selecione uma numeração" className="flex-1" />
                      <Button type="button" variant="outline" onClick={() => setIsNumeracaoDialogOpen(true)} className="px-3" disabled={isSubmitting}>
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Diária *</Label>
                    <Select value={tipoDiaria} onValueChange={setTipoDiaria} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDiaria.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda linha: Título & Diária Vencida */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Diária *</Label>
                    <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título da diária" disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diariaVencida">Diária Vencida</Label>
                    <Select value={diariaVencida} onValueChange={setDiariaVencida} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao">Não</SelectItem>
                        <SelectItem value="sim">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Terceira linha: Data & Valor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataDiaria">Data da Diária *</Label>
                    <Input id="dataDiaria" type="date" value={dataDiaria} onChange={(e) => setDataDiaria(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorDiaria">Valor da Diária</Label>
                    <Input id="valorDiaria" type="number" step="0.01" value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value)} placeholder="0,00" disabled={isSubmitting} />
                  </div>
                </div>

                {/* Quarta linha: Destino & Finalidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destino">Destino *</Label>
                    <Input id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Digite o destino da viagem" disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalidade">Finalidade *</Label>
                    <Input id="finalidade" value={finalidade} onChange={(e) => setFinalidade(e.target.value)} placeholder="Digite a finalidade da viagem" disabled={isSubmitting} />
                  </div>
                </div>

                {/* Seleção do Servidor/Responsável */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Seleção do Servidor/Responsável</CardTitle>
                      <Badge variant={'secondary'} aria-live="polite">Seleção simples</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 relative hidden">
                        <Label htmlFor="nomeServidor">Nome do Servidor</Label>
                        <Input id="nomeServidor" value={nomeServidor} onChange={(e) => setNomeServidor(e.target.value)} placeholder="Digite o nome do servidor" />
                        <div className="absolute right-2 top-7"></div>
                        {showServidoresList && servidoresEncontrados.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {servidoresEncontrados.map((servidor) => (
                              <div key={servidor.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => adicionarServidor(servidor)}>
                                <div className="font-medium">{servidor.nome_completo}</div>
                                <div className="text-sm text-gray-500">CPF: {servidor.cpf}</div>
                              </div>
                            ))}
                          </div>
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
                      <p className="text-sm text-muted-foreground ml-2">Seleção de apenas um servidor.</p>
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

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => navigate('/documentos')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      `Criar Diária`
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <DocumentUpload 
            documentType={'diarias'}
            selectedFile={selectedFile}
            onFileChange={onFileChange}
          />
          <AnexosCard documentType={'diarias'} />
        </div>
      </div>

      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataDiaria ? new Date(dataDiaria).getFullYear() : new Date().getFullYear()}
        mode="select"
        documentType={'diarias'}
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

export default DiariaForm;
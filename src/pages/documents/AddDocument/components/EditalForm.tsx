import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NumeracaoDialog } from '@/components/NumeracaoDialog';
import { NumeracaoDocumento, numeracaoService } from '@/services/numeracaoService';
import { buscarServidoresPorNome } from '@/services/servidorService';
import { DocumentUpload, AnexosCard } from '@components/shared';

interface EditalFormProps {
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
}

export const EditalForm: React.FC<EditalFormProps> = ({ selectedFile, onFileChange }) => {
  const navigate = useNavigate();
  const [numeracao, setNumeracao] = useState<string>('');
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState<boolean>(false);
  const [dataEdital, setDataEdital] = useState<string>('');
  const [dataAbertura, setDataAbertura] = useState<string>('');
  const [dataEncerramento, setDataEncerramento] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [tipoEdital, setTipoEdital] = useState<string>('');
  const [objeto, setObjeto] = useState<string>('');
  const [valorEstimado, setValorEstimado] = useState<string>('');
  const [modalidade, setModalidade] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Tipos de edital
  const tiposEdital = [
    { id: '1', nome: 'Edital de Licitação' },
    { id: '2', nome: 'Edital de Concurso Público' },
    { id: '3', nome: 'Edital de Processo Seletivo' },
    { id: '4', nome: 'Edital de Credenciamento' },
    { id: '5', nome: 'Edital de Chamamento Público' }
  ];

  // Modalidades de licitação
  const modalidades = [
    { id: '1', nome: 'Concorrência' },
    { id: '2', nome: 'Tomada de Preços' },
    { id: '3', nome: 'Convite' },
    { id: '4', nome: 'Concurso' },
    { id: '5', nome: 'Leilão' },
    { id: '6', nome: 'Pregão' },
    { id: '7', nome: 'Registro de Preços' }
  ];

  useEffect(() => {
    // Inicializa data com hoje
    const hoje = new Date().toISOString().split('T')[0];
    setDataEdital(hoje);
    // Define tipo padrão
    if (tiposEdital.length > 0) {
      setTipoEdital(tiposEdital[0].id);
    }
    if (modalidades.length > 0) {
      setModalidade(modalidades[0].id);
    }
  }, []);

  useEffect(() => {
    // Preencher automaticamente próxima numeração disponível para editais
    const preencherNumeracaoPadrao = async () => {
      try {
        const ano = dataEdital ? new Date(dataEdital).getFullYear() : new Date().getFullYear();
        const proximo = await numeracaoService.obterProximoDisponivel(ano, 'editais');
        setSelectedNumeracao(proximo);
        const numeroFormatado = proximo.ano ? `${proximo.numero}/${proximo.ano}` : proximo.numero;
        setNumeracao(numeroFormatado);
      } catch (error) {
        console.error('Erro ao obter próxima numeração de editais:', error);
      }
    };
    preencherNumeracaoPadrao();
  }, [dataEdital]);

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
    if (!servidoresSelecionados.find(s => s.id === servidor.id)) {
      setServidoresSelecionados([...servidoresSelecionados, servidor]);
    }
    setNomeServidor('');
    setShowServidoresList(false);
  };

  const removerServidor = (servidorId: string) => {
    setServidoresSelecionados(servidoresSelecionados.filter(s => s.id !== servidorId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Submissão de edital (UI-only):', {
        numeracao,
        titulo,
        tipoEdital,
        modalidade,
        dataEdital,
        dataAbertura,
        dataEncerramento,
        objeto,
        valorEstimado,
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
              <CardTitle>Informações do Edital</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Label htmlFor="tipo">Tipo de Edital *</Label>
                    <Select value={tipoEdital} onValueChange={setTipoEdital} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEdital.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda linha: Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Edital *</Label>
                  <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título do edital" disabled={isSubmitting} />
                </div>

                {/* Terceira linha: Modalidade & Valor Estimado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modalidade">Modalidade</Label>
                    <Select value={modalidade} onValueChange={setModalidade} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a modalidade..." />
                      </SelectTrigger>
                      <SelectContent>
                        {modalidades.map((mod) => (
                          <SelectItem key={mod.id} value={mod.id}>{mod.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorEstimado">Valor Estimado</Label>
                    <Input id="valorEstimado" type="number" step="0.01" value={valorEstimado} onChange={(e) => setValorEstimado(e.target.value)} placeholder="0,00" disabled={isSubmitting} />
                  </div>
                </div>

                {/* Quarta linha: Datas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataEdital">Data do Edital *</Label>
                    <Input id="dataEdital" type="date" value={dataEdital} onChange={(e) => setDataEdital(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataAbertura">Data de Abertura</Label>
                    <Input id="dataAbertura" type="date" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataEncerramento">Data de Encerramento</Label>
                    <Input id="dataEncerramento" type="date" value={dataEncerramento} onChange={(e) => setDataEncerramento(e.target.value)} disabled={isSubmitting} />
                  </div>
                </div>

                {/* Quinta linha: Objeto */}
                <div className="space-y-2">
                  <Label htmlFor="objeto">Objeto *</Label>
                  <Textarea 
                    id="objeto" 
                    value={objeto} 
                    onChange={(e) => setObjeto(e.target.value)} 
                    placeholder="Descreva o objeto do edital" 
                    disabled={isSubmitting}
                    rows={4}
                  />
                </div>

                {/* Seleção do Servidor/Responsável */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seleção do Servidor/Responsável</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Label htmlFor="nomeServidor">Nome do Servidor</Label>
                        <Input id="nomeServidor" value={nomeServidor} onChange={(e) => setNomeServidor(e.target.value)} placeholder="Digite o nome do servidor" />
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
                      <Button type="button" variant="outline" size="icon" className="mt-6" onClick={() => {
                        if (nomeServidor && servidoresEncontrados.length > 0) {
                          adicionarServidor(servidoresEncontrados[0]);
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
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
                      `Criar Edital`
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <DocumentUpload 
            documentType={'editais'}
            selectedFile={selectedFile}
            onFileChange={onFileChange}
          />
          <AnexosCard documentType={'editais'} />
        </div>
      </div>

      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataEdital ? new Date(dataEdital).getFullYear() : new Date().getFullYear()}
        mode="select"
        documentType={'editais'}
      />
    </div>
  );
};

export default EditalForm;
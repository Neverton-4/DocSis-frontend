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

interface LeiFormProps {
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
}

export const LeiForm: React.FC<LeiFormProps> = ({ selectedFile, onFileChange }) => {
  const navigate = useNavigate();
  const [numeracao, setNumeracao] = useState<string>('');
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState<boolean>(false);
  const [dataLei, setDataLei] = useState<string>('');
  const [dataPublicacao, setDataPublicacao] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [tipoLei, setTipoLei] = useState<string>('');
  const [ementa, setEmenta] = useState<string>('');
  const [assunto, setAssunto] = useState<string>('');
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

  // Tipos de lei
  const tiposLei = [
    { id: '1', nome: 'Lei Ordinária' },
    { id: '2', nome: 'Lei Complementar' },
    { id: '3', nome: 'Lei Delegada' },
    { id: '4', nome: 'Medida Provisória' },
    { id: '5', nome: 'Lei Orçamentária' }
  ];

  useEffect(() => {
    // Inicializa data com hoje
    const hoje = new Date().toISOString().split('T')[0];
    setDataLei(hoje);
    // Define tipo padrão
    if (tiposLei.length > 0) {
      setTipoLei(tiposLei[0].id);
    }
  }, []);

  useEffect(() => {
    // Preencher automaticamente próxima numeração disponível para leis
    const preencherNumeracaoPadrao = async () => {
      try {
        const ano = dataLei ? new Date(dataLei).getFullYear() : new Date().getFullYear();
        const proximo = await numeracaoService.obterProximoDisponivel(ano, 'leis');
        setSelectedNumeracao(proximo);
        const numeroFormatado = proximo.ano ? `${proximo.numero}/${proximo.ano}` : proximo.numero;
        setNumeracao(numeroFormatado);
      } catch (error) {
        console.error('Erro ao obter próxima numeração de leis:', error);
      }
    };
    preencherNumeracaoPadrao();
  }, [dataLei]);

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
      console.log('Submissão de lei (UI-only):', {
        numeracao,
        titulo,
        tipoLei,
        dataLei,
        dataPublicacao,
        ementa,
        assunto,
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
              <CardTitle>Informações da Lei</CardTitle>
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
                    <Label htmlFor="tipo">Tipo de Lei *</Label>
                    <Select value={tipoLei} onValueChange={setTipoLei} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposLei.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda linha: Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Lei *</Label>
                  <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título da lei" disabled={isSubmitting} />
                </div>

                {/* Terceira linha: Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataLei">Data da Lei *</Label>
                    <Input id="dataLei" type="date" value={dataLei} onChange={(e) => setDataLei(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataPublicacao">Data de Publicação</Label>
                    <Input id="dataPublicacao" type="date" value={dataPublicacao} onChange={(e) => setDataPublicacao(e.target.value)} disabled={isSubmitting} />
                  </div>
                </div>

                {/* Quarta linha: Assunto */}
                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto *</Label>
                  <Input id="assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Digite o assunto da lei" disabled={isSubmitting} />
                </div>

                {/* Quinta linha: Ementa */}
                <div className="space-y-2">
                  <Label htmlFor="ementa">Ementa *</Label>
                  <Textarea 
                    id="ementa" 
                    value={ementa} 
                    onChange={(e) => setEmenta(e.target.value)} 
                    placeholder="Digite a ementa da lei" 
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
                      <Button type="button" variant="outline" className="mt-6 gap-2 transition-colors" aria-label="Adicionar Servidor" onClick={() => {
                        if (nomeServidor && servidoresEncontrados.length > 0) {
                          adicionarServidor(servidoresEncontrados[0]);
                        }
                      }}>
                        <Plus className="h-4 w-4" />
                        Adicionar Servidor
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
                      `Criar Lei`
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <DocumentUpload 
            documentType={'leis'}
            selectedFile={selectedFile}
            onFileChange={onFileChange}
          />
          <AnexosCard documentType={'leis'} />
        </div>
      </div>

      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataLei ? new Date(dataLei).getFullYear() : new Date().getFullYear()}
        mode="select"
        documentType={'leis'}
      />
    </div>
  );
};

export default LeiForm;
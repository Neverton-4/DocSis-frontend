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

interface OutroFormProps {
  selectedFile?: File | null;
  onFileChange?: (file: File | null) => void;
}

export const OutroForm: React.FC<OutroFormProps> = ({ selectedFile, onFileChange }) => {
  const navigate = useNavigate();
  const [numeracao, setNumeracao] = useState<string>('');
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState<boolean>(false);
  const [dataDocumento, setDataDocumento] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
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

  // Tipos de documento
  const tiposDocumento = [
    { id: '1', nome: 'Ofício' },
    { id: '2', nome: 'Memorando' },
    { id: '3', nome: 'Circular' },
    { id: '4', nome: 'Comunicado' },
    { id: '5', nome: 'Instrução Normativa' },
    { id: '6', nome: 'Resolução' },
    { id: '7', nome: 'Ata' },
    { id: '8', nome: 'Relatório' },
    { id: '9', nome: 'Parecer' },
    { id: '10', nome: 'Outros' }
  ];

  // Categorias
  const categorias = [
    { id: '1', nome: 'Administrativo' },
    { id: '2', nome: 'Financeiro' },
    { id: '3', nome: 'Jurídico' },
    { id: '4', nome: 'Recursos Humanos' },
    { id: '5', nome: 'Técnico' },
    { id: '6', nome: 'Operacional' },
    { id: '7', nome: 'Estratégico' }
  ];

  useEffect(() => {
    // Inicializa data com hoje
    const hoje = new Date().toISOString().split('T')[0];
    setDataDocumento(hoje);
    // Define tipo padrão
    if (tiposDocumento.length > 0) {
      setTipoDocumento(tiposDocumento[0].id);
    }
    if (categorias.length > 0) {
      setCategoria(categorias[0].id);
    }
  }, []);

  useEffect(() => {
    // Preencher automaticamente próxima numeração disponível para outros documentos
    const preencherNumeracaoPadrao = async () => {
      try {
        const ano = dataDocumento ? new Date(dataDocumento).getFullYear() : new Date().getFullYear();
        const proximo = await numeracaoService.obterProximoDisponivel(ano, 'outros');
        setSelectedNumeracao(proximo);
        const numeroFormatado = proximo.ano ? `${proximo.numero}/${proximo.ano}` : proximo.numero;
        setNumeracao(numeroFormatado);
      } catch (error) {
        console.error('Erro ao obter próxima numeração de outros documentos:', error);
      }
    };
    preencherNumeracaoPadrao();
  }, [dataDocumento]);

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
      console.log('Submissão de outro documento (UI-only):', {
        numeracao,
        titulo,
        tipoDocumento,
        categoria,
        dataDocumento,
        descricao,
        observacoes,
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
              <CardTitle>Informações do Documento</CardTitle>
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
                    <Label htmlFor="tipo">Tipo de Documento *</Label>
                    <Select value={tipoDocumento} onValueChange={setTipoDocumento} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>{tipo.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda linha: Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Documento *</Label>
                  <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título do documento" disabled={isSubmitting} />
                </div>

                {/* Terceira linha: Categoria & Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={categoria} onValueChange={setCategoria} disabled={isSubmitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataDocumento">Data do Documento *</Label>
                    <Input id="dataDocumento" type="date" value={dataDocumento} onChange={(e) => setDataDocumento(e.target.value)} disabled={isSubmitting} />
                  </div>
                </div>

                {/* Quarta linha: Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea 
                    id="descricao" 
                    value={descricao} 
                    onChange={(e) => setDescricao(e.target.value)} 
                    placeholder="Descreva o conteúdo do documento" 
                    disabled={isSubmitting}
                    rows={4}
                  />
                </div>

                {/* Quinta linha: Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    value={observacoes} 
                    onChange={(e) => setObservacoes(e.target.value)} 
                    placeholder="Observações adicionais (opcional)" 
                    disabled={isSubmitting}
                    rows={3}
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
                      `Criar Documento`
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <DocumentUpload 
            documentType={'outros'}
            selectedFile={selectedFile}
            onFileChange={onFileChange}
          />
          <AnexosCard documentType={'outros'} />
        </div>
      </div>

      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataDocumento ? new Date(dataDocumento).getFullYear() : new Date().getFullYear()}
        mode="select"
        documentType={'outros'}
      />
    </div>
  );
};

export default OutroForm;
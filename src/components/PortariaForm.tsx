import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Calendar } from 'lucide-react';
import { useOptimizedTiposPortaria } from '@/hooks/useOptimizedTiposPortaria';
import { buscarServidoresPorNome } from '@/services/servidorService';
import { NumeracaoDialog } from '@components/shared';
import { NumeracaoDocumento } from '@/services/numeracaoService';
import { documentoService } from '@/services/documentoPortariaService';
import { DocumentUpload, AnexosCard } from '@components/shared';

interface Servidor {
  id: string;
  nome_completo: string;
  cpf: string;
}

export const PortariaForm = () => {
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
  
  // Estados para validação
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { tiposPortaria, subtiposPortaria, loading, loadingSubtipos, error, errorSubtipos, refetch: fetchTiposPortaria, fetchSubtiposByTipo } = useOptimizedTiposPortaria();
  const [servidoresEncontrados, setServidoresEncontrados] = useState<Servidor[]>([]);
  const [showServidoresList, setShowServidoresList] = useState(false);

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
    if (!servidoresSelecionados.find(s => s.id === servidor.id)) {
      setServidoresSelecionados([...servidoresSelecionados, servidor]);
    }
    setNomeServidor('');
    setShowServidoresList(false);
  };

  const removerServidor = (servidorId: string) => {
    setServidoresSelecionados(servidoresSelecionados.filter(s => s.id !== servidorId));
  };

  // Função de validação
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validar numeração
    if (!numeracao || !selectedNumeracao) {
      newErrors.numeracao = 'Selecione uma numeração';
    }

    // Validar tipo de portaria
    if (!tipoPortaria) {
      newErrors.tipoPortaria = 'Selecione um tipo de portaria';
    }

    // Validar subtipo se necessário (quando há subtipos disponíveis)
    if (tipoPortaria && Array.isArray(subtiposPortaria) && subtiposPortaria.length > 0 && !subtipoPortaria) {
      newErrors.subtipoPortaria = 'Selecione um subtipo de portaria';
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
    if (!documentFile) {
      newErrors.documentFile = 'Selecione o arquivo da portaria (.docx)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar dados da portaria
      const portariaData = {
        numero: numeracao.includes('/') ? numeracao.split('/')[0] : numeracao,  // Extrair apenas o número
        ano: selectedNumeracao?.ano || new Date().getFullYear(),
        titulo: titulo,
        tipo_id: parseInt(tipoPortaria),
        subtipo_id: subtipoPortaria ? parseInt(subtipoPortaria) : undefined,
        data_portaria: dataPortaria,
        coletiva: isColetiva,
        preambulo: preambulo,
        // servidor_id é opcional - só enviar se um servidor foi selecionado
        ...(servidoresSelecionados.length > 0 && { servidor_id: servidoresSelecionados[0].id }),
        conteudo: titulo // Usando título como conteúdo por enquanto
      };

      console.log('Enviando dados da portaria:', portariaData);
      
      // Chamar o serviço para criar a portaria com documento
      const resultado = await documentoService.createWithDocument(portariaData, documentFile!);
      
      console.log('Portaria criada com sucesso:', resultado);
      alert('Portaria criada com sucesso!');
      
      // Limpar formulário após sucesso
      setNumeracao('');
      setSelectedNumeracao(null);
      setTipoPortaria('');
      setSubtipoPortaria('');
      setTitulo('');
      setDataPortaria(new Date().toISOString().split('T')[0]);
      setPreambulo('');
      setDocumentFile(null);
      setServidoresSelecionados([]);
      setIsColetiva(false);
      setErrors({});
      
    } catch (error) {
      console.error('Erro ao criar portaria:', error);
      alert('Erro ao criar portaria. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Card Principal com Informações da Portaria */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informações da Portaria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Linha Superior */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coletiva">Portaria Coletiva</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="numeracao">Numeração *</Label>
                <div className="flex gap-2">
                  <Input
                    id="numeracao"
                    value={numeracao}
                    readOnly
                    placeholder="Selecione uma numeração"
                    className={`flex-1 ${errors.numeracao ? 'border-red-500' : ''}`}
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
                {errors.numeracao && (
                  <p className="text-sm text-red-600">{errors.numeracao}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPortaria">Data da Portaria *</Label>
                <Input
                  id="dataPortaria"
                  type="date"
                  value={dataPortaria}
                  onChange={(e) => setDataPortaria(e.target.value)}
                  className={errors.dataPortaria ? 'border-red-500' : ''}
                />
                {errors.dataPortaria && (
                  <p className="text-sm text-red-600">{errors.dataPortaria}</p>
                )}
              </div>
            </div>

            {/* Tipo e Subtipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Portaria *</Label>
                <Select 
                  value={tipoPortaria} 
                  onValueChange={setTipoPortaria}
                  disabled={loading}
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
              
              {tipoPortaria && (
                <div className="space-y-2">
                  <Label htmlFor="subtipo">Subtipo de Portaria</Label>
                  {loadingSubtipos ? (
                    <div className="flex items-center justify-center p-4">
                      <span className="mr-2">⏳</span>
                      Carregando subtipos...
                    </div>
                  ) : errorSubtipos ? (
                    <p className="text-sm text-red-600">{errorSubtipos}</p>
                  ) : !Array.isArray(subtiposPortaria) || subtiposPortaria.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum subtipo disponível para este tipo</p>
                  ) : (
                    <>
                      <Select 
                        value={subtipoPortaria} 
                        onValueChange={setSubtipoPortaria}
                        disabled={loadingSubtipos}
                      >
                        <SelectTrigger className={errors.subtipoPortaria ? 'border-red-500' : ''}>
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
                      {errors.subtipoPortaria && (
                        <p className="text-sm text-red-600">{errors.subtipoPortaria}</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Portaria *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título da portaria"
                className={errors.titulo ? 'border-red-500' : ''}
              />
              {errors.titulo && (
                <p className="text-sm text-red-600">{errors.titulo}</p>
              )}
            </div>

            {/* Preâmbulo */}
            <div className="space-y-2">
              <Label htmlFor="preambulo">Preâmbulo *</Label>
              <textarea
                id="preambulo"
                value={preambulo}
                onChange={(e) => setPreambulo(e.target.value)}
                className={`w-full min-h-[120px] rounded-md border px-3 py-2 text-sm ${errors.preambulo ? 'border-red-500' : ''}`}
                placeholder="Escreva o preâmbulo da portaria"
              />
              {errors.preambulo && (
                <p className="text-sm text-red-600">{errors.preambulo}</p>
              )}
            </div>

            {/* Card de Seleção do Servidor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seleção do Servidor/Responsável</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Label htmlFor="nomeServidor">Nome do Servidor</Label>
                    <Input
                      id="nomeServidor"
                      value={nomeServidor}
                      onChange={(e) => setNomeServidor(e.target.value)}
                      placeholder="Digite o nome do servidor"
                    />
                    
                    {/* Lista de servidores encontrados */}
                    {showServidoresList && servidoresEncontrados.length > 0 && (
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
                  
                  {isColetiva && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="mt-6"
                      onClick={() => {
                        if (nomeServidor && servidoresEncontrados.length > 0) {
                          adicionarServidor(servidoresEncontrados[0]);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
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
                            <div className="font-medium">{servidor.nome_completo}</div>
                            <div className="text-sm text-gray-500">
                              CPF: {servidor.cpf}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerServidor(servidor.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit">
                Criar Portaria
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      
      
      {/* Diálogo de Numeração */}
      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={handleNumeracaoSelect}
        ano={dataPortaria ? new Date(dataPortaria).getFullYear() : new Date().getFullYear()}
        documentType={'portarias'}
      />
    </div>
  );
};
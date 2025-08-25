import React, { useState } from 'react';
import { DocumentList } from '@/components/DocumentList';
import Header from '@/components/Header';
import { Search, Plus, FileText, Gavel, Car, Upload, RefreshCw, Eye, Edit, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { usePortarias } from '@/hooks/usePortarias';
import { Portaria } from '@/types';

export const CreateDocument = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('portarias');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTramitacaoDialogOpen, setIsTramitacaoDialogOpen] = useState(false);
  const [portariaSelecionada, setPortariaSelecionada] = useState<Portaria | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [serverName, setServerName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const navigate = useNavigate();
  
  // Hook para carregar portarias do backend
  const { portarias, loading, error, refetch } = usePortarias();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setDocumentFile(file);
    } else {
      alert('Por favor, selecione apenas arquivos .docx');
    }
  };

  const handleSubmitDocument = () => {
    if (!documentFile || !documentType || !serverName || !documentNumber || !documentDate) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    console.log({
      file: documentFile,
      type: documentType,
      serverName,
      documentNumber,
      documentDate
    });
    
    // Resetar o formulário
    setDocumentFile(null);
    setDocumentType('');
    setServerName('');
    setDocumentNumber('');
    setDocumentDate('');
    setIsDialogOpen(false);
    
    // Recarregar a lista após adicionar
    refetch();
  };

  const openDialogWithType = (type: string) => {
    setDocumentType(type);
    setIsDialogOpen(true);
  };

  const getButtonName = (type: string) => {
    const typeNames = {
      'portarias': 'Nova Portaria',
      'decretos': 'Novo Decreto',
      'diarias': 'Nova Diária'
    };
    return typeNames[type] || 'Novo Documento';
  };

  const getSingularName = (type: string) => {
    const typeNames = {
      'portarias': 'Portaria',
      'decretos': 'Decreto',
      'diarias': 'Diária'
    };
    return typeNames[type] || 'Documento';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'rascunho': 'bg-gray-500',
      'pendente': 'bg-yellow-500',
      'assinada': 'bg-blue-500',
      'publicada': 'bg-green-500',
      'cancelada': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'rascunho': 'Rascunho',
      'pendente': 'Pendente',
      'assinada': 'Assinada',
      'publicada': 'Publicada',
      'cancelada': 'Cancelada'
    };
    return texts[status] || status;
  };

  const handleVisualizarPortaria = (portaria: Portaria) => {
    console.log('Visualizar portaria:', portaria.id);
    // Implementar navegação para visualização
    navigate(`/portarias/${portaria.id}/visualizar`);
  };

  const handleEditarPortaria = (portaria: Portaria) => {
    console.log('Editar portaria:', portaria.id);
    // Implementar navegação para edição
    navigate(`/portarias/${portaria.id}/editar`);
  };

  const handleTramitarPortaria = (portaria: Portaria) => {
    setPortariaSelecionada(portaria);
    setIsTramitacaoDialogOpen(true);
  };

  const getTramitacaoOpcoes = (status: string) => {
    switch (status.toLowerCase()) {
      case 'criado':
      case 'rascunho':
        return [
          { value: 'revisado', label: 'Marcar como Revisado' },
          { value: 'assinar', label: 'Enviar para Assinatura' }
        ];
      case 'revisado':
        return [
          { value: 'assinar', label: 'Enviar para Assinatura' }
        ];
      case 'assinado':
      case 'assinada':
        return [
          { value: 'publicar', label: 'Publicar' }
        ];
      default:
        return [];
    }
  };

  const handleConfirmarTramitacao = (acao: string) => {
    if (!portariaSelecionada) return;
    
    console.log(`Tramitando portaria ${portariaSelecionada.id} para: ${acao}`);
    
    // Aqui você implementaria a lógica para atualizar o status da portaria
    // Exemplo: await portariaService.updateStatus(portariaSelecionada.id, acao);
    
    setIsTramitacaoDialogOpen(false);
    setPortariaSelecionada(null);
    refetch(); // Recarregar a lista após tramitação
  };

  // Filtrar portarias baseado no termo de busca
  const filteredPortarias = portarias.filter(portaria =>
    portaria.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portaria.servidor?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portaria.tipo_portaria?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    portaria.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente para exibir lista de portarias
  const PortariasList = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando portarias...</span>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (filteredPortarias.length === 0) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhuma portaria encontrada com os critérios de busca.' : 'Nenhuma portaria encontrada.'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPortarias.map((portaria) => (
          <Card key={portaria.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center gap-6">
                {/* Informações da portaria - Lado esquerdo */}
                <div className="flex-1">
                  {/* Primeira linha: Numeração/Ano e Status próximos */}
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {portaria.numero}/{portaria.ano}
                    </h3>
                    <Badge className={`${getStatusColor(portaria.status)} text-white`}>
                      {getStatusText(portaria.status)}
                    </Badge>
                  </div>
                  
                  {/* Segunda linha: Tipo e Subtipo */}
                  <div className="mb-1">
                    <p className="text-gray-700">
                      {portaria.tipo_portaria?.nome || 'N/A'}
                      {portaria.subtipo_portaria?.nome && (
                        <span className="text-gray-500"> - {portaria.subtipo_portaria.nome}</span>
                      )}
                    </p>
                  </div>
                  
                  {/* Terceira linha: Servidor e Data */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Servidor:</span> {portaria.servidor?.nome_completo || 'Não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {new Date(portaria.data_portaria).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  {/* Observações (se houver) */}
                  {portaria.observacoes && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="font-medium text-gray-700">Observações:</span>
                      <p className="text-gray-600 text-sm mt-1">{portaria.observacoes}</p>
                    </div>
                  )}
                </div>
                
                {/* Botões de ação centralizados verticalmente - Lado direito */}
                <div className="flex items-center gap-2 min-w-[300px]">
                  <Button
                    onClick={() => handleVisualizarPortaria(portaria)}
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                  
                  <Button
                    onClick={() => handleEditarPortaria(portaria)}
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    onClick={() => handleTramitarPortaria(portaria)}
                    variant="default"
                    size="sm"
                    className="flex-1 justify-center bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Tramitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const ActionButtons = ({ documentType }: { documentType: string }) => (
    <div className="flex gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => openDialogWithType(documentType)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Adicionar {getSingularName(documentType)}
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
                <p className="text-sm text-green-600">Arquivo selecionado: {documentFile.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portarias">Portarias</SelectItem>
                  <SelectItem value="decretos">Decretos</SelectItem>
                  <SelectItem value="diarias">Diárias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="server-name">Nome do Servidor</Label>
              <Input
                id="server-name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Digite o nome do servidor"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="document-number">Numeração</Label>
                <Input
                  id="document-number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ex: 001/2024"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document-date">Data do Documento</Label>
                <Input
                  id="document-date"
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmitDocument}>
              Adicionar {getSingularName(documentType)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Button 
        onClick={() => navigate('/create-document')}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        {getButtonName(documentType)}
      </Button>
      
      <Button 
        onClick={refetch}
        variant="outline"
        size="sm"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Atualizar
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Documentos / Criar" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <div className="mb-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            ← Voltar
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-3 w-auto">
              <TabsTrigger value="portarias" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Portarias
                {!loading && (
                  <Badge variant="secondary" className="ml-1">
                    {filteredPortarias.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="decretos" className="flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                Decretos
              </TabsTrigger>
              <TabsTrigger value="diarias" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Diárias
              </TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pesquisar por número, servidor, tipo ou status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>

          <TabsContent value="portarias" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Portarias</h2>
              <ActionButtons documentType="portarias" />
            </div>
            <PortariasList />
          </TabsContent>
          
          <TabsContent value="decretos" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Decretos</h2>
              <ActionButtons documentType="decretos" />
            </div>
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-600">Funcionalidade de decretos em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diarias" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Diárias</h2>
              <ActionButtons documentType="diarias" />
            </div>
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-600">Funcionalidade de diárias em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateDocument;

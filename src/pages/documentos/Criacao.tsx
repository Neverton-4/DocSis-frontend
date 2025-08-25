import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Loader2, 
  Upload, 
  RefreshCw, 
  FileText, 
  Gavel, 
  Car, 
  Search, 
  Eye, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Edit,
  Trash,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Header from '../../components/Header';
import { usePortarias } from '@/hooks/usePortarias';
import { portariaService } from '@/services/portariaService';
import { Portaria } from '@/types';

// Interface para Portaria
// interface Portaria {
//   id: number;
//   numero: string;
//   ano: string;
//   descricao: string;
//   data_portaria: string;
//   status: string;
//   servidor?: {
//     id: number;
//     nome_completo: string;
//     matricula: string;
//     cpf: string;
//   };
//   tipo_portaria?: {
//     id: number;
//     nome: string;
//   };
// }

// Remover a interface Portaria local (linhas 61-76)

// Componente de Estatísticas
interface PortariaStatsProps {
  portarias: Portaria[];
  showStats: boolean;
  setShowStats: (show: boolean) => void;
}

const PortariaStats: React.FC<PortariaStatsProps> = ({ portarias, showStats, setShowStats }) => {
  const totalPortarias = portarias.length;
  const pendentes = portarias.filter(p => p.status === 'criado').length;
  const emAndamento = portarias.filter(p => p.status === 'revisado' || p.status === 'aguardando_assinatura').length;
  const concluidas = portarias.filter(p => p.status === 'assinado' || p.status === 'publicado').length;

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Esconder estatísticas
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expandir estatísticas
            </>
          )}
        </Button>
      </div>

      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Total de Portarias</span>
              <span className="text-lg font-bold">{totalPortarias}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Pendentes</span>
              <span className="text-lg font-bold text-yellow-500">{pendentes}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Em Andamento</span>
              <span className="text-lg font-bold text-blue-500">{emAndamento}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Concluídas</span>
              <span className="text-lg font-bold text-green-500">{concluidas}</span>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Componente de Tabela de Portarias
interface PortariaTableProps {
  portarias: Portaria[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
}

const PortariaTable: React.FC<PortariaTableProps> = ({
  portarias,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portariaToDelete, setPortariaToDelete] = useState<Portaria | null>(null);
  const [tramitarDialogOpen, setTramitarDialogOpen] = useState(false);
  const [portariaToTramitar, setPortariaToTramitar] = useState<Portaria | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatStatus = (status: string) => {
    const statusMap = {
      'criado': 'Criado',
      'editado': 'Editado',
      'revisado': 'Revisado',
      'aguardando_assinatura': 'Aguardando Assinatura',
      'assinado': 'Assinado',
      'publicado': 'Publicado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'publicado': 'bg-green-500',
      'assinado': 'bg-blue-500',
      'aguardando_assinatura': 'bg-yellow-500',
      'revisado': 'bg-purple-500',
      'editado': 'bg-orange-500',
      'criado': 'bg-gray-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getTramitacaoOptions = (status: string) => {
    const optionsMap = {
      'criado': [
        { label: 'Marcar como Revisado', value: 'revisado' },
        { label: 'Enviar para Assinatura', value: 'aguardando_assinatura' }
      ],
      'revisado': [
        { label: 'Enviar para Assinatura', value: 'aguardando_assinatura' }
      ],
      'assinado': [
        { label: 'Publicar', value: 'publicado' }
      ]
    };
    return optionsMap[status] || [];
  };

  const handleVisualizarClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    navigate(`/portaria/${portaria.id}`);
  };

  const handleEditClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    navigate(`/portaria/${portaria.id}/edit`);
  };

  const handleTramitarClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    setPortariaToTramitar(portaria);
    setTramitarDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    setPortariaToDelete(portaria);
    setDeleteDialogOpen(true);
  };

  const handleConfirmTramitacao = async (novoStatus: string) => {
    if (!portariaToTramitar) return;

    setIsUpdating(true);
    try {
      await portariaService.update(portariaToTramitar.id, { status: novoStatus as any });
      onRefetch();
    } catch (error) {
      console.error('Erro ao atualizar status da portaria:', error);
      alert('Erro ao atualizar status da portaria');
    } finally {
      setIsUpdating(false);
      setTramitarDialogOpen(false);
      setPortariaToTramitar(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!portariaToDelete) return;

    try {
      await portariaService.delete(portariaToDelete.id);
      onRefetch();
    } catch (error) {
      console.error('Erro ao deletar portaria:', error);
      alert('Erro ao deletar portaria');
    } finally {
      setDeleteDialogOpen(false);
      setPortariaToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-4 py-3 text-center text-sm font-medium text-white">#</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Nome do Servidor</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Tipo de Portaria</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Data da Portaria</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {portarias.map((portaria) => (
              <tr 
                key={portaria.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/portaria/${portaria.id}`)}
              >
                <td className="px-4 py-3 text-sm text-center text-gray-900 font-medium">
                  {portaria.numero}/{portaria.ano}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {portaria.servidor?.nome_completo || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {portaria.tipo_portaria?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {new Date(portaria.data_portaria).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(portaria.status)} text-white`}
                    >
                      {formatStatus(portaria.status)}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleVisualizarClick(e, portaria)}
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Visualizar</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleEditClick(e, portaria)}
                        >
                          <Edit className="h-4 w-4 text-green-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar</p>
                      </TooltipContent>
                    </Tooltip>

                    {getTramitacaoOptions(portaria.status).length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            className="p-1 rounded hover:bg-gray-100"
                            onClick={(e) => handleTramitarClick(e, portaria)}
                          >
                            <ArrowRight className="h-4 w-4 text-orange-500" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tramitar</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleDeleteClick(e, portaria)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Dialog de Tramitação */}
      <AlertDialog open={tramitarDialogOpen} onOpenChange={setTramitarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tramitar Portaria</AlertDialogTitle>
            <AlertDialogDescription>
              Portaria {portariaToTramitar?.numero}/{portariaToTramitar?.ano} - {portariaToTramitar?.servidor?.nome_completo}
              <br />
              Status atual: <strong>{formatStatus(portariaToTramitar?.status || '')}</strong>
              <br /><br />
              Escolha a próxima ação:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {portariaToTramitar && getTramitacaoOptions(portariaToTramitar.status).map((opcao) => (
              <Button
                key={opcao.value}
                variant="outline"
                onClick={() => handleConfirmTramitacao(opcao.value)}
                disabled={isUpdating}
                className="justify-start"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  opcao.label
                )}
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a portaria {portariaToDelete?.numero}/{portariaToDelete?.ano} - {portariaToDelete?.servidor?.nome_completo || 'N/A'}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal
const Criacao = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'portarias' | 'decretos' | 'diarias'>('portarias');

  // Criar uma função wrapper para lidar com a mudança de tab
  const handleTabChange = (value: string) => {
    if (value === 'portarias' || value === 'decretos' || value === 'diarias') {
      setActiveTab(value);
    }
  };

  // Estados para seleção de ano
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  
  // Estados para o modal de criação
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('portarias');
  const [serverName, setServerName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  
  // Hook para carregar portarias
  const { portarias, loading, error, refetch } = usePortarias();
  
  // Função para mudança de ano
  const handleYearChange = () => {
    setCurrentYear(selectedYear);
    setIsYearDialogOpen(false);
  };
  
  // Dados mock para outras abas
  const decretos = [];
  const diarias = [];

  // Filtrar portarias baseado no termo de busca
  const filteredPortarias = portarias.filter(portaria =>
    portaria.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portaria.servidor?.nome_completo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portaria.tipo_portaria?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portaria.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginação
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPortarias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPortarias = filteredPortarias.slice(startIndex, startIndex + itemsPerPage);

  // Funções auxiliares para os botões
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
    setDocumentType('portarias');
    setServerName('');
    setDocumentNumber('');
    setDocumentDate('');
    setIsDialogOpen(false);
    
    // Recarregar a lista após adicionar
    refetch();
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

  // Reset da página quando mudar a busca
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch}>Tentar Novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Documentos / Criação" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PortariaStats 
          portarias={portarias}
          showStats={showStats}
          setShowStats={setShowStats}
        />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-3 w-auto">
              <TabsTrigger value="portarias" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Portarias
                <Badge variant="secondary" className="ml-1">
                  {filteredPortarias.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="decretos" className="flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                Decretos
                <Badge variant="secondary" className="ml-1">
                  {decretos.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="diarias" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Diárias
                <Badge variant="secondary" className="ml-1">
                  {diarias.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar por número, servidor, tipo ou status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              
              <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {currentYear}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Selecionar Ano</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="year-select">Ano</Label>
                      <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                          <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsYearDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleYearChange}>
                      Carregar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="portarias" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Portarias</h2>
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setDocumentType('portarias')}
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
                  {getButtonName('portarias')}
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
            </div>
            <PortariaTable 
              portarias={currentPortarias}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              onRefetch={refetch}
            />
          </TabsContent>
          
          <TabsContent value="decretos" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Decretos</h2>
              <div className="text-sm text-gray-500">Em desenvolvimento...</div>
            </div>
          </TabsContent>
          
          <TabsContent value="diarias" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Diárias</h2>
              <div className="text-sm text-gray-500">Em desenvolvimento...</div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Criacao;
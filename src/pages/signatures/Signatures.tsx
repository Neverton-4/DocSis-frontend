import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileSignature, Eye, FileText, Gavel, Car, Bell, Calendar } from 'lucide-react';
import { usePortarias } from '@/hooks/usePortarias';
import { useAssinaturas } from '@/hooks/useAssinaturas';
import { useAuth } from '@/contexts/AuthContext';
import { Portaria } from '@/types';
import { portariaService, PrepararAssinaturaResponse } from '@/services/portariaService';
import { AssinaturaPortaria } from '@/services/assinaturaService';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { CertificateSelector } from '@/components/CertificateSelector';
import { digitalSignature, CertificateInfo } from '@/utils/digitalSignature';
import { TELAS } from '@/constants/telas';

// Dados mock para decretos e diárias (até serem integrados)
const mockDecretos = [
  {
    id: 1,
    number: '004/2024',
    server: 'João Silva',
    title: 'Designação de Comissão',
    date: '18/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Secretário']
  }
];

const mockDiarias = [
  {
    id: 1,
    number: '006/2024',
    server: 'Pedro Costa',
    title: 'Viagem Oficial a Campo Grande',
    date: '20/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  }
];

export const Signatures = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('portarias');
  const [currentYear, setCurrentYear] = useState('2025');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Integração com dados reais das portarias
  const { portarias, loading, error, fetchByStatus } = usePortarias();
  const { fetchByPortaria } = useAssinaturas();
  const { user, podeAssinar, temPermissao, getNomePermissao } = useAuth();
  const [pendingPortarias, setPendingPortarias] = useState<Portaria[]>([]);
  const [portariasSignatures, setPortariasSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});
  const [isSigningDocument, setIsSigningDocument] = useState(false);


  // Adicionar após os outros estados (por volta da linha 50)
const [isBatchSignDialogOpen, setIsBatchSignDialogOpen] = useState(false);
const [selectedPortariasForBatch, setSelectedPortariasForBatch] = useState<number[]>([]);
const [selectAllPortarias, setSelectAllPortarias] = useState(false);
  // Buscar portarias com status 'aguardando_assinatura'
  useEffect(() => {
    const loadPendingPortarias = async () => {
      try {
        await fetchByStatus('aguardando_assinatura');
      } catch (err) {
        console.error('Erro ao carregar portarias pendentes:', err);
      }
    };
    
    loadPendingPortarias();
  }, []);

  // Atualizar portarias pendentes quando os dados chegarem
  useEffect(() => {
    setPendingPortarias(portarias.filter(p => p.status === 'aguardando_assinatura'));
  }, [portarias]);

  // Buscar assinaturas para cada portaria
  useEffect(() => {
    const loadSignatures = async () => {
      if (pendingPortarias.length === 0) return;
      
      const signaturesMap: Record<number, AssinaturaPortaria[]> = {};
      
      for (const portaria of pendingPortarias) {
        try {
          const signatures = await fetchByPortaria(portaria.id);
          signaturesMap[portaria.id] = signatures;
        } catch (err) {
          console.error(`Erro ao carregar assinaturas da portaria ${portaria.id}:`, err);
          signaturesMap[portaria.id] = [];
        }
      }
      
      setPortariasSignatures(signaturesMap);
    };
    
    loadSignatures();
  }, [pendingPortarias, fetchByPortaria]);


  const handleYearChange = () => {
    setCurrentYear(selectedYear);
    setIsYearDialogOpen(false);
  };
  
  // Função para verificar se uma assinatura específica está completa
  const isSignatureCompleted = (portariaId: number, tipoAssinatura: string): boolean => {
    const signatures = portariasSignatures[portariaId] || [];
    const tipoMap: Record<string, string> = {
      'Secretário': 'secretario',
      'Prefeito': 'prefeito'
    };
    
    const tipoNormalizado = tipoMap[tipoAssinatura] || tipoAssinatura.toLowerCase();
    return signatures.some(sig => 
      sig.tipo.toLowerCase() === tipoNormalizado && 
      sig.status === 'assinada'
    );
  };

  // Filtrar documentos baseado na aba ativa e busca
  const getFilteredDocuments = () => {
    let documents: any[] = [];
    
    switch (activeTab) {
      case 'portarias':
        documents = pendingPortarias.map(p => {
          const signatures = portariasSignatures[p.id] || [];
          const completedSignatures = ['Secretário', 'Prefeito'].filter(tipo => 
            isSignatureCompleted(p.id, tipo)
          );
          
          return {
            id: p.id,
            number: `${p.numero}/${p.ano}`,
            type: 'portarias',
            server: p.servidor?.nome_completo || 'Não informado',
            title: `${p.tipo_portaria?.nome || 'Tipo não informado'}${p.subtipo_portaria ? ` - ${p.subtipo_portaria.nome}` : ''}`,
            date: new Date(p.data_portaria).toLocaleDateString('pt-BR'),
            requiredSignatures: ['Secretário', 'Prefeito'],
            completedSignatures,
            originalData: p
          };
        });
        break;
      case 'decretos':
        documents = mockDecretos.map(d => ({ ...d, type: 'decretos' }));
        break;
      case 'diarias':
        documents = mockDiarias.map(d => ({ ...d, type: 'diarias' }));
        break;
    }

    if (!searchTerm) return documents;
    
    const searchLower = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.number.toLowerCase().includes(searchLower) ||
      doc.server.toLowerCase().includes(searchLower) ||
      doc.title.toLowerCase().includes(searchLower)
    );
  };

  const filteredDocuments = getFilteredDocuments();

  // Contar documentos por tipo
  const getDocumentCount = (type: string) => {
    switch (type) {
      case 'portarias':
        return pendingPortarias.length;
      case 'decretos':
        return mockDecretos.length;
      case 'diarias':
        return mockDiarias.length;
      default:
        return 0;
    }
  };

  const handleViewDocument = (doc: any) => {
    if (activeTab === 'portarias') {
      navigate(`/document-viewer/${doc.id}`);
    } else {
      // Para decretos e diárias, implementar navegação futura
      navigate(`/document-viewer/${doc.id}`);
    }
  };

  const [assinaturaData, setAssinaturaData] = useState<PrepararAssinaturaResponse | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCertificateSelector, setShowCertificateSelector] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateInfo | null>(null);
  const [isProcessingSignature, setIsProcessingSignature] = useState(false);

  const handleSignDocument = async (doc: any, tipoAssinatura?: string) => {
    if (!tipoAssinatura) {
      console.log(`Assinar ${activeTab}:`, doc.id);
      return;
    }

    setIsSigningDocument(true);
    
    try {
      if (tipoAssinatura === 'Prefeito') {
        // Extrair número e ano da portaria
        const numeroPortaria = doc.originalData.numero;
        const anoPortaria = doc.originalData.ano.toString();
        
        // Usar a nova API com número e ano
        const assinaturaInfo = await portariaService.assinarPrefeitoPorNumeroAno(numeroPortaria, anoPortaria) as PrepararAssinaturaResponse;
        
        if (assinaturaInfo.success) {
          setAssinaturaData({
            ...assinaturaInfo,
            numero_portaria: numeroPortaria,
            ano_portaria: anoPortaria
          });
          
          // Buscar o PDF para assinatura usando a API existente
          const pdfData = await portariaService.prepararAssinaturaPrefeito(doc.id, true) as Blob;
          setPdfBlob(pdfData);
          
          // Mostrar seletor de certificados
          setShowCertificateSelector(true);
          
        } else {
          throw new Error(assinaturaInfo.message || "Erro ao preparar assinatura");
        }
      } else if (tipoAssinatura === 'Secretário') {
        const response = await portariaService.assinarSecretario(doc.id);
        toast({
          title: "Sucesso",
          description: "Documento assinado como Secretário com sucesso!",
          variant: "default"
        });
        
        // Recarregar as portarias e assinaturas após a assinatura
        await fetchByStatus('aguardando_assinatura');
        
        // Recarregar as assinaturas da portaria específica
        const updatedSignatures = await fetchByPortaria(doc.id);
        setPortariasSignatures(prev => ({
          ...prev,
          [doc.id]: updatedSignatures
        }));
      }
      
    } catch (error: any) {
      console.error('Erro ao assinar documento:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || error.message || "Erro ao assinar documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSigningDocument(false);
    }
  };

  // Função chamada quando certificado é selecionado
  const handleCertificateSelected = async (certificate: CertificateInfo) => {
    setSelectedCertificate(certificate);
    setShowCertificateSelector(false);
    setShowSignatureModal(true);
  };

  // Função para processar a assinatura digital
  const processDigitalSignature = async () => {
    if (!assinaturaData || !pdfBlob || !selectedCertificate) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para processar a assinatura.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingSignature(true);
    
    try {
      // Converter Blob para ArrayBuffer
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      
      // Preparar informações da assinatura
      const signatureInfo = {
        reason: 'Assinatura Digital do Prefeito',
        location: 'Sistema de Protocolos',
        contactInfo: assinaturaData.assinatura_info?.nome_assinante || '',
        fieldName: assinaturaData.field_name,
        pageNumber: assinaturaData.assinatura_info?.pagina || 1,
        coordinates: assinaturaData.assinatura_info?.coordenadas
      };
      
      // Realizar assinatura digital
      const signatureResult = await digitalSignature.signPDF(
        pdfArrayBuffer,
        selectedCertificate.thumbprint,
        signatureInfo
      );
      
      if (signatureResult.success && signatureResult.signedData) {
        // Usar a nova API de callback com número e ano
        const response = await portariaService.callbackAssinatura(
          assinaturaData.numero_portaria,
          assinaturaData.ano_portaria,
          signatureResult.signedData,
          {
            certificate: signatureResult.certificate,
            signature_info: assinaturaData.assinatura_info
          }
        );
        
        toast({
          title: "Sucesso",
          description: "Documento assinado digitalmente com sucesso!",
          variant: "default"
        });
        
        // Recarregar as portarias e assinaturas
        await fetchByStatus('aguardando_assinatura');
        
        const updatedSignatures = await fetchByPortaria(assinaturaData.portaria_id);
        setPortariasSignatures(prev => ({
          ...prev,
          [assinaturaData.portaria_id]: updatedSignatures
        }));
        
        // Limpar dados e fechar modal
        closeSignatureModal();
        
      } else {
        throw new Error(signatureResult.error || 'Erro na assinatura digital');
      }
      
    } catch (error: any) {
      console.error('Erro ao processar assinatura digital:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar assinatura digital. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingSignature(false);
    }
  };

  // Função para fechar modal de assinatura
  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setAssinaturaData(null);
    setPdfBlob(null);
    setSelectedCertificate(null);
  };

  // Função para renderizar botões de assinatura baseados nas permissões e tela
  const renderSignatureButtons = (doc: any) => {
    const { podeAssinarComo, getAssinantesPorTela } = useAuth();
    
    // Filtrar assinantes apenas da tela de assinaturas
    const assinantesAssinaturas = getAssinantesPorTela(TELAS.ASSINATURAS);
    
    if (!assinantesAssinaturas || assinantesAssinaturas.length === 0) {
      return null;
    }
  
    // Função para capitalizar a primeira letra
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
  
    return (
      <div className="flex gap-2">
        {assinantesAssinaturas.map((assinante) => {
          const podeAssinar = podeAssinarComo(assinante.tipo as 'prefeito' | 'secretario' | 'procurador' | 'controlador');
          
          if (!podeAssinar) return null;
          
          // Verificar se a assinatura já foi realizada
          const tipoCapitalizado = capitalizeFirstLetter(assinante.tipo);
          const jaAssinado = isSignatureCompleted(doc.id, tipoCapitalizado);
          
          // Se já foi assinado, não mostrar o botão
          if (jaAssinado) return null;
          
          return (
            <Button
              key={assinante.id}
              onClick={() => handleSignDocument(doc, tipoCapitalizado)}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              disabled={isSigningDocument}
            >
              {isSigningDocument ? 'Assinando...' : `Assinar ${tipoCapitalizado}`}
            </Button>
          );
        })}
      </div>
    );
  };

  if (loading && activeTab === 'portarias') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentos pendentes...</p>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'portarias') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName={user?.nome || "Usuário"} 
        userRole={user?.cargo || "Usuário"} 
        breadcrumb="Documentos / Assinaturas Pendentes" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-3 w-auto">
              <TabsTrigger value="portarias" className="flex items-center gap-2 relative">
                <FileText className="w-4 h-4" />
                Portarias
                {getDocumentCount('portarias') > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    <Bell className="w-3 h-3" />
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger value="decretos" className="flex items-center gap-2 relative">
                <Gavel className="w-4 h-4" />
                Decretos
                {getDocumentCount('decretos') > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    <Bell className="w-3 h-3" />
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger value="diarias" className="flex items-center gap-2 relative">
                <Car className="w-4 h-4" />
                Diárias
                {getDocumentCount('diarias') > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    <Bell className="w-3 h-3" />
                  </div>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar documentos pendentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              
              <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentYear}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Selecionar Ano dos Documentos</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="year" className="text-right">
                        Ano:
                      </label>
                      <div className="col-span-3">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                  </div>
                  <DialogFooter>
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
            <Card>
              <CardHeader>
                <CardTitle>Portarias Aguardando Assinatura ({filteredDocuments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhuma portaria encontrada com os critérios de busca.' : 'Não há portarias aguardando assinatura.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{doc.number}</span>
                            <Badge className="bg-orange-100 text-orange-800">Aguardando Assinatura</Badge>
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                          <div className="text-sm text-gray-600 mb-2">
                            <span>Servidor: {doc.server}</span> • <span>Data: {doc.date}</span>
                          </div>
                          <div className="flex gap-2">
                            {doc.requiredSignatures.map((signature: string) => (
                              <Badge
                                key={signature}
                                className={
                                  doc.completedSignatures.includes(signature)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {signature} {doc.completedSignatures.includes(signature) ? '✓' : '○'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          {renderSignatureButtons(doc)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decretos" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Decretos Aguardando Assinatura ({filteredDocuments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhum decreto encontrado com os critérios de busca.' : 'Não há decretos aguardando assinatura.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{doc.number}</span>
                            <Badge className="bg-orange-100 text-orange-800">Aguardando Assinatura</Badge>
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                          <div className="text-sm text-gray-600 mb-2">
                            <span>Servidor: {doc.server}</span> • <span>Data: {doc.date}</span>
                          </div>
                          <div className="flex gap-2">
                            {doc.requiredSignatures.map((signature: string) => (
                              <Badge
                                key={signature}
                                className={
                                  doc.completedSignatures.includes(signature)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {signature} {doc.completedSignatures.includes(signature) ? '✓' : '○'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSignDocument(doc)}>
                            <FileSignature className="w-4 h-4 mr-1" />
                            Assinar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diarias" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Diárias Aguardando Assinatura ({filteredDocuments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'Nenhuma diária encontrada com os critérios de busca.' : 'Não há diárias aguardando assinatura.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{doc.number}</span>
                            <Badge className="bg-orange-100 text-orange-800">Aguardando Assinatura</Badge>
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                          <div className="text-sm text-gray-600 mb-2">
                            <span>Servidor: {doc.server}</span> • <span>Data: {doc.date}</span>
                          </div>
                          <div className="flex gap-2">
                            {doc.requiredSignatures.map((signature: string) => (
                              <Badge
                                key={signature}
                                className={
                                  doc.completedSignatures.includes(signature)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {signature} {doc.completedSignatures.includes(signature) ? '✓' : '○'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleSignDocument(doc)}>
                            <FileSignature className="w-4 h-4 mr-1" />
                            Assinar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Seletor de Certificados */}
      {showCertificateSelector && (
        <CertificateSelector
          isVisible={showCertificateSelector}
          onCancel={() => setShowCertificateSelector(false)}
          onCertificateSelected={handleCertificateSelected}
        />
      )}
      
      {/* Modal de Assinatura */}
      {showSignatureModal && assinaturaData && pdfBlob && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirmar Assinatura Digital</h2>
              <Button variant="outline" onClick={closeSignatureModal}>
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações da Assinatura */}
              <div>
                <h3 className="font-semibold mb-3">Informações da Assinatura</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Documento:</strong> Portaria #{assinaturaData.portaria_id}</p>
                  <p><strong>Assinante:</strong> {assinaturaData.assinatura_info?.nome_assinante}</p>
                  <p><strong>Cargo:</strong> {assinaturaData.assinatura_info?.cargo_assinante}</p>
                  <p><strong>Certificado:</strong> {selectedCertificate.subjectName}</p>
                  <p><strong>Válido até:</strong> {new Date(selectedCertificate.validTo).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={processDigitalSignature}
                    disabled={isProcessingSignature}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessingSignature ? 'Processando...' : 'Confirmar Assinatura'}
                  </Button>
                  <Button variant="outline" onClick={closeSignatureModal}>
                    Cancelar
                  </Button>
                </div>
              </div>
              
              {/* Preview do PDF */}
              <div>
                <h3 className="font-semibold mb-3">Preview do Documento</h3>
                <div className="border rounded-lg overflow-hidden" style={{height: '400px'}}>
                  <iframe
                    src={URL.createObjectURL(pdfBlob)}
                    className="w-full h-full"
                    title="Preview do PDF"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signatures;


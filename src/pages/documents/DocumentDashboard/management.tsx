import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

import Header from '@/components/layout/Header';
import { SearchAndFilter } from '@/components/shared';
import { YearSelector } from '@/components/shared';
import { DocumentUploadDialog } from '@components/shared';
import { DocumentTable } from './components/DocumentTable';
import { DecretoTable } from './components/DecretoTable';
import { DiariaTable } from './components/DiariaTable';
import { LeiTable } from './components/LeiTable';
import { EditalTable } from './components/EditalTable';
import { OutroTable } from './components/OutroTable';
import { useDocumentManagement } from './hooks';
import { NumeracaoDialog } from '@/components/NumeracaoDialog';
import { NumeracaoDocumento } from '@/services/numeracaoService';
import { PermissionService } from '@/lib/PermissionService';
import { tipoDocumentoService, TipoDocumento } from '@/services/tipoDocumentoService';
import api from '@/config/api';

// Componente principal
const Criacao = () => {
  const navigate = useNavigate();
  const [isNumeracaoDialogOpen, setIsNumeracaoDialogOpen] = useState(false);
  const [tiposDisponiveis, setTiposDisponiveis] = useState<string[]>([]);
  const tabConfigs = useMemo(() => ([
    { key: 'portarias', label: 'Portarias', codes: ['portarias'] },
    { key: 'decretos', label: 'Decretos', codes: ['decretos'] },
    { key: 'diarias', label: 'Diárias', codes: ['diarias'] },
    { key: 'leis', label: 'Leis', codes: ['leis'] },
    { key: 'editais', label: 'Editais', codes: ['editais'] },
    { key: 'outros', label: 'Outros', codes: ['outros'] },
  ]), []);
  useEffect(() => {
    let mounted = true;
    tipoDocumentoService.listarTiposDocumentos().then((lista: TipoDocumento[]) => {
      if (!mounted) return;
      const nomesRaw = Array.isArray(lista) ? lista.map((t) => t.nome).filter((n) => typeof n === 'string') : [];
      const nomes = nomesRaw.map((n) => {
        const s = n.trim();
        if (s.toLowerCase() === 'portaria' || s.toLowerCase() === 'portarias') return 'Portarias';
        if (s.toLowerCase() === 'decreto' || s.toLowerCase() === 'decretos') return 'Decretos';
        if (s.toLowerCase() === 'diaria' || s.toLowerCase() === 'diária' || s.toLowerCase() === 'diarias' || s.toLowerCase() === 'diárias') return 'Diárias';
        if (s.toLowerCase() === 'lei' || s.toLowerCase() === 'leis') return 'Leis';
        if (s.toLowerCase() === 'edital' || s.toLowerCase() === 'editais') return 'Editais';
        if (s.toLowerCase() === 'outro' || s.toLowerCase() === 'outros') return 'Outros';
        return s;
      });
      setTiposDisponiveis(nomes);
      const permissoesAtivas = tabConfigs.flatMap((cfg) => cfg.codes.filter((code) => PermissionService.has(code, 2)));
      console.debug('[DocDashboard] tipos_documentos:', nomes);
      console.debug('[DocDashboard] permissoes_ativas:', permissoesAtivas);
    }).catch(() => {
      if (!mounted) return;
      setTiposDisponiveis([]);
    });
    api.get('/auth/me').then((resp) => {
      console.log('[Auth ME]', resp.data);
    }).catch(() => {});
    return () => { mounted = false };
  }, [tabConfigs]);
  const allowedTabs = useMemo(() => {
    return tabConfigs.filter((cfg) => {
      const hasPerm = cfg.codes.some((code) => PermissionService.has(code, 2));
      const existsTipo = tiposDisponiveis.includes(cfg.label);
      const ok = hasPerm && existsTipo;
      if (!ok) {
        console.debug('[DocDashboard] filtro_tab', { label: cfg.label, hasPerm, existsTipo });
      }
      return ok;
    });
  }, [tabConfigs, tiposDisponiveis]);
  const {
    // Search and filter states
    searchQuery,
    setSearchQuery,
    
    // Tab states
    activeTab,
    handleTabChange,
    
    // Year states
    currentYear,
    selectedYear,
    setSelectedYear,
    isYearDialogOpen,
    setIsYearDialogOpen,
    handleYearChange,
    
    // Document upload states
    isDialogOpen,
    setIsDialogOpen,
    documentFile,
    setDocumentFile,
    documentType,
    setDocumentType,
    serverName,
    setServerName,
    documentNumber,
    setDocumentNumber,
    documentDate,
    setDocumentDate,
    handleSubmitDocument,
    

    
    // Pagination states
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Data states
    portarias,
    filteredPortarias,
    currentPortarias,
    loading,
    error,
    refetch,

    // Decretos states
    decretos,
    filteredDecretos,
    currentDecretos,
    totalPagesDecretos,
    refetchDecretos,

    // Diárias states
    diarias,
    filteredDiarias,
    currentDiarias,
    totalPagesDiarias,
    refetchDiarias
  } = useDocumentManagement();

  useEffect(() => {
    const keys = allowedTabs.map(t => t.key);
    if (keys.length === 0) return;
    if (!keys.includes(activeTab)) {
      handleTabChange(keys[0] as any);
    }
  }, [allowedTabs, activeTab, handleTabChange]);

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
            <Button onClick={() => refetch(currentYear)}>Tentar Novamente</Button>
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
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {allowedTabs.length === 0 && (
              <span className="text-sm text-gray-600">Nenhuma aba disponível</span>
            )}
            {allowedTabs.map((cfg) => {
              const countLabel = cfg.key === 'portarias' ? filteredPortarias.length : cfg.key === 'decretos' ? (filteredDecretos?.length || 0) : cfg.key === 'diarias' ? (filteredDiarias?.length || 0) : cfg.key === 'leis' ? 0 : cfg.key === 'editais' ? 0 : 0;
              return (
                <button
                  key={cfg.key}
                  onClick={() => handleTabChange(cfg.key as any)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === cfg.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cfg.label} ({countLabel})
                </button>
              );
            })}
          </div>
          
          {/* Pesquisa e Ano do lado direito */}
          <div className="flex items-center gap-4">
            <SearchAndFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        
        {/* Conteúdo baseado na aba ativa */}
        <div>
          {activeTab === 'portarias' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Portarias</h2>
                <div className="flex gap-2">
                  <DocumentUploadDialog
                    isDialogOpen={isDialogOpen}
                    setIsDialogOpen={setIsDialogOpen}
                    documentFile={documentFile}
                    setDocumentFile={setDocumentFile}
                    documentType={documentType}
                    setDocumentType={setDocumentType}
                    serverName={serverName}
                    setServerName={setServerName}
                    documentNumber={documentNumber}
                    setDocumentNumber={setDocumentNumber}
                    documentDate={documentDate}
                    setDocumentDate={setDocumentDate}
                    onSubmit={handleSubmitDocument}
                    getSingularName={(type) => type === 'portarias' ? 'Portaria' : 'Documento'}
                  />
                  
                  <Button 
                    onClick={() => navigate('/create-document?tab=portarias')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Adicionar Portaria
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/create-document')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Nova Portaria
                  </Button>
                  
                  <Button
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Números
                  </Button>
                  
                  <YearSelector
                    currentYear={currentYear}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    isYearDialogOpen={isYearDialogOpen}
                    setIsYearDialogOpen={setIsYearDialogOpen}
                    onYearChange={handleYearChange}
                  />
                </div>
              </div>
              <DocumentTable 
                portarias={currentPortarias}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                onRefetch={refetch}
              />
            </div>
          )}
          
          {activeTab === 'decretos' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Decretos</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/create-document?tab=decretos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Adicionar Decreto
                  </Button>
                  <Button 
                    onClick={() => navigate('/create-document?tab=decretos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Novo Decreto
                  </Button>
                  <Button
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Números
                  </Button>
                  <YearSelector
                    currentYear={currentYear}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    isYearDialogOpen={isYearDialogOpen}
                    setIsYearDialogOpen={setIsYearDialogOpen}
                    onYearChange={handleYearChange}
                  />
                </div>
              </div>
              <DecretoTable 
                decretos={currentDecretos}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPagesDecretos}
                onRefetch={refetchDecretos}
              />
            </div>
          )}
          
          {activeTab === 'diarias' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Diárias</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/create-document?tab=diarias')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Adicionar Diária
                  </Button>
                  <Button 
                    onClick={() => navigate('/create-document?tab=diarias')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Nova Diária
                  </Button>
                  <Button 
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Números
                  </Button>
                  <YearSelector
                    currentYear={currentYear}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    isYearDialogOpen={isYearDialogOpen}
                    setIsYearDialogOpen={setIsYearDialogOpen}
                    onYearChange={handleYearChange}
                  />
                </div>
              </div>
              <DiariaTable 
                diarias={currentDiarias}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPagesDiarias}
                onRefetch={() => refetchDiarias(currentYear)}
              />
            </div>
          )}
          
          {activeTab === 'leis' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Leis</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/create-document?tab=leis')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Adicionar Lei
                  </Button>
                  <Button 
                    onClick={() => navigate('/create-document?tab=leis')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Nova Lei
                  </Button>
                  <Button
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Números
                  </Button>
                  <YearSelector
                    currentYear={currentYear}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    isYearDialogOpen={isYearDialogOpen}
                    setIsYearDialogOpen={setIsYearDialogOpen}
                    onYearChange={handleYearChange}
                  />
                </div>
              </div>
              <LeiTable 
                leis={[]}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={1}
                onRefetch={() => refetch(currentYear)}
              />
            </div>
          )}
          
          {activeTab === 'editais' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Editais</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/create-document?tab=editais')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Adicionar Edital
                  </Button>
                  <Button 
                    onClick={() => navigate('/create-document?tab=editais')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Novo Edital
                  </Button>
                  <Button 
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Selecionar Numerações
                  </Button>
                  <Button 
                    onClick={() => refetch(currentYear)}
                    variant="outline"
                    size="sm"
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
              <EditalTable 
                editais={[]}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={1}
                onRefetch={() => refetch(currentYear)}
              />
            </div>
          )}
          
          {activeTab === 'outros' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Outros Documentos</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate('/create-document?tab=outros')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Adicionar Documento
                  </Button>
                  <Button 
                    onClick={() => navigate('/create-document?tab=outros')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Novo Documento
                  </Button>
                  <Button 
                    onClick={() => setIsNumeracaoDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Selecionar Numerações
                  </Button>
                  <Button 
                    onClick={() => refetch(currentYear)}
                    variant="outline"
                    size="sm"
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
              <OutroTable 
                outros={[]}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={1}
                onRefetch={() => refetch(currentYear)}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo de Seleção de Numerações */}
      <NumeracaoDialog
        open={isNumeracaoDialogOpen}
        onOpenChange={setIsNumeracaoDialogOpen}
        onSelect={(numeracao: NumeracaoDocumento) => {
          // Lógica para aplicar a numeração selecionada
        }}
        ano={selectedYear}
        documentType={activeTab}
      />
    </div>
  );
};

export default Criacao;
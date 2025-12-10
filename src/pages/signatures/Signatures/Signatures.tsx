import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import {
  SearchAndFilter,
  DocumentTabs,
  BatchSignDialog
} from './components';
import { useDocumentManagement } from './hooks';
import api from '@/config/api';
import { assinaturaService } from '@/services/assinaturaService';
import { assinaturaDecretoService } from '@/services/assinaturaDecretoService';
import { assinaturaDiariaService } from '@/services/assinaturaDiariaService';
import { useToast } from '@/hooks/use-toast';
import { PermissionService } from '@/lib/PermissionService';
import { tipoDocumentoService, TipoDocumento } from '@/services/tipoDocumentoService';

export const Signatures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [signBlocking, setSignBlocking] = useState<boolean>(false);
  const [signProgressText, setSignProgressText] = useState<string>('');
  const [signProgressStep, setSignProgressStep] = useState<number>(0);
  const [signProgressTotal, setSignProgressTotal] = useState<number>(0);
  const [signCompleted, setSignCompleted] = useState<boolean>(false);
  
  const {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentYear,
    setCurrentYear,
    pendingDocumentos,
    loading,
    error,
    getFilteredDocuments,
    getDocumentCount,
    isSignatureCompleted,
    updateDocumentoSignatures,
    selectedDocuments,
    selectAllDocuments,
    isBatchSignDialogOpen,
    toggleDocumentSelection,
    toggleSelectAllDocuments,
    openBatchSignDialog,
    closeBatchSignDialog,
    clearSelection,
    pendingPortarias,
    portariasSignatures,
    refreshData,
    refreshActiveTabData
  } = useDocumentManagement();

  const categoryOrder = ['Portarias','Decretos','Diárias','Leis','Editais','Pareceres','Oficios','Memorandos','Outros'];
  const labelToKey: Record<string, string> = {
    Portarias: 'portarias',
    Decretos: 'decretos',
    Diárias: 'diarias',
    Diarias: 'diarias',
    Leis: 'leis',
    Editais: 'editais',
    Pareceres: 'pareceres',
    Oficios: 'oficios',
    Memorandos: 'memorandos',
    Outros: 'outros',
  };

  const [tiposDisponiveis, setTiposDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    tipoDocumentoService.listarTiposDocumentos().then((lista: TipoDocumento[]) => {
      if (!mounted) return;
      const nomesRaw = Array.isArray(lista) ? lista.map((t) => t.nome).filter((n) => typeof n === 'string') : [];
      const nomes = nomesRaw.map((n) => {
        const s = (n || '').trim();
        const l = s.toLowerCase();
        if (l === 'portaria' || l === 'portarias') return 'Portarias';
        if (l === 'decreto' || l === 'decretos') return 'Decretos';
        if (l === 'diaria' || l === 'diárias' || l === 'diarias' || l === 'diária') return 'Diárias';
        if (l === 'lei' || l === 'leis') return 'Leis';
        if (l === 'edital' || l === 'editais') return 'Editais';
        if (l === 'parecer' || l === 'pareceres') return 'Pareceres';
        if (l === 'oficio' || l === 'oficios' || l === 'ofícios') return 'Oficios';
        if (l === 'memorando' || l === 'memorandos') return 'Memorandos';
        if (l === 'outro' || l === 'outros') return 'Outros';
        return s;
      });
      setTiposDisponiveis(nomes);
      const cfgCodes = ['assinar_portarias','assinar_decretos','assinar_diarias','assinar_leis','assinar_editais','assinar_pareceres','assinar_oficios','assinar_memorandos','assinar_outros'];
      const permissoesAtivas = cfgCodes.filter((code) => PermissionService.has(code, 3));
      console.debug('[Signatures] tipos_documentos:', nomes);
      console.debug('[Signatures] permissoes_ativas:', permissoesAtivas);
    }).catch(() => {
      if (!mounted) return;
      setTiposDisponiveis([]);
    });
    api.get('/auth/me').then((resp) => {
      console.log('[Auth ME]', resp.data);
    }).catch(() => {});
    return () => { mounted = false };
  }, [user]);

  const availableCategories = useMemo(() => {
    const cfg = [
      { label: 'Portarias', codes: ['assinar_portarias'] },
      { label: 'Decretos', codes: ['assinar_decretos'] },
      { label: 'Diárias', codes: ['assinar_diarias'] },
      { label: 'Leis', codes: ['assinar_leis'] },
      { label: 'Editais', codes: ['assinar_editais'] },
      { label: 'Pareceres', codes: ['assinar_pareceres'] },
      { label: 'Oficios', codes: ['assinar_oficios'] },
      { label: 'Memorandos', codes: ['assinar_memorandos'] },
      { label: 'Outros', codes: ['assinar_outros'] },
    ];
    const allowed = cfg.filter((c) => {
      const hasPerm = c.codes.some((code) => PermissionService.has(code, 3));
      const existsTipo = tiposDisponiveis.includes(c.label);
      const ok = hasPerm && existsTipo;
      if (!ok) {
        console.debug('[Signatures] filtro_categoria', { label: c.label, hasPerm, existsTipo });
      }
      return ok;
    }).map((c) => c.label);
    return allowed;
  }, [user, tiposDisponiveis]);

  const availableKeys = useMemo(() => availableCategories.map((c) => labelToKey[c] || c.toLowerCase()), [availableCategories]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (availableKeys.length === 0) return;
    if (tabFromUrl && availableKeys.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      return;
    }
    if (!availableKeys.includes(activeTab)) {
      setActiveTab(availableKeys[0]);
    }
  }, [searchParams, activeTab, setActiveTab, availableKeys]);

  const handleTabChange = (tab: string) => {
    try {
      setActiveTab(tab);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', tab);
      setSearchParams(newParams);
    } catch (e) {
    }
  };
  
  const navigate = useNavigate();
  const isSigningDocument = signBlocking;
  const handleViewDocument = (doc: any) => {
    let tipoDocumento = 'portaria';
    if (activeTab === 'decretos') {
      tipoDocumento = 'decreto';
    } else if (activeTab === 'diarias') {
      tipoDocumento = 'diaria';
    } else if (activeTab === 'portarias') {
      tipoDocumento = 'portaria';
    }
    navigate(`/document-viewer/${tipoDocumento}/${doc.id}`);
  };

  const filteredDocuments = getFilteredDocuments();
  const selectionStorageKey = useMemo(() => `signatures:selected:${activeTab}:${currentYear}`, [activeTab, currentYear]);

  useEffect(() => {
    try {
      const persisted = (typeof window !== 'undefined') ? localStorage.getItem(selectionStorageKey) : null;
      if (persisted) {
        const ids: number[] = JSON.parse(persisted);
        if (Array.isArray(ids)) {
          ids.forEach((id) => {
            const isVisible = filteredDocuments.some((d: any) => d?.id === id);
            if (isVisible && !selectedDocuments.includes(id)) {
              toggleDocumentSelection(id);
            }
          });
        }
      }
    } catch (e) {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionStorageKey]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(selectionStorageKey, JSON.stringify(selectedDocuments));
      }
    } catch {}
  }, [selectedDocuments, selectionStorageKey]);

  useEffect(() => {
    try {
      const visibleIds = new Set(filteredDocuments.map((d: any) => d?.id));
      const pruned = selectedDocuments.filter((id) => visibleIds.has(id));
      if (pruned.length !== selectedDocuments.length) {
        clearSelection();
        pruned.forEach((id) => toggleDocumentSelection(id));
        if (typeof window !== 'undefined') {
          localStorage.setItem(selectionStorageKey, JSON.stringify(pruned));
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDocuments]);

  const checkHostStatus = async (): Promise<boolean> => {
    const urls = [
      'http://127.0.0.1:5100/local/status',
      'http://127.0.0.1:5100/local/sign',
      'http://127.0.0.1:5100/local/sign-batch'
    ];
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 3000);
        const resp = await fetch(url, { method: 'OPTIONS', signal: controller.signal });
        clearTimeout(t);
        if (resp && typeof resp.status === 'number') {
          return true;
        }
      } catch {}
    }
    return false;
  };

  const handleSignDocument = async (doc: any, tipoAssinatura?: string) => {
    const isPortaria = (doc?.type?.toLowerCase?.() === 'portarias') || (doc?.originalData !== undefined);
    const isDecreto = doc?.type?.toLowerCase?.() === 'decretos';
    const isDiaria = doc?.type?.toLowerCase?.() === 'diarias';
    const tipoMap: Record<string, string> = { 'Prefeito': 'prefeito', 'Secretário': 'secretario' };
    const tipoAssinante = tipoMap[tipoAssinatura || ''] || (tipoAssinatura || '').toLowerCase();

    if ((isPortaria || isDecreto || isDiaria) && tipoAssinante) {
      try {
        setSignBlocking(true);
        setSignProgressText('Verificando host de assinatura...');
        setSignProgressStep(1);
        setSignProgressTotal(4);
        const hostOkPre = await checkHostStatus();
        if (!hostOkPre) {
          toast({ title: 'Host indisponível', description: 'Serviço de assinatura indisponível. Tente novamente mais tarde.', variant: 'destructive' });
          setSignBlocking(false);
          setSignCompleted(false);
          return;
        }
        setSignProgressText('Preparando requisição de assinatura...');
        const tipoDocKey = ['portarias','decretos','diarias'].includes(activeTab) ? activeTab : (isPortaria ? 'portarias' : isDecreto ? 'decretos' : 'diarias');
        const createReqBody = {
          tipo_documento: tipoDocKey,
          documento_id: doc.id,
          tipo_assinante: tipoAssinante,
        };
        const createResp = await api.post('/assinatura/create-sign-request', createReqBody);
        const data = createResp.data || {};
        const requestId: string = data.request_id;
        const token: string = data.token;

        if (!requestId || !token) {
          throw new Error('Falha ao preparar assinatura (request_id/token ausentes)');
        }

        const hostOk = await checkHostStatus();
        if (!hostOk) {
          toast({ title: 'Host indisponível', description: 'Serviço de assinatura indisponível. Tente novamente mais tarde.', variant: 'destructive' });
          setSignBlocking(false);
          setSignCompleted(false);
          return;
        }

        setSignProgressText('Solicitando assinatura ao host local...');
        setSignProgressStep(2);
        const authToken = (typeof window !== 'undefined') ? (localStorage.getItem('access_token') || '') : '';
        const hostResp = await fetch('http://127.0.0.1:5100/local/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ 
            request_id: requestId,
            token,
            pdf_data: data.pdf_data,
            assinatura_info: data.assinatura_info,
            signer_nome: data.signer_nome,
            signer_cpf: data.signer_cpf
          }),
        });

        const hostJson = await hostResp.json().catch(() => ({}));
        if (!hostResp.ok) {
          throw new Error(hostJson?.error || 'Host local retornou erro');
        }

        setSignProgressText('Enviando PDF assinado ao backend...');
        setSignProgressStep(3);
        const signedBase64 = hostJson?.signed_pdf_base64 as string;
        if (!signedBase64) {
          throw new Error(hostJson?.error || 'Host não retornou PDF assinado');
        }
        const signedBytes = Uint8Array.from(atob(signedBase64), c => c.charCodeAt(0));
        const formData = new FormData();
        formData.append('signed_pdf', new Blob([signedBytes], { type: 'application/pdf' }), `${requestId}_signed.pdf`);
        await api.post(`/assinatura/upload-signed/${requestId}`, formData);

        setSignProgressText('Atualizando dados e finalizando...');
        setSignProgressStep(4);
        const updated = tipoDocKey === 'portarias'
          ? await assinaturaService.fetchByPortaria(doc.id)
          : tipoDocKey === 'decretos'
            ? await assinaturaDecretoService.fetchByDecreto(doc.id)
            : await assinaturaDiariaService.fetchByDiaria(doc.id);
        updateDocumentoSignatures(doc.id, updated as any);
        try { await refreshActiveTabData(true); } catch {}

        toast({
          title: 'Sucesso',
          description: 'Documento assinado via host local.',
          variant: 'default',
        });
        try {
          if (selectedDocuments.includes(doc.id)) {
            toggleDocumentSelection(doc.id);
          }
        } catch {}
        setSignProgressText('Assinatura concluída com sucesso');
        setSignProgressStep(signProgressTotal || 4);
        setSignCompleted(true);
        return;
      } catch (err: any) {
        toast({
          title: 'Erro na assinatura via host',
          description: err?.message || 'Falha ao assinar documento',
          variant: 'destructive',
        });
        setSignBlocking(false);
        setSignCompleted(false);
      }
    }

    return;
  };

  const handleSignProceed = () => {
    try {
      setSignBlocking(false);
      setSignCompleted(false);
      refreshActiveTabData(true);
    } catch {}
  };

  const handleBatchSign = async () => {
    try {
      if (!['portarias', 'decretos', 'diarias'].includes(activeTab)) {
        toast({ title: 'Aviso', description: 'Assinatura em lote está disponível para Portarias, Decretos e Diárias.', variant: 'default' });
        return;
      }

      const assinantes = Array.isArray((user as any)?.usuario_assinantes) ? (user as any)!.usuario_assinantes : [];
      const podePrefeito = assinantes.some((a: any) => ((a.assinante_tipo || a.tipo || '') as string).toLowerCase() === 'prefeito');
      const podeSecretario = assinantes.some((a: any) => ((a.assinante_tipo || a.tipo || '') as string).toLowerCase() === 'secretario');
      if (!podePrefeito && !podeSecretario) {
        toast({ title: 'Sem permissão', description: 'Você não possui permissão de Prefeito ou Secretário para assinatura em lote.', variant: 'destructive' });
        return;
      }

      const selecionados = filteredDocuments.filter(doc => selectedDocuments.includes(doc.id));
      const pendentesPrefeito = podePrefeito ? selecionados.filter(doc => {
        const status = doc.assinaturasStatus || {};
        return status['prefeito'] === 'pendente';
      }) : [];
      const pendentesSecretario = podeSecretario ? selecionados.filter(doc => {
        const status = doc.assinaturasStatus || {};
        return status['secretario'] === 'pendente';
      }) : [];

      let tipoAssinanteEscolhido = '' as 'prefeito' | 'secretario' | '';
      let pendentesParaTipo = [] as typeof selecionados;
      if (pendentesPrefeito.length > 0) {
        tipoAssinanteEscolhido = 'prefeito';
        pendentesParaTipo = pendentesPrefeito;
      } else if (pendentesSecretario.length > 0) {
        tipoAssinanteEscolhido = 'secretario';
        pendentesParaTipo = pendentesSecretario;
      }

      if (!tipoAssinanteEscolhido || pendentesParaTipo.length === 0) {
        toast({ title: 'Nada a assinar', description: 'Nenhum documento selecionado possui assinatura pendente para seus perfis disponíveis.', variant: 'default' });
        return;
      }

      setSignBlocking(true);
      setSignProgressText('Preparando lote de assinatura...');
      setSignProgressStep(1);
      setSignProgressTotal(4);
      closeBatchSignDialog();

      const itensReq = pendentesParaTipo.map(doc => ({
        tipo_documento: activeTab,
        documento_id: doc.id,
        tipo_assinante: tipoAssinanteEscolhido,
      }));

      const prepareResp = await api.post('/assinatura/create-sign-batch', { itens: itensReq });
      const prep = prepareResp.data || {};
      const batchId: string = prep.batch_id;
      const preparedItems: any[] = Array.isArray(prep.itens) ? prep.itens : [];
      if (!batchId || preparedItems.length === 0) {
        throw new Error('Falha ao preparar lote de assinatura');
      }

      const hostOk = await checkHostStatus();
      if (!hostOk) {
        toast({ title: 'Host indisponível', description: 'Serviço de assinatura indisponível. Tente novamente mais tarde.', variant: 'destructive' });
        setSignBlocking(false);
        setSignCompleted(false);
        return;
      }

      setSignProgressText('Solicitando assinatura em lote ao host local...');
      setSignProgressStep(2);
      const authToken = (typeof window !== 'undefined') ? (localStorage.getItem('access_token') || '') : '';
      const hostResp = await fetch('http://127.0.0.1:5100/local/sign-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          itens: preparedItems.map(pi => ({ request_id: pi.request_id, token: pi.token, assinatura_info: pi.assinatura_info })),
        }),
      });
      const hostJson = await hostResp.json().catch(() => ({}));
      if (!hostResp.ok) {
        throw new Error(hostJson?.error || 'Host local retornou erro no lote');
      }

      setSignProgressText('Aguardando confirmação do backend para o lote...');
      setSignProgressStep(3);
      const maxTries = 120; // ~120s para lote
      let tries = 0;
      let finalBatch: any = null;
      while (tries < maxTries) {
        const statusResp = await api.get(`/assinatura/sign-batch-status/${batchId}`);
        finalBatch = statusResp.data;
        const assinados = finalBatch?.assinados || 0;
        const pendentes = finalBatch?.pendentes || 0;
        const erros = finalBatch?.erros || 0;
        setSignProgressText(`Progresso do lote: ${assinados} assinados, ${pendentes} pendentes, ${erros} erros`);
        if (finalBatch?.pendentes === 0) break;
        if ((finalBatch?.erros || 0) > 0 && (finalBatch?.assinados || 0) + (finalBatch?.pendentes || 0) < preparedItems.length) {
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
        tries += 1;
      }

      setSignProgressText('Atualizando dados e finalizando...');
      setSignProgressStep(4);
      for (const doc of pendentesParaTipo) {
        try {
          const updated = activeTab === 'portarias' 
            ? await assinaturaService.fetchByPortaria(doc.id)
            : activeTab === 'decretos' 
              ? await assinaturaDecretoService.fetchByDecreto(doc.id)
              : await assinaturaDiariaService.fetchByDiaria(doc.id);
          updateDocumentoSignatures(doc.id, updated as any);
        } catch {}
      }
      try { await refreshActiveTabData(true); } catch {}

      toast({ title: 'Sucesso', description: `Lote concluído: ${finalBatch?.assinados || preparedItems.length} assinados.`, variant: 'default' });
      setSignProgressText('Assinatura em lote concluída com sucesso');
      setSignCompleted(true);
      // Após concluir o lote, limpar seleção para evitar contagens incorretas
      try { clearSelection(); } catch {}
      closeBatchSignDialog();
    } catch (error: any) {
      toast({ title: 'Erro no lote', description: error?.message || 'Falha ao assinar documentos em lote', variant: 'destructive' });
      setSignBlocking(false);
      setSignCompleted(false);
    }
  };

  // Get selected documents data for the dialog (generalized for all types)
  const getSelectedDocumentsData = () => {
    return filteredDocuments
      .filter(doc => selectedDocuments.includes(doc.id))
      .map(doc => ({
        id: doc.id,
        number: doc.number,
        title: doc.title,
        server: doc.server,
        type: doc.type
      }));
  };

  if (loading && activeTab === 'portarias') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando portarias pendentes...</p>
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
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {availableCategories.length === 0 && (
              <div className="text-sm text-gray-600">Nenhuma aba disponível para seu perfil.</div>
            )}
            {availableCategories.map((label) => {
              const key = labelToKey[label] || label.toLowerCase();
              const isActive = activeTab === key;
              const count = getDocumentCount(key);
              return (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {count > 0 && (
                    <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {count}
                    </span>
                  )}
                  {label}
                </button>
              );
            })}
          </div>
      
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentYear={currentYear}
        onYearChange={setCurrentYear}
      />
        </div>
        <DocumentTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          filteredDocuments={filteredDocuments}
          searchTerm={searchTerm}
          getDocumentCount={getDocumentCount}
          isSignatureCompleted={isSignatureCompleted}
          onViewDocument={handleViewDocument}
          onSignDocument={handleSignDocument}
          isSigningDocument={isSigningDocument}
          selectedPortarias={selectedDocuments}
          selectAllPortarias={selectAllDocuments}
          onTogglePortariaSelection={toggleDocumentSelection}
          onToggleSelectAllPortarias={toggleSelectAllDocuments}
          onOpenBatchSignDialog={openBatchSignDialog}
          refreshData={refreshData}
        />
      </div>
      

      
      <BatchSignDialog
        isOpen={isBatchSignDialogOpen}
        onClose={closeBatchSignDialog}
        selectedDocumentos={getSelectedDocumentsData()}
        onConfirmBatchSign={handleBatchSign}
        isProcessing={signBlocking && !signCompleted}
        documentType={activeTab}
      />

      {signBlocking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            {!signCompleted ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <h3 className="text-lg font-semibold">Processando assinatura</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">{signProgressText}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2" style={{ width: `${Math.min(100, Math.round((signProgressStep / (signProgressTotal || 1)) * 100))}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Etapa {signProgressStep} de {signProgressTotal}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">Assinatura concluída</h3>
                </div>
                <p className="text-sm text-gray-700 mb-6">Assinatura concluída com sucesso.</p>
                <div className="flex justify-end">
                  <Button onClick={handleSignProceed} className="bg-blue-600 text-white hover:bg-blue-700">OK</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Signatures;


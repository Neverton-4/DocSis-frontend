import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { documentoService as portariaService, PrepararAssinaturaResponse } from '@/services/documentoPortariaService';
import { AssinaturaPortaria } from '@/services/assinaturaService';
import { digitalSignature, CertificateInfo } from '@/utils/digitalSignature';
import { TELAS } from '@/constants/telas';
import { useToast } from '@/hooks/use-toast';
import { useAssinaturas } from '@/hooks/useAssinaturas';
import lacunaService from '@/services/lacunaService';
import api from '@/config/api';
import { assinaturaService } from '@/services/assinaturaService';
import { assinaturaDecretoService } from '@/services/assinaturaDecretoService';
import { assinaturaDiariaService } from '@/services/assinaturaDiariaService';

export const useDocumentSignature = (portariaData: any, documentType?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, podeAssinarComo, getAssinantesPorTela } = useAuth();
  const { fetchByPortaria } = useAssinaturas();
  
  const [isSigningDocument, setIsSigningDocument] = useState(false);
  const [assinaturaData, setAssinaturaData] = useState<PrepararAssinaturaResponse | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCertificateSelector, setShowCertificateSelector] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateInfo | null>(null);
  const [isProcessingSignature, setIsProcessingSignature] = useState(false);
  const [portariasSignatures, setPortariasSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});

  // Carregar assinaturas da portaria específica
  useEffect(() => {
    const loadSignatures = async () => {
      if (!portariaData?.portaria?.id) return;
      
      // Se o documento não for uma portaria, não carregar assinaturas de portarias
      if (documentType && documentType !== 'portaria') {
        return;
      }
      
      try {
        // Primeiro, tentar usar as assinaturas que já vêm do endpoint /documento?info_only=true
        if (portariaData.assinaturas && portariaData.assinaturas.length > 0) {
          // Mapear as assinaturas do endpoint para o formato esperado
          const mappedSignatures = portariaData.assinaturas.map((assinatura: any) => ({
            id: assinatura.id,
            portaria_id: portariaData.portaria.id,
            tipo: assinatura.tipo,
            nome_assinante: assinatura.nome_assinante,
            cargo_assinante: assinatura.cargo_assinante,
            status: assinatura.status,
            data_assinatura: assinatura.data_assinatura,
            pagina: assinatura.pagina,
            x0: assinatura.coordenadas?.x0,
            y0: assinatura.coordenadas?.y0,
            x1: assinatura.coordenadas?.x1,
            y1: assinatura.coordenadas?.y1
          }));
          
          setPortariasSignatures(prev => ({
            ...prev,
            [portariaData.portaria.id]: mappedSignatures
          }));
        } else {
          // Fallback: usar o serviço de assinaturas se não houver dados no endpoint
          const signatures = await fetchByPortaria(portariaData.portaria.id);
          setPortariasSignatures(prev => ({
            ...prev,
            [portariaData.portaria.id]: signatures
          }));
        }
      } catch (err) {
        console.error(`Erro ao carregar assinaturas da portaria ${portariaData.portaria.id}:`, err);
        setPortariasSignatures(prev => ({
          ...prev,
          [portariaData.portaria.id]: []
        }));
      }
    };
    
    loadSignatures();
  }, [portariaData?.portaria?.id, portariaData?.assinaturas, fetchByPortaria, documentType]);

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

  const handleSignDocument = async (tipoAssinatura: string) => {
    if (!portariaData?.portaria) {
      toast({
        title: "Erro",
        description: "Dados da portaria não encontrados.",
        variant: "destructive"
      });
      return;
    }

    setIsSigningDocument(true);
    
    try {
      const numeroPortaria = portariaData.portaria.numero;
      const anoPortaria = portariaData.portaria.ano;
      
      if (tipoAssinatura === 'Prefeito') {
        // Buscar dados do assinante do usuário autenticado
        const assinantesPrefeito = user?.assinantes?.filter(assinante => 
          assinante.tipo === 'prefeito' || assinante.tipo === 'Prefeito'
        );
        
        if (!assinantesPrefeito || assinantesPrefeito.length === 0) {
          throw new Error('Usuário não possui permissão para assinar como Prefeito');
        }
        
        const assinantePrefeito = assinantesPrefeito[0];
        
        await lacunaService.signPortaria(
          numeroPortaria, 
          anoPortaria, 
          assinantePrefeito.id, 
          assinantePrefeito.nome,
          'prefeito'
        );
        
        toast({
          title: "Sucesso",
          description: "Documento assinado como Prefeito com sucesso!",
          variant: "default"
        });
        
        // Recarregar a página para mostrar a assinatura atualizada
        window.location.reload();
        
      } else if (tipoAssinatura === 'Secretário') {
        // Replicar a lógica de assinatura via host local do Signatures.tsx
        try {
          const tipoAssinante = 'secretario';
          // 1) Criar requisição de assinatura no backend
          const docTypeKey = (documentType || '').toLowerCase();
          const inferredKey = portariaData?.decreto?.id ? 'decretos' : (portariaData?.diaria?.id ? 'diarias' : 'portarias');
          const tipoDocKey = docTypeKey === 'decretos' || docTypeKey === 'diarias' || docTypeKey === 'portarias' ? docTypeKey : inferredKey;
          const documentoId = tipoDocKey === 'decretos' ? (portariaData?.decreto?.id) : tipoDocKey === 'diarias' ? (portariaData?.diaria?.id) : (portariaData?.portaria?.id);
          if (!documentoId) {
            throw new Error('ID do documento não encontrado');
          }
          const createReqBody = {
            tipo_documento: tipoDocKey,
            documento_id: documentoId,
            tipo_assinante: tipoAssinante,
          };
          const createResp = await api.post('/assinatura/create-sign-request', createReqBody);
          const data = createResp.data || {};
          const requestId: string = data.request_id;
          const token: string = data.token;

          if (!requestId || !token) {
            throw new Error('Falha ao preparar assinatura (request_id/token ausentes)');
          }

          // 2) Chamar host local para assinar
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
              assinatura_info: data.assinatura_info
            }),
          });

          const hostJson = await hostResp.json().catch(() => ({}));
          if (!hostResp.ok) {
            throw new Error(hostJson?.error || 'Host local retornou erro');
          }

          // 3) Poll do status até assinado
          const maxTries = 60;
          let tries = 0;
          let finalStatus: any = null;
          while (tries < maxTries) {
            const statusResp = await api.get(`/assinatura/sign-status/${requestId}`);
            finalStatus = statusResp.data;
            if (finalStatus?.status === 'signed') break;
            if (finalStatus?.status === 'error') {
              throw new Error(finalStatus?.error || 'Erro na assinatura');
            }
            await new Promise((r) => setTimeout(r, 1000));
            tries += 1;
          }

          if (finalStatus?.status !== 'signed') {
            let updatedFallback: any[] = [];
            if (tipoDocKey === 'decretos') {
              updatedFallback = await assinaturaDecretoService.fetchByDecreto(documentoId);
            } else if (tipoDocKey === 'diarias') {
              updatedFallback = await assinaturaDiariaService.fetchByDiaria(documentoId);
            } else {
              updatedFallback = await assinaturaService.fetchByPortaria(portariaData.portaria.id);
            }
            const hasSigned = Array.isArray(updatedFallback) && updatedFallback.some((a: any) => a?.status === 'assinada' || a?.status === 'signed');
            if (!hasSigned) {
              throw new Error('Tempo de espera excedido ao aguardar assinatura');
            }
          }

          // Atualizar e feedback
          const updated = await (async () => {
            if (tipoDocKey === 'decretos') {
              return assinaturaDecretoService.fetchByDecreto(documentoId);
            }
            if (tipoDocKey === 'diarias') {
              return assinaturaDiariaService.fetchByDiaria(documentoId);
            }
            return assinaturaService.fetchByPortaria(portariaData.portaria.id);
          })();
          toast({ title: 'Sucesso', description: 'Documento assinado via host local.', variant: 'default' });
          setTimeout(() => { window.location.reload(); }, 800);
        } catch (err: any) {
          console.error('Erro na assinatura via host local (Secretário):', err);
          toast({ title: 'Erro na assinatura via host', description: err?.message || 'Falha ao assinar documento', variant: 'destructive' });
        }
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

  const handleCertificateSelected = async (certificate: CertificateInfo) => {
    setSelectedCertificate(certificate);
    setShowCertificateSelector(false);
    setShowSignatureModal(true);
  };

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
      const pdfArrayBuffer = await pdfBlob.arrayBuffer();
      
      const signatureInfo = {
        reason: 'Assinatura Digital do Prefeito',
        location: 'Sistema de Protocolos',
        contactInfo: assinaturaData.assinatura_info?.nome_assinante || '',
        fieldName: assinaturaData.field_name,
        pageNumber: assinaturaData.assinatura_info?.pagina || 1,
        coordinates: assinaturaData.assinatura_info?.coordenadas
      };
      
      const signatureResult = await digitalSignature.signPDF(
        pdfArrayBuffer,
        selectedCertificate.thumbprint,
        signatureInfo
      );
      
      if (signatureResult.success && signatureResult.signedData) {
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
        
        closeSignatureModal();
        
        // Recarregar a página para mostrar a assinatura atualizada
        window.location.reload();
        
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

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setShowCertificateSelector(false);
    setAssinaturaData(null);
    setPdfBlob(null);
    setSelectedCertificate(null);
  };

  const handleUnifiedSignClick = () => {
    // Sempre permitir tentativa de assinatura, mesmo sem portariaData
    if (!portariaData?.portaria) {
      toast({ 
        title: 'Aviso', 
        description: 'Nenhum documento carregado para assinar. Aguarde o carregamento ou recarregue a página.', 
        variant: 'default' 
      });
      return;
    }
    const portariaId = portariaData.portaria.id;
    const roles = ['Prefeito', 'Secretário'];

    const assinantesAssinaturas = getAssinantesPorTela(TELAS.ASSINATURAS) || [];
    const mapToTitle = (tipo: string) => tipo === 'prefeito' ? 'Prefeito' : tipo === 'secretario' ? 'Secretário' : tipo;
    const allowedRoles = Array.from(new Set(assinantesAssinaturas.map(a => mapToTitle(String(a.tipo).toLowerCase()))));

    const pendingRoles = roles.filter(r => !isSignatureCompleted(portariaId, r));
    const correspondentes = allowedRoles.filter(r => pendingRoles.includes(r));

    if (correspondentes.length === 0) {
      toast({ 
        title: 'Informação', 
        description: 'Não há assinaturas pendentes para este documento ou você não tem permissão para assinar.', 
        variant: 'default' 
      });
      return;
    }

    const chosenRole = correspondentes.includes('Prefeito') ? 'Prefeito' : correspondentes[0];
    handleSignDocument(chosenRole);
  };

  return {
    // States
    isSigningDocument,
    assinaturaData,
    pdfBlob,
    showSignatureModal,
    showCertificateSelector,
    selectedCertificate,
    isProcessingSignature,
    
    // Functions
    handleSignDocument,
    handleCertificateSelected,
    processDigitalSignature,
    closeSignatureModal,
    handleUnifiedSignClick,
    isSignatureCompleted
  };
};
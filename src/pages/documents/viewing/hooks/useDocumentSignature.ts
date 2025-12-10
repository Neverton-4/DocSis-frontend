import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { documentoService as portariaService, PrepararAssinaturaResponse } from '@/services/documentoPortariaService';
import { AssinaturaDecreto, assinaturaDecretoService } from '@/services/assinaturaDecretoService';
import { digitalSignature, CertificateInfo } from '@/utils/digitalSignature';
import { TELAS } from '@/constants/telas';
import { useToast } from '@/hooks/use-toast';
import lacunaService from '@/services/lacunaService';

export const useDocumentSignature = (documentData: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, podeAssinarComo, getAssinantesPorTela } = useAuth();
  const [decretosSignatures, setDecretosSignatures] = useState<Record<number, AssinaturaDecreto[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assinaturaData, setAssinaturaData] = useState<any>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showCertificateSelector, setShowCertificateSelector] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateInfo | null>(null);
  const [isProcessingSignature, setIsProcessingSignature] = useState(false);
  const [isSigningDocument, setIsSigningDocument] = useState(false);

  useEffect(() => {
    const loadSignatures = async () => {
      if (!documentData?.decreto?.id) return;
      
      try {
        // Este DocumentViewer é usado apenas para decretos
        if (documentData.decreto) {
          // Para decretos, usar o serviço de assinaturas de decretos
          if (documentData.assinaturas && documentData.assinaturas.length > 0) {
            // Mapear as assinaturas do endpoint para o formato esperado
            const mappedSignatures = documentData.assinaturas.map((assinatura: any) => ({
              id: assinatura.id,
              decreto_id: documentData.decreto.id,
              tipo: assinatura.tipo,
              nome_assinante: assinatura.nome_assinante,
              cargo_assinante: assinatura.cargo_assinante,
              status: assinatura.status,
              data_assinatura: assinatura.data_assinatura,
              pagina: assinatura.pagina,
              posicao_x: assinatura.posicao_x,
              posicao_y: assinatura.posicao_y,
              largura: assinatura.largura,
              altura: assinatura.altura,
              created_at: assinatura.created_at,
              updated_at: assinatura.updated_at
            }));

            setDecretosSignatures(prev => ({
              ...prev,
              [documentData.decreto.id]: mappedSignatures
            }));
          } else {
            // Fallback: usar assinaturaDecretoService
            try {
              const signatures = await assinaturaDecretoService.fetchByDecreto(documentData.decreto.id);
              setDecretosSignatures(prev => ({
                ...prev,
                [documentData.decreto.id]: signatures
              }));
            } catch (err) {
              setDecretosSignatures(prev => ({
                ...prev,
                [documentData.decreto.id]: []
              }));
            }
          }
        }
      } catch (err) {
        const docId = documentData.decreto?.id;
        console.error(`Erro ao carregar assinaturas do decreto ${docId}:`, err);
        
        setDecretosSignatures(prev => ({
          ...prev,
          [docId]: []
        }));
      }
    };
    
    loadSignatures();
  }, [documentData?.decreto?.id, documentData?.assinaturas]);

  // Função para obter assinaturas baseada no tipo de documento
  const getSignatures = () => {
    if (documentData?.decreto?.id) {
      return decretosSignatures[documentData.decreto.id] || [];
    }
    return [];
  };

  // Função para verificar se uma assinatura específica está completa
  const isSignatureCompleted = (documentId: number, tipoAssinatura: string): boolean => {
    let signatures: any[] = [];
    
    if (documentData?.decreto?.id) {
      signatures = decretosSignatures[documentData.decreto.id] || [];
    }
    
    const tipoMap: Record<string, string> = {
      'Secretário': 'secretario',
      'Prefeito': 'prefeito'
    };
    
    const mappedTipo = tipoMap[tipoAssinatura] || tipoAssinatura.toLowerCase();
    return signatures.some(sig => 
      sig.tipo?.toLowerCase() === mappedTipo && 
      sig.status === 'assinado'
    );
  };

  const handleSignDocument = async (tipoAssinatura: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    const documentId = documentData?.portaria?.id || documentData?.decreto?.id;
    const documentType = documentData?.portaria ? 'portaria' : 'decreto';
    
    if (!documentId) {
      toast({
        title: "Erro",
        description: "ID do documento não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (isSignatureCompleted(documentId, tipoAssinatura)) {
      toast({
        title: "Aviso",
        description: `Este documento já foi assinado como ${tipoAssinatura}`,
        variant: "default",
      });
      return;
    }

    if (!podeAssinarComo(tipoAssinatura)) {
      toast({
        title: "Erro de Permissão",
        description: `Você não tem permissão para assinar como ${tipoAssinatura}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSigningDocument(true);
      setIsLoading(true);

      let response: PrepararAssinaturaResponse;
      
      if (documentType === 'portaria') {
        response = await portariaService.prepararAssinatura(documentId, tipoAssinatura);
      } else {
        // Para decretos, assumindo que haverá um serviço similar
        throw new Error('Assinatura de decretos ainda não implementada no backend');
      }

      if (response.success && response.data) {
        setAssinaturaData(response.data);
        setPdfBlob(response.data.pdfBlob);
        setShowSignatureModal(true);
      } else {
        throw new Error(response.message || 'Erro ao preparar assinatura');
      }
    } catch (error: any) {
      console.error('Erro ao preparar assinatura:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao preparar documento para assinatura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSigningDocument(false);
    }
  };

  const handleCertificateSelected = (certificate: CertificateInfo) => {
    setSelectedCertificate(certificate);
    setShowCertificateSelector(false);
  };

  const processDigitalSignature = async () => {
    if (!selectedCertificate || !assinaturaData || !pdfBlob) {
      toast({
        title: "Erro",
        description: "Dados necessários para assinatura não encontrados",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingSignature(true);

      const signedPdf = await digitalSignature.signPdf(
        pdfBlob,
        selectedCertificate,
        assinaturaData.signaturePosition
      );

      const documentId = documentData?.portaria?.id || documentData?.decreto?.id;
      const documentType = documentData?.portaria ? 'portaria' : 'decreto';

      if (documentType === 'portaria') {
        await portariaService.finalizarAssinatura(
          assinaturaData.assinaturaId,
          signedPdf,
          selectedCertificate
        );
      } else {
        // Para decretos, assumindo que haverá um serviço similar
        throw new Error('Finalização de assinatura de decretos ainda não implementada');
      }

      toast({
        title: "Sucesso",
        description: "Documento assinado com sucesso!",
        variant: "default",
      });

      setShowSignatureModal(false);
      setSelectedCertificate(null);
      setAssinaturaData(null);
      setPdfBlob(null);

      // Recarregar as assinaturas
      if (documentType === 'decreto') {
        const signatures = await assinaturaDecretoService.fetchByDecreto(documentId);
        setDecretosSignatures(prev => ({
          ...prev,
          [documentId]: signatures
        }));
      }

    } catch (error: any) {
      console.error('Erro ao processar assinatura digital:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar assinatura digital",
        variant: "destructive",
      });
    } finally {
      setIsProcessingSignature(false);
    }
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setSelectedCertificate(null);
    setAssinaturaData(null);
    setPdfBlob(null);
  };

  const getAvailableSignatureButtons = () => {
    if (!user) return [];

    const documentId = documentData?.portaria?.id || documentData?.decreto?.id;
    if (!documentId) return [];

    const tela = documentData?.portaria ? TELAS.PORTARIAS : TELAS.DECRETOS;
    const assinantes = getAssinantesPorTela(tela);

    return assinantes
      .filter(assinante => podeAssinarComo(assinante.tipo))
      .map(assinante => ({
        ...assinante,
        isCompleted: isSignatureCompleted(documentId, assinante.tipo),
        canSign: !isSignatureCompleted(documentId, assinante.tipo)
      }));
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
    getAvailableSignatureButtons,
    isSignatureCompleted,
    getSignatures
  };
};
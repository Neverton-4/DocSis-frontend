import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { documentoService as portariaService, PrepararAssinaturaResponse } from '@/services/documentoPortariaService';
import { AssinaturaPortaria } from '@/services/assinaturaService';
import { digitalSignature, CertificateInfo } from '@/utils/digitalSignature';
import { TELAS } from '@/constants/telas';
import { Portaria } from '@/types';
import { Button } from '@/components/ui/button';

interface UseSignatureLogicProps {
  pendingPortarias: Portaria[];
  portariasSignatures: Record<number, AssinaturaPortaria[]>;
  setPortariasSignatures: React.Dispatch<React.SetStateAction<Record<number, AssinaturaPortaria[]>>>;
  fetchByStatus: (status: string) => Promise<void>;
  fetchByPortaria: (portariaId: number) => Promise<AssinaturaPortaria[]>;
  toast: any;
}

export const useSignatureLogic = ({
  pendingPortarias,
  portariasSignatures,
  setPortariasSignatures,
  fetchByStatus,
  fetchByPortaria,
  toast
}: UseSignatureLogicProps) => {
  const [isSigningDocument, setIsSigningDocument] = useState(false);
  const [assinaturaData, setAssinaturaData] = useState<PrepararAssinaturaResponse | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCertificateSelector, setShowCertificateSelector] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateInfo | null>(null);
  const [isProcessingSignature, setIsProcessingSignature] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(null);

  // Mover useAuth para o nível do hook
  const { podeAssinarComo, getAssinantesPorTela } = useAuth();

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

  const handleSignDocument = async (doc: any, tipoAssinatura?: string) => {
    if (!tipoAssinatura) {
      console.log(`Assinar documento:`, doc.id);
      return;
    }

    setIsSigningDocument(true);
    setCurrentDocumentId(doc.id); // Armazenar o ID do documento atual
    
    try {
      if (tipoAssinatura === 'Prefeito') {
        const numeroPortaria = doc.originalData.numero;
        const anoPortaria = doc.originalData.ano.toString();
        
        const assinaturaInfo = await portariaService.assinarPrefeitoPorNumeroAno(numeroPortaria, anoPortaria) as PrepararAssinaturaResponse;
        
        if (assinaturaInfo.success) {
          setAssinaturaData({
            ...assinaturaInfo,
            numero_portaria: numeroPortaria,
            ano_portaria: anoPortaria,
            portaria_id: doc.id // Garantir que o portaria_id está definido
          });
          
          const pdfData = await portariaService.prepararAssinaturaPrefeito(doc.id, true) as Blob;
          setPdfBlob(pdfData);
          
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
        
        await fetchByStatus('aguardando_assinatura');
        
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
      setCurrentDocumentId(null);
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
        
        await fetchByStatus('aguardando_assinatura');
        
        // Usar currentDocumentId ou assinaturaData.portaria_id
        const documentId = assinaturaData.portaria_id || currentDocumentId;
        if (documentId) {
          const updatedSignatures = await fetchByPortaria(documentId);
          setPortariasSignatures(prev => ({
            ...prev,
            [documentId]: updatedSignatures
          }));
        }
        
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

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setAssinaturaData(null);
    setPdfBlob(null);
    setSelectedCertificate(null);
    setCurrentDocumentId(null);
  };

  const getSignatureButtonsData = (doc: any) => {
    const assinantesAssinaturas = getAssinantesPorTela(TELAS.ASSINATURAS);
    
    if (!assinantesAssinaturas || assinantesAssinaturas.length === 0) {
      return [];
    }
  
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
  
    return assinantesAssinaturas
      .filter((assinante) => {
        const podeAssinar = podeAssinarComo(assinante.tipo as 'prefeito' | 'secretario' | 'procurador' | 'controlador');
        if (!podeAssinar) return false;
        
        const tipoCapitalizado = capitalizeFirstLetter(assinante.tipo);
        const jaAssinado = isSignatureCompleted(doc.id, tipoCapitalizado);
        
        return !jaAssinado;
      })
      .map((assinante) => {
        const tipoCapitalizado = capitalizeFirstLetter(assinante.tipo);
        return {
          id: assinante.id,
          tipo: tipoCapitalizado,
          onClick: () => handleSignDocument(doc, tipoCapitalizado),
          disabled: isSigningDocument,
          text: isSigningDocument ? 'Assinando...' : `Assinar ${tipoCapitalizado}`
        };
      });
  };

  return {
    isSigningDocument,
    assinaturaData,
    pdfBlob,
    showSignatureModal,
    showCertificateSelector,
    selectedCertificate,
    isProcessingSignature,
    currentDocumentId,
    isSignatureCompleted,
    handleSignDocument,
    handleCertificateSelected,
    processDigitalSignature,
    closeSignatureModal,
    getSignatureButtonsData
  };
};
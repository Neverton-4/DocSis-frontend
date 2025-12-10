import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { documentoService as portariaService, PrepararAssinaturaResponse } from '@/services/documentoPortariaService';
import { AssinaturaPortaria } from '@/services/assinaturaService';
import { digitalSignature, CertificateInfo } from '@/utils/digitalSignature';
import lacunaService from '@/services/lacunaService';
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
  const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(null);

  // Mover useAuth para o nível do hook
  const { user, podeAssinarComo, getAssinantesPorTela } = useAuth();

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
    setCurrentDocumentId(doc.id);
    
    try {
      if (tipoAssinatura === 'Prefeito') {
        const numeroPortaria = doc.originalData.numero;
        const anoPortaria = doc.originalData.ano;
        
        // Buscar dados do assinante do usuário autenticado
        const assinantesPrefeito = user?.assinantes?.filter(assinante => 
          assinante.tipo === 'prefeito' || assinante.tipo === 'Prefeito'
        );
        
        if (!assinantesPrefeito || assinantesPrefeito.length === 0) {
          throw new Error('Usuário não possui permissão para assinar como Prefeito');
        }
        
        const assinantePrefeito = assinantesPrefeito[0];
        
        // Usar o serviço Lacuna Web PKI com dados do usuário
        await lacunaService.signPortaria(
          numeroPortaria, 
          anoPortaria, 
          assinantePrefeito.id, 
          assinantePrefeito.nome
        );
        
        toast({
          title: "Sucesso",
          description: "Documento assinado como Prefeito com sucesso!",
          variant: "default"
        });
        
        await fetchByStatus('aguardando_assinatura');
        
        const updatedSignatures = await fetchByPortaria(doc.id);
        setPortariasSignatures(prev => ({
          ...prev,
          [doc.id]: updatedSignatures
        }));
        
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
    currentDocumentId,
    isSignatureCompleted,
    handleSignDocument,
    getSignatureButtonsData
  };
};
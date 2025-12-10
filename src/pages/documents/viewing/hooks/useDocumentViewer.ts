import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentoService as portariaService } from '@/services/documentoPortariaService';
import { documentoDecretoService } from '@/services/documentoDecretoService';
import { documentoDiariaService } from '@/services/documentoDiariaService';
import { 
  PortariaDocumentosCompletosResponse, 
  AnexoPortaria
} from '@/types/portaria';

export const useDocumentViewer = () => {
  const navigate = useNavigate();
  const { id, tipo } = useParams();
  
  const [portariaData, setPortariaData] = useState<PortariaDocumentosCompletosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [anexosData, setAnexosData] = useState<AnexoPortaria[]>([]);
  const [documentType, setDocumentType] = useState<'portaria' | 'decreto' | 'diaria'>('portaria');

  // Carregar dados do documento
  const loadPortariaData = useCallback(async () => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado. Redirecionando para login...');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Silenciar logs de debug durante carregamento

      // Determinar tipo de documento baseado na URL ou assumir padrão
      let detectedType: 'portaria' | 'decreto' | 'diaria' = 'portaria';
      
      if (tipo && ['portaria', 'decreto', 'diaria'].includes(tipo)) {
        detectedType = tipo as 'portaria' | 'decreto' | 'diaria';
      } else {
        // Se não há tipo na URL, tentar detectar pela rota atual
        const currentPath = window.location.pathname;
        if (currentPath.includes('/decreto')) {
          detectedType = 'decreto';
        } else if (currentPath.includes('/diaria')) {
          detectedType = 'diaria';
        }
        // Silenciar log de tipo detectado pela rota
      }

      setDocumentType(detectedType);
      // Silenciar log de tipo de documento

      // Fazer DUAS chamadas: uma para metadados e outra para o PDF real (como no SignatureViewer)
      let documentoInfo: any;
      let pdfBlob: Blob;

      if (detectedType === 'portaria') {
        // Silenciar logs de carregamento
        documentoInfo = await portariaService.getDocumentoDocumento(Number(id), false, true, true);
        
        
        pdfBlob = await portariaService.getDocumentoDocumento(Number(id), false, false, false);
        
      } else if (detectedType === 'decreto') {
        
        documentoInfo = await documentoDecretoService.getDocumentoDocumento(Number(id), false, true, true);
        
        
        pdfBlob = await documentoDecretoService.getDocumentoDocumento(Number(id), false, false, false);
        
      } else if (detectedType === 'diaria') {
        
        documentoInfo = await documentoDiariaService.getDocumentoDocumento(Number(id), false, true, true);
        
        
        pdfBlob = await documentoDiariaService.getDocumentoDocumento(Number(id), false, false, false);
      } else {
        throw new Error(`Tipo de documento não suportado: ${detectedType}`);
      }

      

      // Criar URL do PDF a partir do blob (como no SignatureViewer)
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(blobUrl);

      // Processar anexos com thumbnails
      const anexosComThumbnail = documentoInfo.anexos?.map((anexo: any) => ({
        ...anexo,
        thumbnail: anexo.thumbnail_base64 || null
      })) || [];

      
      setAnexosData(anexosComThumbnail);

      // Montar dados completos do documento
      const documentoCompleto = {
        ...documentoInfo,
        portaria: documentoInfo.portaria || {
          id: Number(id),
          numero: documentoInfo.numero || '001',
          ano: documentoInfo.ano || '2024',
          titulo: documentoInfo.titulo || `${detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}`,
          conteudo: documentoInfo.conteudo || documentoInfo.titulo
        },
        documento_principal: documentoInfo.documento_principal ? {
          ...documentoInfo.documento_principal,
          thumbnail: documentoInfo.documento_thumbnail_base64
        } : undefined,
        anexos: anexosComThumbnail,
        assinaturas: documentoInfo.assinaturas || []
      };

      

      setPortariaData(documentoCompleto);

    } catch (error: any) {
      console.error('❌ Erro ao carregar documento:', error);
      
      if (error.response?.status === 401) {
        setError('Sessão expirada. Redirecionando para login...');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Erro ao carregar documento: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, tipo]);

  // Clique em anexo → baixar e exibir
  const handleAnexoClick = useCallback(async (anexo: AnexoPortaria) => {
    try {
      let blob;
      
      if (documentType === 'portaria') {
        blob = await portariaService.downloadAnexo(Number(id), anexo.id);
      } else if (documentType === 'decreto') {
        blob = await documentoDecretoService.downloadAnexo(Number(id), anexo.id);
      } else if (documentType === 'diaria') {
        blob = await documentoDiariaService.downloadAnexo(Number(id), anexo.id);
      } else {
        
        return;
      }
      
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Erro ao abrir anexo:', error);
    }
  }, [id, documentType]);

  // Clique na portaria principal
  const handleDocumentoPrincipalClick = useCallback(async () => {
    if (!id || !documentType) return;
    try {
      let blob;
      if (documentType === 'portaria') {
        blob = await portariaService.getDocumentoDocumento(Number(id), false, false);
      } else if (documentType === 'decreto') {
        // Usar o mesmo método do carregamento inicial para evitar chamadas desnecessárias
        blob = await documentoDecretoService.getDocumentoDocumento(Number(id), false, false);
      } else if (documentType === 'diaria') {
        blob = await documentoDiariaService.getDocumentoDocumento(Number(id), false, false, false);
      }
      
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        setPdfUrl(blobUrl);
      }
    } catch (error) {
      console.error('Erro ao abrir documento principal:', error);
    }
  }, [id, documentType]);

  // Função para download do PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!id) return;

    try {
      let blob: Blob;
      let filename: string;
      
      if (documentType === 'portaria') {
        blob = await portariaService.getDocumentoDocumento(Number(id), true, false, false);
        filename = `portaria_${id}.pdf`;
      } else if (documentType === 'decreto') {
        blob = await documentoDecretoService.getDocumentoDocumento(Number(id), true, false, false);
        filename = `decreto_${id}.pdf`;
      } else if (documentType === 'diaria') {
        blob = await documentoDiariaService.getDocumentoDocumento(Number(id), true, false, false);
        filename = `diaria_${id}.pdf`;
      } else {
        console.error('Tipo de documento não suportado para download:', documentType);
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      
    } catch (err) {
      console.error('❌ Erro ao fazer download do PDF:', err);
    }
  }, [id, documentType]);

  // Função para voltar
  const handleBack = useCallback(() => {
    
    navigate('/documentos');
  }, [navigate]);

  useEffect(() => {
    loadPortariaData();
  }, [loadPortariaData]);

  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return {
    // States
    portariaData,
    loading,
    error,
    pdfUrl,
    anexosData,
    documentType,
    
    // Functions
    handleAnexoClick,
    handleDocumentoPrincipalClick,
    handleDownloadPDF,
    handleBack,
    loadPortariaData
  };
};
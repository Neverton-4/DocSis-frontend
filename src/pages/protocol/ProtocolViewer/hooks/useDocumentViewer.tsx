import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { protocoloService } from '@/services/protocoloService';
import {
  ProcessoDocumentosCompletosResponse,
  AnexoProcesso,
  ProtocoloDocumentosCompletosResponse // Para compatibilidade
} from '@/types/protocolo';

export const useDocumentViewer = () => {
  const navigate = useNavigate();
  const { id, documentoId } = useParams();
  
  const [protocoloData, setProtocoloData] = useState<ProcessoDocumentosCompletosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [anexosData, setAnexosData] = useState<AnexoProcesso[]>([]);

  // Carregar dados do protocolo
  const loadProtocoloData = useCallback(async () => {
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

      console.log('🚀 Carregando protocolo ID:', id);

      // 1. Buscar informações com thumbnails
      const documentoInfo = await protocoloService.getProtocoloDocumento(Number(id), false, true, true);

      // 2. Buscar dados básicos do processo
      const processoBasico = await protocoloService.getById(Number(id));

      // 3. Baixar PDF principal como Blob para visualização
      const pdfBlob = await protocoloService.getProtocoloDocumento(Number(id), false, false, false);
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(blobUrl);

      // 4. Configurar anexos com thumbnails
      if (documentoInfo.anexos && documentoInfo.anexos.length > 0) {
        console.log('📎 Anexos encontrados:', documentoInfo.anexos.length);
        documentoInfo.anexos.forEach((anexo: any, index: number) => {
          console.log(`📎 Anexo ${index + 1}:`, {
            id: anexo.id,
            nome: anexo.nome_arquivo,
            thumbnail_base64: anexo.thumbnail_base64 ? '✅ Presente' : '❌ Ausente'
          });
        });
        
        // Mapear anexos com thumbnails corretas
        const anexosMapeados = documentoInfo.anexos.map((anexo: any) => ({
          ...anexo,
          thumbnail: anexo.thumbnail_base64, // Mapear o campo correto da API
          titulo: anexo.nome_arquivo // Adicionar titulo para compatibilidade com o componente
        }));
        
        console.log('🔄 Anexos após mapeamento:', anexosMapeados);
        setAnexosData(anexosMapeados);
      } else {
        console.log('📎 Nenhum anexo encontrado');
        // Fallback: tentar buscar anexos pela API específica
        try {
          console.log('🔄 Tentando fallback - buscando anexos pela API específica...');
          const anexosResponse = await protocoloService.getAnexosProtocolo(Number(id));
          console.log('🔄 Anexos do fallback:', anexosResponse);
          if (anexosResponse.anexos && anexosResponse.anexos.length > 0) {
            // Mapear anexos do fallback também
            const anexosFallbackMapeados = anexosResponse.anexos.map((anexo: any) => ({
              ...anexo,
              thumbnail: anexo.thumbnail_base64, // Mapear o campo correto da API
              titulo: anexo.nome_arquivo // Adicionar titulo para compatibilidade com o componente
            }));
            console.log('🔄 Anexos fallback após mapeamento:', anexosFallbackMapeados);
            setAnexosData(anexosFallbackMapeados);
          } else {
            setAnexosData([]);
          }
        } catch (fallbackError) {
          console.error('🚨 Erro no fallback de anexos:', fallbackError);
          setAnexosData([]);
        }
      }

      // 5. Montar dados completos do processo
      const processoCompleto = {
        ...documentoInfo,
        processo: processoBasico,
        // Mapear documento principal com thumbnail correta
        documento_principal: documentoInfo.documento_principal ? {
          ...documentoInfo.documento_principal,
          thumbnail: documentoInfo.documento_thumbnail_base64 // Usar o campo correto da API
        } : undefined,
        // Anexos já estão mapeados no anexosData
        anexos: anexosData,
        assinaturas: documentoInfo.assinaturas || []
      };

      console.log('✅ Processo completo montado:', {
        processo: processoCompleto.processo?.numero,
        documento_principal: !!processoCompleto.documento_principal,
        documento_thumbnail: processoCompleto.documento_principal?.thumbnail ? '✅ Mapeado' : '❌ Ausente',
        anexos_count: anexosData.length,
        anexos_com_thumbnail: anexosData.filter((a: any) => a.thumbnail).length
      });
      
      setProtocoloData(processoCompleto);

    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Sessão expirada. Redirecionando para login...');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados do protocolo');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Clique em anexo → baixar e exibir
  const handleAnexoClick = async (anexo: AnexoProcesso) => {
    try {
      const blob = await protocoloService.downloadAnexo(Number(id), anexo.id);
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Erro ao abrir anexo:', error);
    }
  };

  // Clique no protocolo principal
  const handleDocumentoPrincipalClick = async () => {
    if (!id) return;
    try {
      const blob = await protocoloService.getProtocoloDocumento(Number(id), false, false);
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Erro ao abrir documento principal:', error);
    }
  };

  // Função para baixar PDF
  const handleDownloadPDF = () => {
    alert("Baixar PDF principal ainda não implementado");
  };

  // Função para voltar
  const handleBack = () => {
    if (protocoloData?.processo?.id) {
      navigate(`/processo/${protocoloData.processo.id}`);
    } else {
      navigate('/processos/dashboard');
    }
  };

  useEffect(() => {
    loadProtocoloData();
  }, [loadProtocoloData]);

  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return {
    // States
    protocoloData,
    loading,
    error,
    pdfUrl,
    anexosData,
    
    // Functions
    handleAnexoClick,
    handleDocumentoPrincipalClick,
    handleDownloadPDF,
    handleBack,
    loadProtocoloData,
    // Função para recarregar anexos após adicionar novo
    reloadAnexos: async () => {
      if (id) {
        try {
          const anexosResponse = await protocoloService.getAnexosProtocolo(Number(id));
          if (anexosResponse.anexos && anexosResponse.anexos.length > 0) {
            const anexosMapeados = anexosResponse.anexos.map((anexo: any) => ({
              ...anexo,
              thumbnail: anexo.thumbnail_base64,
              titulo: anexo.nome_arquivo // Adicionar titulo para compatibilidade com o componente
            }));
            setAnexosData(anexosMapeados);
          } else {
            setAnexosData([]);
          }
        } catch (err) {
          console.error('Erro ao recarregar anexos:', err);
        }
      }
    }
  };
};
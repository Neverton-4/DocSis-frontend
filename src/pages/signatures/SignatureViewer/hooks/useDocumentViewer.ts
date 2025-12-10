import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { documentoService as portariaService } from '@/services/documentoPortariaService';
import { documentoDecretoService } from '@/services/documentoDecretoService';
import { documentoDiariaService } from '@/services/documentoDiariaService';
import { diariaService } from '@/services/diariaService';
import api from '@/config/api';
import { 
  PortariaDocumentosCompletosResponse, 
  AnexoPortaria
} from '@/types/portaria';

export const useDocumentViewer = () => {
  const navigate = useNavigate();
  const { id, tipo } = useParams();
  const location = useLocation();
  
  const [portariaData, setPortariaData] = useState<PortariaDocumentosCompletosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [anexosData, setAnexosData] = useState<AnexoPortaria[]>([]);
  const [documentType, setDocumentType] = useState<'portaria' | 'decreto' | 'diaria' | null>(null);

  // Função para detectar o tipo de documento
  const detectDocumentType = useCallback(async (documentId: number): Promise<'portaria' | 'decreto' | 'diaria'> => {
    
    
    // 1. Primeiro, tentar detectar pelo parâmetro 'tipo' da URL
    if (tipo && ['portaria', 'decreto', 'diaria'].includes(tipo)) {
      return tipo as 'portaria' | 'decreto' | 'diaria';
    }
    
    // 2. Se não há parâmetro 'tipo', fazer testes paralelos usando as APIs corretas
    const promises = [
      // Teste para portaria usando a API correta
      portariaService.getDocumentoDocumento(documentId, false, true, true).then(() => 'portaria').catch(() => null),
      // Teste para decreto usando a API correta
      documentoDecretoService.getDocumentoDocumento(documentId, false, true, true).then(() => 'decreto').catch(() => null),
      // Teste para diária usando a API correta
      documentoDiariaService.getDocumentoDocumento(documentId, false, true, true).then(() => 'diaria').catch(() => null)
    ];
    
    try {
      const results = await Promise.allSettled(promises);
      
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'fulfilled' && (results[i] as PromiseFulfilledResult<string | null>).value) {
          const detectedType = (results[i] as PromiseFulfilledResult<string | null>).value;
          return detectedType! as 'portaria' | 'decreto' | 'diaria';
        }
      }
      
      // Se nenhum teste foi bem-sucedido, assumir portaria como padrão
      return 'portaria';
    } catch (error) {
      console.error('❌ Erro na detecção de tipo:', error);
      return 'portaria';
    }
  }, [tipo]);

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

      

      // 1. Detectar tipo de documento
      const detectedType = await detectDocumentType(Number(id));
      setDocumentType(detectedType);
      

      // 2. Buscar dados básicos do documento
      let documentoBasico: any;
      let documentoInfo: any;
      let pdfBlob: Blob;

      if (detectedType === 'portaria') {
        
        
        // Usar a nova função getDocumentoDocumento para obter informações completas
        documentoInfo = await portariaService.getDocumentoDocumento(Number(id), false, true, true);
        
        // Para portarias, os dados básicos já vêm na resposta completa
        documentoBasico = documentoInfo.portaria;
        
        // Garantir que o servidor seja mapeado corretamente para portarias
        if (documentoInfo.servidor && !documentoBasico.servidor) {
          documentoBasico.servidor = documentoInfo.servidor;
        }
        
        // Se não há dados básicos, usar dados mockados
        if (!documentoBasico) {
          
          documentoBasico = {
            id: Number(id),
            numero: '001',
            ano: '2024',
            titulo: 'Portaria de Exemplo',
            conteudo: 'Conteúdo da portaria',
            tipo: { nome: 'Portaria' },
            subtipo: { nome_subtipo: 'Administrativa' },
            servidor: { nome: 'Servidor não informado' }
          };
          
          documentoInfo = {
            documento_principal: { id: Number(id), nome_arquivo: `portaria_${id}.pdf` },
            documento_thumbnail_base64: null,
            anexos: [],
            assinaturas: []
          };
        }
        
        // Para portarias, buscar o documento real
        try {
          pdfBlob = await portariaService.getDocumentoDocumento(Number(id), false, false);
          
        } catch (error) {
          console.warn('⚠️ Erro ao carregar PDF da portaria, usando mockado:', error);
          pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
        }
        
      } else if (detectedType === 'decreto') {
        
        
        // Usar a nova função getDocumentoDocumento para obter informações completas
        try {
          const decretoCompleto = await documentoDecretoService.getDocumentoDocumento(
            Number(id), 
            false, // download
            true,  // info_only
            true   // include_thumbnails
          );
          
          
          
          // Extrair dados básicos do decreto da resposta completa
          documentoBasico = {
            id: Number(id),
            numero: decretoCompleto.numero || '001',
            ano: decretoCompleto.ano || '2024',
            titulo: decretoCompleto.titulo || 'Decreto',
            conteudo: decretoCompleto.conteudo || decretoCompleto.titulo,
            tipo: decretoCompleto.tipo || { nome: 'Decreto' },
            subtipo: decretoCompleto.subtipo || { nome_subtipo: 'Municipal' },
            servidor: decretoCompleto.servidor || { nome: 'Servidor não informado' }
          };
          
          // Usar os dados completos da API
          documentoInfo = {
            documento_principal: decretoCompleto.documento_principal || { id: Number(id), nome_arquivo: `decreto_${id}.pdf` },
            documento_thumbnail_base64: decretoCompleto.documento_principal?.thumbnail_base64 || null,
            anexos: decretoCompleto.anexos || [],
            assinaturas: decretoCompleto.assinaturas || []
          };
          
          // Se a chamada com info_only=true foi bem-sucedida, usar o mesmo endpoint para o PDF
          if (!decretoCompleto.documento_principal?.conteudo_base64) {
            try {
              pdfBlob = await documentoDecretoService.getDocumentoDocumento(Number(id), false, false);
              
            } catch (pdfError) {
              console.warn('⚠️ Erro ao carregar PDF do decreto, usando mockado:', pdfError);
              pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
            }
          } else {
            // Se já temos o conteúdo base64, converter para blob
            try {
              const binaryString = atob(decretoCompleto.documento_principal.conteudo_base64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              pdfBlob = new Blob([bytes], { type: 'application/pdf' });
              
            } catch (conversionError) {
              console.warn('⚠️ Erro ao converter base64 para blob:', conversionError);
              pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
            }
          }
          
        } catch (error) {
          console.error('❌ Erro ao carregar dados completos do decreto:', error);
          
          // Fallback: buscar dados básicos do decreto
          try {
            const decretoData = await documentoDecretoService.getById(Number(id));
            
            
            documentoBasico = {
              id: decretoData.id,
              numero: decretoData.numero || '001',
              ano: decretoData.ano || '2024',
              titulo: decretoData.titulo || 'Decreto',
              conteudo: decretoData.conteudo || decretoData.titulo,
              tipo: decretoData.tipo || { nome: 'Decreto' },
              subtipo: { nome_subtipo: decretoData.tipo || 'Municipal' },
              servidor: decretoData.servidor || { nome: 'Servidor não informado' }
            };
          } catch (fallbackError) {
            console.error('❌ Erro ao carregar dados básicos do decreto:', fallbackError);
            // Usar dados mockados como último recurso
            documentoBasico = {
              id: Number(id),
              numero: '001',
              ano: '2024',
              titulo: 'Decreto de Exemplo',
              conteudo: 'Conteúdo do decreto',
              tipo: { nome: 'Decreto' },
              subtipo: { nome_subtipo: 'Municipal' },
              servidor: { nome: 'Servidor não informado' }
            };
          }
          
          // Para fallback, usar estrutura básica
          documentoInfo = {
            documento_principal: { id: Number(id), nome_arquivo: `decreto_${id}.pdf` },
            documento_thumbnail_base64: null,
            anexos: [],
            assinaturas: []
          };
          
          // Tentar carregar o PDF mesmo no fallback
          try {
            pdfBlob = await documentoDecretoService.getDocumentoDocumento(Number(id), false, false);
            
          } catch (pdfError) {
            console.warn('⚠️ Erro ao carregar PDF do decreto no fallback, usando mockado:', pdfError);
            pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
          }
        }
        
      } else if (detectedType === 'diaria') {
        
        
        // Usar a nova função getDocumentoDocumento para obter informações completas
        try {
          const diariaCompleta = await documentoDiariaService.getDocumentoDocumento(
            Number(id), 
            false, // download
            true,  // info_only
            true   // include_thumbnails
          );
          
          
          
          // Extrair dados básicos da diária da resposta completa
          documentoBasico = {
            id: Number(id),
            numero: diariaCompleta.numero || '001',
            ano: diariaCompleta.ano || '2024',
            titulo: diariaCompleta.titulo || 'Diária',
            tipo: diariaCompleta.tipo || { nome: 'Diária' },
            subtipo: diariaCompleta.subtipo || { nome_subtipo: 'Servidor' },
            servidor: diariaCompleta.servidor || { nome: 'Servidor não informado' }
          };
          
          // Usar os dados completos da API
          documentoInfo = {
            documento_principal: diariaCompleta.documento_principal || { id: Number(id), nome_arquivo: `diaria_${id}.pdf` },
            documento_thumbnail_base64: diariaCompleta.documento_principal?.thumbnail_base64 || null,
            anexos: diariaCompleta.anexos || [],
            assinaturas: diariaCompleta.assinaturas || []
          };
          
        } catch (error) {
          console.error('❌ Erro ao carregar dados completos da diária:', error);
          
          // Fallback: buscar dados básicos da diária
          try {
            const diariaData = await diariaService.getById(Number(id));
            
            
            documentoBasico = {
              id: diariaData.id,
              numero: diariaData.numero || '001',
              ano: diariaData.ano || '2024',
              titulo: diariaData.titulo || 'Diária',
              tipo: diariaData.tipo || { nome: 'Diária' },
              subtipo: { nome_subtipo: diariaData.tipo || 'Servidor' },
              servidor: diariaData.servidor || { nome: 'Servidor não informado' }
            };
          } catch (fallbackError) {
            console.error('❌ Erro ao carregar dados básicos da diária:', fallbackError);
            // Usar dados mockados como último recurso
            documentoBasico = {
              id: Number(id),
              numero: '001',
              ano: '2024',
              titulo: 'Diária de Exemplo',
              tipo: { nome: 'Diária' },
              subtipo: { nome_subtipo: 'Servidor' },
              servidor: { nome: 'Servidor não informado' }
            };
          }
          
          // Para fallback, usar estrutura básica
          documentoInfo = {
            documento_principal: { id: Number(id), nome_arquivo: `diaria_${id}.pdf` },
            documento_thumbnail_base64: null,
            anexos: [],
            assinaturas: []
          };
        }

        // Para diárias, buscar o documento real
        try {
          pdfBlob = await documentoDiariaService.getDocumentoDocumento(Number(id), false, false, false);
          
        } catch (error) {
          console.warn('⚠️ Erro ao carregar PDF da diária, usando mockado:', error);
          pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
        }
      }

      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(blobUrl);

      // 4. Configurar anexos com thumbnails
      if (documentoInfo.anexos && documentoInfo.anexos.length > 0) {
        
        documentoInfo.anexos.forEach((anexo: any, index: number) => {
          
        });
        
        // Mapear anexos com thumbnails corretas AQUI
        const anexosMapeados = documentoInfo.anexos.map((anexo: any) => ({
          ...anexo,
          thumbnail: anexo.thumbnail_base64 // Mapear o campo correto da API
        }));
        
        setAnexosData(anexosMapeados);
      } else {
          // Fallback: tentar buscar anexos pela API específica baseada no tipo de documento
          try {
            let anexosResponse;
            
            if (detectedType === 'portaria') {
              anexosResponse = await portariaService.getAnexosDocumento(Number(id));
            } else if (detectedType === 'decreto') {
              anexosResponse = await documentoDecretoService.getAnexosDocumento(Number(id));
            } else if (detectedType === 'diaria') {
              anexosResponse = await documentoDiariaService.getAnexosDocumento(Number(id));
            } else {
              // Para outros tipos, deixar vazio por enquanto
              setAnexosData([]);
              return;
            }
            
            if (anexosResponse.anexos && anexosResponse.anexos.length > 0) {
              // Mapear anexos do fallback também
              const anexosFallbackMapeados = anexosResponse.anexos.map((anexo: any) => ({
                ...anexo,
                thumbnail: anexo.thumbnail_base64 // Mapear o campo correto da API
              }));
              setAnexosData(anexosFallbackMapeados);
            } else {
              setAnexosData([]);
            }
          } catch (fallbackError) {
            console.error('🚨 Erro no fallback de anexos:', fallbackError);
            setAnexosData([]);
          }
        }

      // 5. Montar dados completos do documento
      const documentoCompleto = {
        ...documentoInfo,
        portaria: documentoBasico,
        // Mapear documento principal com thumbnail correta
        documento_principal: documentoInfo.documento_principal ? {
          ...documentoInfo.documento_principal,
          thumbnail: documentoInfo.documento_thumbnail_base64 // Usar o campo correto da API
        } : undefined,
        // Anexos já estão mapeados no anexosData
        anexos: anexosData,
        assinaturas: documentoInfo.assinaturas || [],
        // Adicionar campos específicos para decretos e diárias
        tipo: documentoBasico.tipo || documentoInfo.tipo,
        subtipo: documentoBasico.subtipo || documentoInfo.subtipo,
        // Garantir que o servidor seja mapeado corretamente
        servidor: documentoBasico.servidor || documentoInfo.servidor || {
          nome: 'Servidor não informado'
        }
      };

      
      
      // Estruturar os dados de acordo com o tipo de documento
      if (detectedType === 'decreto') {
        // Para decretos, usar a estrutura correta
        const decretoData = {
          ...documentoCompleto,
          portaria: {
            id: documentoBasico.id,
            numero: documentoBasico.numero,
            ano: documentoBasico.ano,
            titulo: documentoBasico.titulo,
            conteudo: documentoBasico.conteudo || documentoBasico.titulo
          }
        };
        setPortariaData(decretoData);
      } else if (detectedType === 'diaria') {
        // Para diárias, usar a estrutura correta
        const diariaData = {
          ...documentoCompleto,
          portaria: {
            id: documentoBasico.id,
            numero: documentoBasico.numero,
            ano: documentoBasico.ano,
            titulo: documentoBasico.titulo,
            conteudo: documentoBasico.titulo
          }
        };
        setPortariaData(diariaData);
      } else {
        // Para portarias, manter a estrutura original
        setPortariaData(documentoCompleto);
      }

      // Carregar o PDF automaticamente após carregar os dados
      try {
        let blob;
        
        
        if (detectedType === 'portaria') {
          
          blob = await portariaService.getDocumentoDocumento(Number(id), false, false);
        } else if (detectedType === 'decreto') {
          
          blob = await documentoDecretoService.getDocumentoDocumento(Number(id), false, false);
        } else if (detectedType === 'diaria') {
          
          blob = await documentoDiariaService.getDocumentoDocumento(Number(id), false, false, false);
        }
        
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          setPdfUrl(blobUrl);
          
      } else {
          
      }
      } catch (pdfError) {
        console.error('⚠️ Erro ao carregar PDF automaticamente:', pdfError);
        console.error('📋 Detalhes do erro:', {
          message: pdfError.message,
          response: pdfError.response?.data,
          status: pdfError.response?.status,
          url: pdfError.config?.url
        });
        // Não definir como erro crítico, apenas log
      }

    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Sessão expirada. Redirecionando para login...');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados do documento');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, detectDocumentType]);

  // Clique em anexo → baixar e exibir
  const handleAnexoClick = async (anexo: AnexoPortaria) => {
    try {
      let blob;
      
      if (documentType === 'portaria') {
        blob = await portariaService.downloadAnexo(Number(id), anexo.id);
      } else if (documentType === 'decreto') {
        blob = await documentoDecretoService.downloadAnexo(Number(id), anexo.id);
      } else if (documentType === 'diaria') {
        blob = await documentoDiariaService.downloadAnexo(Number(id), anexo.id);
      } else {
        console.log('⚠️ Tipo de documento não suportado para download de anexo');
        return;
      }
      
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Erro ao abrir anexo:', error);
    }
  };

  // Clique na portaria principal
  const handleDocumentoPrincipalClick = async () => {
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
  };

  // Função para baixar PDF
  const handleDownloadPDF = () => {
    alert("Baixar PDF principal ainda não implementado");
  };

  // Função para voltar
  const handleBack = () => {
    // Verificar se há informação sobre a aba anterior no state da navegação
    const previousTab = location.state?.previousTab;
    
    if (previousTab) {
      // Se temos a aba anterior salva no state, usar ela
      navigate(`/signatures?tab=${previousTab}`);
    } else if (documentType) {
      // Navegar de volta para a aba correta baseada no tipo de documento
      navigate(`/signatures?tab=${documentType}s`);
    } else if (tipo) {
      // Se não temos documentType mas temos tipo da URL
      navigate(`/signatures?tab=${tipo}s`);
    } else {
      // Fallback para a página principal de assinaturas
      navigate('/signatures');
    }
  };

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
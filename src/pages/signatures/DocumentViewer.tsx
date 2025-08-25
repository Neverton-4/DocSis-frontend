import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PenTool, UserCheck } from 'lucide-react';
import { portariaService } from '@/services/portariaService';
import { 
  PortariaDocumentosCompletosResponse, 
  AnexoPortaria
} from '@/types/portaria';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { TELAS } from '@/constants/telas';

export const DocumentViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, podeAssinarComo, getAssinantesPorTela } = useAuth();
  const [portariaData, setPortariaData] = useState<PortariaDocumentosCompletosResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [anexosData, setAnexosData] = useState<AnexoPortaria[]>([]);

  // Carregar dados da portaria
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

      // 1. Buscar informações com thumbnails
      const documentoInfo = await portariaService.getPortariaDocumento(Number(id), false, true, true);

      // 2. Buscar dados básicos da portaria
      const portariaBasica = await portariaService.getById(Number(id));

      // 3. Baixar PDF principal como Blob
      const pdfBlob = await portariaService.getPortariaDocumento(Number(id), false, false);
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(blobUrl);

      // 4. Configurar anexos
      if (documentoInfo.anexos && documentoInfo.anexos.length > 0) {
        setAnexosData(documentoInfo.anexos);
      }

      const portariaCompleta = {
        ...documentoInfo,
        portaria: portariaBasica,
        anexos: documentoInfo.anexos || [],
        assinaturas: []
      };

      setPortariaData(portariaCompleta);

    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Sessão expirada. Redirecionando para login...');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados da portaria');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

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

  // Clique em anexo → baixar e exibir
  const handleAnexoClick = async (anexo: AnexoPortaria) => {
    try {
      const blob = await portariaService.downloadAnexo(Number(id), anexo.id);
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Erro ao abrir anexo:', error);
    }
  };

  // Clique na portaria principal
  const handleDocumentoPrincipalClick = async () => {
    if (!id) return;
    try {
      const blob = await portariaService.getPortariaDocumento(Number(id), false, false);
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
    } catch (error) {
      console.error('Erro ao abrir documento principal:', error);
    }
  };

  // Função para renderizar botões de assinatura baseados nas permissões
  const renderSignatureButtons = () => {
    // Filtrar assinantes da tela de assinaturas (ou criar uma tela específica para DocumentViewer)
    const assinantesAssinaturas = getAssinantesPorTela(TELAS.ASSINATURAS);
    
    if (!assinantesAssinaturas || assinantesAssinaturas.length === 0) {
      return null;
    }

    // Função para capitalizar a primeira letra
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
      <>
        {assinantesAssinaturas.map((assinante) => {
          const podeAssinar = podeAssinarComo(assinante.tipo as 'prefeito' | 'secretario' | 'procurador');
          
          if (!podeAssinar) return null;
          
          const tipoCapitalizado = capitalizeFirstLetter(assinante.tipo);
          const isPrefeito = assinante.tipo === 'prefeito';
          const isSecretario = assinante.tipo === 'secretario';
          
          return (
            <Button
              key={assinante.id}
              onClick={() => alert(`Assinar ${tipoCapitalizado} ainda não implementado`)}
              className={`w-full ${
                isPrefeito ? 'bg-blue-600 hover:bg-blue-700' : 
                isSecretario ? 'bg-green-600 hover:bg-green-700' : 
                'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={!portariaData}
            >
              {isPrefeito ? (
                <PenTool className="w-4 h-4 mr-2" />
              ) : isSecretario ? (
                <UserCheck className="w-4 h-4 mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Assinar {tipoCapitalizado}
            </Button>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Documentos / Visualizar Documento" 
      />
      
      {/* Botão Voltar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer mb-4"
        >
          ← Voltar
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Área principal */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Novo Card com informações da Portaria */}
            {portariaData && (
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-lg font-bold text-gray-800">
                    Portaria nº {portariaData.portaria.numero}/{portariaData.portaria.ano}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {portariaData.portaria?.servidor.nome_completo || "Servidor não informado"} &nbsp; | &nbsp; 
                    {portariaData.tipo_nome} - {portariaData.subtipo_nome || ""}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* PDF Viewer */}
            <Card className="h-[800px]">
              <CardContent className="h-full p-0">
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Carregando documento...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <p className="text-red-500">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Visualizador de PDF"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            
            {/* Card Thumbnails: Portaria + Anexos */}
            {(portariaData?.documento_principal || anexosData.length > 0) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Documentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    
                    {/* Portaria principal */}
                    {portariaData?.documento_principal && (
                      <div className="group cursor-pointer text-center">
                        <div
                          className="relative w-full aspect-[210/297] overflow-hidden rounded-lg border hover:shadow-lg transition-shadow"
                          onClick={handleDocumentoPrincipalClick}
                        >
                          {portariaData.documento_thumbnail_base64 && (
                            <img
                              src={`data:image/png;base64,${portariaData.documento_thumbnail_base64}`}
                              alt="Portaria"
                              className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                            />
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-700 truncate">Portaria</p>
                      </div>
                    )}

                    {/* Anexos */}
                    {anexosData.map((anexo) => {
                      const thumbSrc = anexo.thumbnail_base64
                        ? `data:image/png;base64,${anexo.thumbnail_base64}`
                        : anexo.thumbnail_url;

                      return (
                        <div key={anexo.id} className="group cursor-pointer text-center">
                          <div
                            className="relative w-full aspect-[210/297] overflow-hidden rounded-lg border hover:shadow-lg transition-shadow"
                            onClick={() => handleAnexoClick(anexo)}
                          >
                            {thumbSrc ? (
                              <img
                                src={thumbSrc}
                                alt={anexo.nome_arquivo}
                                className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <FileText className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-700 truncate" title={anexo.descricao}>
                            {anexo.descricao || anexo.nome_arquivo}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    onClick={() => alert("Baixar PDF principal ainda não implementado")}
                    className="w-full"
                    disabled={!portariaData}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                  
                  {/* Renderizar botões de assinatura baseados nas permissões */}
                  {renderSignatureButtons()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;

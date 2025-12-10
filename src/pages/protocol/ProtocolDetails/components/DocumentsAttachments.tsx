import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { useNavigate } from 'react-router-dom';
import { 
  Paperclip, 
  FileText, 
  Download, 
  Trash2, 
  Upload,
  Eye,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadDocumento,
  deletarDocumento,
  ProcessoDocumento
} from '@/services/processoDocumentoService';
import {
  downloadAnexo,
  ProcessoAnexo
} from '@/services/processoAnexoService';

// Interfaces para dados consolidados da API
interface DocumentoConsolidado {
  id: number;
  processo_id: number;
  departamento_id: number;
  departamento_nome?: string;
  nome: string;
  created_at: string;
}

interface AnexoConsolidado {
  id: number;
  processo_id: number;
  nome: string;
  tipo_arquivo?: string;
  created_at?: string;
}
// Removido import do departamentoService - usando dados consolidados
import { useToast } from '@/hooks/use-toast';
import AnexoOptionsDialog from './AnexoOptionsDialog'; // ✅ IMPORT ADICIONADO

interface DocumentsAttachmentsProps {
  processoId: number;
  documentos?: DocumentoConsolidado[];
  anexos?: AnexoConsolidado[];
  isLoadingDocumentos?: boolean;
  isLoadingAnexos?: boolean;
}

const DocumentsAttachments: React.FC<DocumentsAttachmentsProps> = ({ 
  processoId, 
  documentos: documentosProp, 
  anexos: anexosProp, 
  isLoadingDocumentos: isLoadingDocumentosProp, 
  isLoadingAnexos: isLoadingAnexosProp 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());
  const [showAnexoDialog, setShowAnexoDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ✅ Função para abrir o diálogo de opções de anexo
  const handleAnexarClick = () => {
    setShowAnexoDialog(true);
  };

  // ✅ Função para lidar com a seleção de arquivo do diálogo
  const handleFileSelectionFromDialog = () => {
    setShowAnexoDialog(false);
    // Simular clique no input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Usar dados dos props
  const documentos = documentosProp;
  const anexos = anexosProp;
  const isLoadingDocumentos = isLoadingDocumentosProp;
  const isLoadingAnexos = isLoadingAnexosProp;
  
  const isLoading = isLoadingDocumentos || isLoadingAnexos;
  const uploadMutation = useMutation({
    mutationFn: uploadDocumento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', processoId] });
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao enviar documento",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: deletarDocumento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', processoId] });
      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover documento",
        variant: "destructive",
      });
    }
  });

  // Função para validar tipos de arquivo permitidos
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/png'];
    return allowedTypes.includes(file.type);
  };

  // Função para obter extensão do arquivo
  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  // Todos os arquivos são PDFs, então sempre podem ser visualizados

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Validar tipos de arquivo
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (isValidFileType(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Arquivos não permitidos",
        description: `Apenas arquivos PNG e PDF são aceitos. Arquivos rejeitados: ${invalidFiles.join(', ')}`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach(file => dataTransfer.items.add(file));
      setSelectedFiles(dataTransfer.files);
    } else {
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um arquivo para enviar",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await uploadMutation.mutateAsync({
          file,
          processo_id: processoId
        });
      }
    } catch (error) {
      // Erro já tratado na mutation
    }
  };

  const handleDelete = async (documentoId: number, nomeDocumento: string) => {
    if (window.confirm(`Tem certeza que deseja remover o documento "${nomeDocumento}"?`)) {
      deleteMutation.mutate(documentoId);
    }
  };

  const handleDownload = async (documento: ProcessoDocumento) => {
    try {
      const arquivoPrioritario = getArquivoPrioritario(documento);
      if (!arquivoPrioritario) {
        toast({
          title: "Erro",
          description: "Nenhum arquivo disponível para download",
          variant: "destructive",
        });
        return;
      }
      
      // Fazer download direto via URL da API
      const url = `/api/processos/${processoId}/documentos/${documento.id}/download`;
      const link = document.createElement('a');
      link.href = url;
      link.download = arquivoPrioritario.arquivo || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer download do documento",
        variant: "destructive",
      });
    }
  };

  const navigate = useNavigate();

  const handleView = (documento: ProcessoDocumento) => {
    // Navegar para o DocumentViewer de processos
    navigate(`/processos/${processoId}/documento/${documento.id}`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    if (!fileName) return '📎';
    const extension = getFileExtension(fileName);
    if (extension === 'pdf') return '📄';
    if (extension === 'png') return '🖼️';
    return '📎';
  };

  // Função para remover extensão do nome do arquivo
  const removeFileExtension = (fileName: string): string => {
    if (!fileName) return '';
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  };

  // Usando dados consolidados - não precisa mais buscar departamentos separadamente
  const groupDocumentsByDepartmentId = (docs: DocumentoConsolidado[]) => {
    const grouped: { [key: number]: { docs: DocumentoConsolidado[], nome: string } } = {};
    
    // Validação de entrada
    if (!docs || !Array.isArray(docs)) {
      console.warn('DocumentsAttachments: docs não é um array válido', docs);
      return grouped;
    }
    
    docs.forEach(doc => {
      // Validação de documento
      if (!doc || typeof doc !== 'object') {
        console.warn('DocumentsAttachments: documento inválido encontrado', doc);
        return;
      }
      
      const departamentoId = doc.departamento_id || 0;
      
      // Usando departamento_nome dos dados consolidados com validação
      const departamentoNome = doc.departamento_nome?.trim() || 'Departamento Não Identificado';
      
      if (!grouped[departamentoId]) {
        grouped[departamentoId] = {
          docs: [],
          nome: departamentoNome
        };
      }
      grouped[departamentoId].docs.push(doc);
    });
    
    // Ordenar documentos dentro de cada departamento alfabeticamente por nome
    Object.keys(grouped).forEach(key => {
      const departamentoId = parseInt(key);
      grouped[departamentoId].docs.sort((a, b) => {
        const nomeA = removeFileExtension(a.nome || '').toLowerCase();
        const nomeB = removeFileExtension(b.nome || '').toLowerCase();
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });
    });
    
    return grouped;
  };

  const toggleDepartment = (departamentoId: number) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departamentoId)) {
      newExpanded.delete(departamentoId);
    } else {
      newExpanded.add(departamentoId);
    }
    setExpandedDepartments(newExpanded);
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-white">
        <div className="text-center py-2 text-sm">Carregando documentos...</div>
      </Card>
    );
  }

  // Função para obter o arquivo prioritário de um documento
  const getArquivoPrioritario = (documento: DocumentoConsolidado): { arquivo: string; tipo: string } | null => {
    // Para documentos consolidados, sempre retornamos o nome do arquivo
    // pois a API já filtra apenas documentos válidos
    if (documento.nome) {
      return { arquivo: documento.nome, tipo: 'documento' };
    }
    return null;
  };

  // Filtrar documentos que possuem pelo menos um arquivo prioritário
  const documentosComArquivos = documentos ? documentos.filter(doc => getArquivoPrioritario(doc) !== null) : [];
  const documentosAgrupados = documentosComArquivos ? groupDocumentsByDepartmentId(documentosComArquivos) : {};
  const totalDocumentos = documentosComArquivos?.length || 0;
  const totalAnexos = anexos?.length || 0;
  const totalArquivos = totalDocumentos + totalAnexos;

  return (
    <Card className="p-6 bg-white shadow-sm">
      {/* Header Principal */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Arquivos</h3>
          <p className="text-sm text-gray-600 mt-1">
            {totalDocumentos} documento(s) • {totalAnexos} anexo(s)
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-4 text-sm font-medium"
          onClick={handleAnexarClick}
          disabled={isUploading}
          title="Adicionar novo arquivo"
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Anexar
        </Button>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.png"
        />
        
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-3">Arquivos selecionados:</p>
            <div className="space-y-2 mb-4">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="text-sm text-blue-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {file.name} ({formatFileSize(file.size)})
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button 
                size="sm" 
                onClick={handleUpload}
                disabled={isUploading}
                className="h-8 px-4 text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Enviar'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedFiles(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploading}
                className="h-8 px-4 text-sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Seções de Arquivos */}
      <div className="space-y-6">
        {/* Seção de Documentos */}
        {totalDocumentos > 0 && (
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos ({totalDocumentos})
              </h4>
            </div>
            <div className="bg-white">
              {Object.entries(documentosAgrupados)
                .sort(([, a], [, b]) => a.nome.localeCompare(b.nome, 'pt-BR'))
                .map(([departamentoIdStr, { docs, nome }]) => {
                const departamentoId = parseInt(departamentoIdStr);
                const isExpanded = expandedDepartments.has(departamentoId);
                
                return (
                  <div key={departamentoId} className="border-b border-gray-100 last:border-b-0">
                    {/* Header do Departamento */}
                    <button
                      onClick={() => toggleDepartment(departamentoId)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-gray-800">
                          {nome}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          {docs.length}
                        </span>
                      </div>
                    </button>
                    
                    {/* Lista de Documentos */}
                    {isExpanded && (
                      <div className="bg-white">
                        {docs.map((documento) => {
                          const arquivoPrioritario = getArquivoPrioritario(documento);
                          
                          if (!arquivoPrioritario) return null;
                          
                          // Extrair e limpar nome do arquivo
                          const nomeArquivoCompleto = documento.nome || arquivoPrioritario.arquivo;
                          const nomeArquivoLimpo = nomeArquivoCompleto.split('/').pop()?.split('\\').pop() || nomeArquivoCompleto;
                          const nomeArquivoSemExtensao = removeFileExtension(nomeArquivoLimpo);
                          
                          return (
                            <div 
                              key={documento.id} 
                              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-lg">{getFileIcon(nomeArquivoLimpo)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {nomeArquivoSemExtensao}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(documento.created_at).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(documento)}
                                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  title="Visualizar documento"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(documento)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                  title="Baixar documento"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(documento.id, nomeArquivoSemExtensao)}
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  title="Remover documento"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        }).filter(Boolean)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção de Anexos */}
        {totalAnexos > 0 && (
          <div className="border border-green-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-green-50 border-b border-green-200">
              <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anexos ({totalAnexos})
              </h4>
            </div>
            <div className="bg-white">
              {anexos
                ?.sort((a, b) => {
                  const nomeA = removeFileExtension(a.nome || '').toLowerCase();
                  const nomeB = removeFileExtension(b.nome || '').toLowerCase();
                  return nomeA.localeCompare(nomeB, 'pt-BR');
                })
                .map((anexo) => {
                  // Extrair e limpar nome do arquivo
                  const nomeArquivoCompleto = anexo.nome || 'Anexo';
                  const nomeArquivoLimpo = nomeArquivoCompleto.split('/').pop()?.split('\\').pop() || nomeArquivoCompleto;
                  const nomeArquivoSemExtensao = removeFileExtension(nomeArquivoLimpo);
                  
                  return (
                    <div 
                      key={anexo.id} 
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg">{getFileIcon(nomeArquivoLimpo)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {nomeArquivoSemExtensao}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(anexo.enviado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(`/processos/${processoId}/documento/${anexo.id}`);
                          }}
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                          title="Visualizar anexo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const blob = await downloadAnexo(anexo.id);
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = nomeArquivoLimpo;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              toast({
                                title: "Erro",
                                description: "Erro ao fazer download do anexo",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          title="Baixar anexo"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Mensagem quando não há arquivos */}
        {totalArquivos === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-base font-medium text-gray-600 mb-2">Nenhum arquivo anexado</p>
            <p className="text-sm text-gray-500">Clique em "Anexar" para adicionar documentos ou anexos</p>
          </div>
        )}
      </div>

      {/* ✅ MODAL DIALOG ADICIONADO AQUI */}
      {showAnexoDialog && (
        <AnexoOptionsDialog
          onClose={() => setShowAnexoDialog(false)}
          onSelectFile={handleFileSelectionFromDialog}
        />
      )}
    </Card>
  );
};

export default DocumentsAttachments;
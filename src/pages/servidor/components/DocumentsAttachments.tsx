import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { useNavigate } from 'react-router-dom';
import { 
  Paperclip, 
  FileText, 
  Download, 
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listarDocumentos,
  deletarDocumento,
  ProcessoDocumento
} from '@/services/processoDocumentoService';
import {
  listarAnexos,
  deletarAnexo,
  downloadAnexo,
  ProcessoAnexo
} from '@/services/processoAnexoService';
import { departamentoService } from '@/services/departamentoService';
import { useToast } from '@/hooks/use-toast';

interface DocumentsAttachmentsProps {
  processoId: number;
  documentos?: ProcessoDocumento[];
  anexos?: ProcessoAnexo[];
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
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar documentos (fallback se não passado como prop)
  const { 
    data: documentosQuery, 
    isLoading: isLoadingDocumentosQuery, 
    error: errorDocumentos 
  } = useQuery({
    queryKey: ['documentos', processoId],
    queryFn: () => listarDocumentos(processoId),
    enabled: !!processoId && !documentosProp
  });

  // Query para buscar anexos (fallback se não passado como prop)
  const { 
    data: anexosQuery, 
    isLoading: isLoadingAnexosQuery, 
    error: errorAnexos 
  } = useQuery({
    queryKey: ['anexos', processoId],
    queryFn: () => listarAnexos(processoId),
    enabled: !!processoId && !anexosProp
  });

  // Usar dados dos props ou das queries
  const documentos = documentosProp || documentosQuery;
  const anexos = anexosProp || anexosQuery;
  const isLoadingDocumentos = isLoadingDocumentosProp ?? isLoadingDocumentosQuery;
  const isLoadingAnexos = isLoadingAnexosProp ?? isLoadingAnexosQuery;
  
  const isLoading = isLoadingDocumentos || isLoadingAnexos;
  const error = errorDocumentos || errorAnexos;

  // Buscar departamentos
  const { data: departamentos } = useQuery({
    queryKey: ['departamentos'],
    queryFn: departamentoService.getAll
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

  const getArquivoPrioritario = (documento: ProcessoDocumento) => {
    // Ordem de prioridade: pdf_assinado > pdf_enviado > pdf_gerado
    if (documento.pdf_assinado) {
      return { arquivo: documento.pdf_assinado, tipo: 'pdf_assinado' };
    }
    if (documento.pdf_enviado) {
      return { arquivo: documento.pdf_enviado, tipo: 'pdf_enviado' };
    }
    if (documento.pdf_gerado) {
      return { arquivo: documento.pdf_gerado, tipo: 'pdf_gerado' };
    }
    return null;
  };

  const groupDocumentsByDepartmentId = (docs: ProcessoDocumento[]) => {
    const grouped: { [key: number]: { docs: ProcessoDocumento[], nome: string } } = {};
    
    docs.forEach(doc => {
      const departamentoId = doc.departamento_id || 0;
      
      // Buscar o nome do departamento na lista de departamentos
      const departamento = departamentos?.find(dep => dep.id === departamentoId);
      const departamentoNome = departamento?.nome || 'Departamento Não Identificado';
      
      if (!grouped[departamentoId]) {
        grouped[departamentoId] = {
          docs: [],
          nome: departamentoNome
        };
      }
      
      grouped[departamentoId].docs.push(doc);
    });
    
    return grouped;
  };

  const toggleDepartmentExpansion = (departamentoId: number) => {
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
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Arquivos
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando arquivos...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Arquivos
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Erro ao carregar arquivos</p>
        </div>
      </Card>
    );
  }

  const groupedDocuments = documentos ? groupDocumentsByDepartmentId(documentos) : {};
  const hasDocuments = documentos && documentos.length > 0;
  const hasAnexos = anexos && anexos.length > 0;

  return (
    <Card className="p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Paperclip className="w-5 h-5" />
        Arquivos
      </h3>

      {/* Documents Section */}
      {hasDocuments && (
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos ({documentos.length})
          </h4>
          
          {Object.entries(groupedDocuments).map(([departamentoId, { docs, nome }]) => {
            const isExpanded = expandedDepartments.has(Number(departamentoId));
            
            return (
              <div key={departamentoId} className="mb-4">
                <button
                  onClick={() => toggleDepartmentExpansion(Number(departamentoId))}
                  className="flex items-center gap-2 w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium text-sm">{nome}</span>
                  <span className="text-xs text-gray-500">({docs.length})</span>
                </button>
                
                {isExpanded && (
                  <div className="mt-2 ml-6 space-y-2">
                    {docs.map((documento) => {
                      const arquivoPrioritario = getArquivoPrioritario(documento);
                      
                      return (
                        <div key={documento.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-lg">
                              {getFileIcon(arquivoPrioritario?.arquivo || '')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {documento.nome || arquivoPrioritario?.arquivo || 'Documento sem nome'}
                              </p>
                              {arquivoPrioritario && (
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(arquivoPrioritario.tamanho || 0)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleView(documento)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDownload(documento)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(documento.id, documento.nome || 'documento')}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Anexos Section */}
      {hasAnexos && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Anexos ({anexos.length})
          </h4>
          
          <div className="space-y-2">
            {anexos.map((anexo) => (
              <div key={anexo.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg">
                    {getFileIcon(anexo.arquivo)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {anexo.nome || anexo.arquivo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(anexo.tamanho)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => downloadAnexo(anexo.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasDocuments && !hasAnexos && (
        <div className="text-center py-8">
          <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum arquivo encontrado</p>
        </div>
      )}
    </Card>
  );
};

export default DocumentsAttachments;
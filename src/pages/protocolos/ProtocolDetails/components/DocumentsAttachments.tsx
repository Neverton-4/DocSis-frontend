import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
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
  getDocumentosByProcessoId,
  uploadDocumento,
  deleteDocumento,
  downloadDocumento,
  getDocumentoUrl,
  Documento
} from '@/services/documentoService';
import { departamentoService } from '@/services/departamentoService';
import { useToast } from '@/hooks/use-toast';
import AnexoOptionsDialog from './AnexoOptionsDialog'; // ✅ IMPORT ADICIONADO

interface DocumentsAttachmentsProps {
  processoId: number;
}

const DocumentsAttachments: React.FC<DocumentsAttachmentsProps> = ({ processoId }) => {
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

  // Query para buscar documentos
  const { 
    data: documentos, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['documentos', processoId],
    queryFn: () => getDocumentosByProcessoId(processoId),
    enabled: !!processoId
  });

  // Mutation para upload
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
    mutationFn: deleteDocumento,
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

  // Função para verificar se pode visualizar
  const canPreview = (fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return ['pdf', 'png'].includes(extension);
  };

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

  const handleDownload = async (documento: Documento) => {
    try {
      const blob = await downloadDocumento(documento.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nome_arquivo || documento.nome || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer download do documento",
        variant: "destructive",
      });
    }
  };

  const handleView = (documento: Documento) => {
    const url = getDocumentoUrl(documento.id);
    window.open(url, '_blank');
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

  // Buscar departamentos
  const { data: departamentos } = useQuery({
    queryKey: ['departamentos'],
    queryFn: departamentoService.getAll
  });

  const groupDocumentsByDepartmentId = (docs: Documento[]) => {
    const grouped: { [key: number]: { docs: Documento[], nome: string } } = {};
    
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
    
    // Ordenar documentos dentro de cada departamento por data
    Object.keys(grouped).forEach(key => {
      const departamentoId = parseInt(key);
      grouped[departamentoId].docs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
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

  if (error) {
    return (
      <Card className="p-4 bg-white">
        <div className="text-center py-2 text-red-500 flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          Erro ao carregar documentos
        </div>
      </Card>
    );
  }

  const documentosAgrupados = documentos ? groupDocumentsByDepartmentId(documentos) : {};
  const totalDocumentos = documentos?.length || 0;

  return (
    <Card className="p-4 bg-white">
      {/* Header Compacto */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-medium">Anexos ({totalDocumentos})</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-3 text-xs"
          onClick={handleAnexarClick}
          disabled={isUploading}
          title="Clique aqui para selecionar opção de anexo"
        >
          <Paperclip className="h-3 w-3 mr-1" />
          Anexar
        </Button>
      </div>

      {/* Upload Section Compacto */}
      <div className="mb-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.png"
        />
        
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="p-3 bg-blue-50 rounded border">
            <p className="text-xs font-medium mb-2">Arquivos selecionados:</p>
            <div className="space-y-1 mb-2">
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {file.name} ({formatFileSize(file.size)})
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUpload}
                disabled={isUploading}
                className="h-7 px-3 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
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
                className="h-7 px-3 text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Documentos por Departamento */}
      <div className="space-y-2">
        {Object.keys(documentosAgrupados).length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-1" />
            <p className="text-sm">Nenhum documento anexado</p>
          </div>
        ) : (
          Object.entries(documentosAgrupados).map(([departamentoIdStr, { docs, nome }]) => {
            const departamentoId = parseInt(departamentoIdStr);
            const isExpanded = expandedDepartments.has(departamentoId);
            
            return (
              <div key={departamentoId} className="border rounded">
                {/* Header do Departamento - Clicável */}
                <button
                  onClick={() => toggleDepartment(departamentoId)}
                  className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {nome}
                    </span>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {docs.length}
                    </span>
                  </div>
                </button>
                
                {/* Lista de Documentos - Expansível */}
                {isExpanded && (
                  <div className="border-t">
                    {docs.map((documento) => {
                      const nomeArquivo = documento.nome_arquivo || documento.nome || 'Documento';
                      const tamanhoArquivo = documento.tamanho || 0;
                      
                      return (
                        <div 
                          key={documento.id} 
                          className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm">{getFileIcon(nomeArquivo)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{nomeArquivo}</p>
                              <p className="text-xs text-gray-500">
                                {tamanhoArquivo > 0 && `${formatFileSize(tamanhoArquivo)} • `}
                                {new Date(documento.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {canPreview(nomeArquivo) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(documento)}
                                className="h-6 w-6 p-0 hover:bg-blue-50"
                                title="Visualizar"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(documento)}
                              className="h-6 w-6 p-0 hover:bg-green-50"
                              title="Download"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(documento.id, nomeArquivo)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                              title="Remover"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
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
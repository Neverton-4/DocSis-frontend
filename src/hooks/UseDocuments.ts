import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listarDocumentos,
  uploadDocumento,
  deletarDocumento,
  ProcessoDocumento
} from '@/services/processoDocumentoService';
import {
  listarAnexos,
  uploadAnexo,
  deletarAnexo,
  downloadAnexo,
  ProcessoAnexo
} from '@/services/processoAnexoService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useDocuments = (processoId: number) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { user } = useAuth();

  // Query para buscar documentos
  const {
    data: documentos,
    isLoading: isLoadingDocumentos,
    error: errorDocumentos,
    refetch: refetchDocumentos
  } = useQuery({
    queryKey: ['processo-documentos', processoId],
    queryFn: () => listarDocumentos(processoId),
    enabled: !!processoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar anexos
  const {
    data: anexos,
    isLoading: isLoadingAnexos,
    error: errorAnexos,
    refetch: refetchAnexos
  } = useQuery({
    queryKey: ['processo-anexos', processoId],
    queryFn: () => listarAnexos(processoId),
    enabled: !!processoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const isLoading = isLoadingDocumentos || isLoadingAnexos;
  const error = errorDocumentos || errorAnexos;
  const refetch = () => {
    refetchDocumentos();
    refetchAnexos();
  };

  // Mutation para upload de documentos
  const uploadMutation = useMutation({
    mutationFn: uploadDocumento,
    onMutate: () => {
      setIsUploading(true);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['documentos', processoId], (oldData: Documento[] | undefined) => {
        return oldData ? [...oldData, data] : [data];
      });
      
      toast({
        title: "Sucesso",
        description: `Documento "${variables.file.name}" enviado com sucesso!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Upload",
        description: error.response?.data?.message || "Erro ao enviar documento",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Mutation para deletar documento
  const deleteMutation = useMutation({
    mutationFn: deletarDocumento,
    onMutate: async (documentoId: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['documentos', processoId] });

      // Snapshot the previous value
      const previousDocumentos = queryClient.getQueryData(['documentos', processoId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['documentos', processoId], (old: Documento[] | undefined) => {
        return old ? old.filter(doc => doc.id !== documentoId) : [];
      });

      // Return a context with the previous and new data
      return { previousDocumentos };
    },
    onError: (error: any, documentoId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousDocumentos) {
        queryClient.setQueryData(['documentos', processoId], context.previousDocumentos);
      }
      
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao remover documento",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso!",
      });
    }
  });

  // Função para upload múltiplo
  const uploadMultipleFiles = async (files: FileList, departamentoId?: number) => {
    const uploadPromises = Array.from(files).map(file => 
      uploadMutation.mutateAsync({
        file,
        processo_id: processoId,
        departamento_id: departamentoId
      })
    );

    try {
      await Promise.all(uploadPromises);
      setSelectedFiles(null);
      
      toast({
        title: "Sucesso",
        description: `${files.length} documento(s) enviado(s) com sucesso!`,
      });
    } catch (error) {
      // Erros individuais já são tratados na mutation
    }
  };

  // Função para download
//   const downloadDocument = async (documento: Documento) => {
//     try {
//       const blob = await downloadDocumento(documento.id);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = documento.nome;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       toast({
//         title: "Download",
//         description: "Documento baixado com sucesso",
//         variant: "default",
//       });
//     } catch (error) {
//       console.error('Erro ao baixar documento:', error);
//       toast({
//         title: "Erro",
//         description: "Erro ao baixar documento",
//         variant: "destructive",
//       });
//     }
//   };

  return {
    isUploading,
    selectedFiles,
    setSelectedFiles,
    uploadDocuments,
    // downloadDocument
  };
};
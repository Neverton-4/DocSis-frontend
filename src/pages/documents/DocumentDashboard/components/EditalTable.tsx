import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Eye, 
  ArrowRight, 
  Download,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Tipo temporário para Edital - deve ser definido em types/index.ts
interface Edital {
  id: number;
  numero: string;
  ano: number;
  servidor_nome?: string;
  servidor?: {
    nome_completo: string;
  };
  tipo_nome?: string;
  tipo_edital?: {
    nome: string;
  };
  data_edital: string;
  status: string;
  status_novo?: string;
}

interface EditalTableProps {
  editais: Edital[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
}

export const EditalTable: React.FC<EditalTableProps> = ({
  editais,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editalToDelete, setEditalToDelete] = useState<Edital | null>(null);
  const [tramitarDialogOpen, setTramitarDialogOpen] = useState(false);
  const [editalToTramitar, setEditalToTramitar] = useState<Edital | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'rascunho': 'Rascunho',
      'aguardando_assinatura': 'Aguardando Assinatura',
      'assinado': 'Assinado',
      'publicado': 'Publicado',
      'arquivado': 'Arquivado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'rascunho': 'bg-gray-500',
      'aguardando_assinatura': 'bg-yellow-500',
      'assinado': 'bg-blue-500',
      'publicado': 'bg-green-500',
      'arquivado': 'bg-red-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const handleDeleteClick = (e: React.MouseEvent, edital: Edital) => {
    e.stopPropagation();
    setEditalToDelete(edital);
    setDeleteDialogOpen(true);
  };

  const handleTramitarClick = (e: React.MouseEvent, edital: Edital) => {
    e.stopPropagation();
    setEditalToTramitar(edital);
    setTramitarDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!editalToDelete) return;
    
    setIsUpdating(true);
    try {
      // Implementar lógica de exclusão aqui
      onRefetch();
    } catch (error) {
      // Falha ao excluir edital
    } finally {
      setIsUpdating(false);
      setDeleteDialogOpen(false);
      setEditalToDelete(null);
    }
  };

  const handleConfirmTramitacao = async (novoStatus: string) => {
    if (!editalToTramitar) return;
    
    setIsUpdating(true);
    try {
      // Implementar lógica de tramitação aqui
      onRefetch();
    } catch (error) {
      // Falha ao tramitar edital
    } finally {
      setIsUpdating(false);
      setTramitarDialogOpen(false);
      setEditalToTramitar(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-2 py-3 text-center text-sm font-medium text-white w-20">#</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-80">Nome do Servidor</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Tipo de Edital</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Data do Edital</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {editais.map((edital) => (
              <tr 
                key={edital.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/documentos/viewer/edital/${edital.id}`)}
              >
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium w-20">
                  {edital.numero}/{edital.ano}
                </td>
                <td className="px-4 py-3 text-sm text-center w-80">
                  {edital.servidor_nome || edital.servidor?.nome_completo || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {edital.tipo_nome || edital.tipo_edital?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {new Date(edital.data_edital).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(edital.status_novo || edital.status)} text-white`}
                    >
                      {formatStatus(edital.status_novo || edital.status)}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implementar download
                          }}
                        >
                          <Download className="h-4 w-4 text-green-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleTramitarClick(e, edital)}
                        >
                          <ArrowRight className="h-4 w-4 text-orange-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tramitar</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleDeleteClick(e, edital)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Dialog de Tramitação */}
      <AlertDialog open={tramitarDialogOpen} onOpenChange={setTramitarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tramitar Edital</AlertDialogTitle>
            <AlertDialogDescription>
              Edital {editalToTramitar?.numero}/{editalToTramitar?.ano} - {editalToTramitar?.servidor?.nome_completo}
              <br />
              Status atual: <strong>{formatStatus(editalToTramitar?.status_novo || editalToTramitar?.status || '')}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Button
              variant="outline"
              onClick={() => handleConfirmTramitacao('aguardando_assinatura')}
              disabled={isUpdating}
              className="justify-start"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Enviar para Assinatura'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfirmTramitacao('assinado')}
              disabled={isUpdating}
              className="justify-start"
            >
              Marcar como Assinado
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfirmTramitacao('publicado')}
              disabled={isUpdating}
              className="justify-start"
            >
              Publicar
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o edital {editalToDelete?.numero}/{editalToDelete?.ano} - {editalToDelete?.servidor?.nome_completo || 'N/A'}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
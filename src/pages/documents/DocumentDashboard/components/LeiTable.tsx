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

// Tipo temporário para Lei - deve ser definido em types/index.ts
interface Lei {
  id: number;
  numero: string;
  ano: number;
  servidor_nome?: string;
  servidor?: {
    nome_completo: string;
  };
  tipo_nome?: string;
  tipo_lei?: {
    nome: string;
  };
  data_lei: string;
  status: string;
  status_novo?: string;
}

interface LeiTableProps {
  leis: Lei[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
}

export const LeiTable: React.FC<LeiTableProps> = ({
  leis,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leiToDelete, setLeiToDelete] = useState<Lei | null>(null);
  const [tramitarDialogOpen, setTramitarDialogOpen] = useState(false);
  const [leiToTramitar, setLeiToTramitar] = useState<Lei | null>(null);
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

  const handleDeleteClick = (e: React.MouseEvent, lei: Lei) => {
    e.stopPropagation();
    setLeiToDelete(lei);
    setDeleteDialogOpen(true);
  };

  const handleTramitarClick = (e: React.MouseEvent, lei: Lei) => {
    e.stopPropagation();
    setLeiToTramitar(lei);
    setTramitarDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!leiToDelete) return;
    
    setIsUpdating(true);
    try {
      // Implementar lógica de exclusão aqui
      onRefetch();
    } catch (error) {
      // Falha ao excluir lei
    } finally {
      setIsUpdating(false);
      setDeleteDialogOpen(false);
      setLeiToDelete(null);
    }
  };

  const handleConfirmTramitacao = async (novoStatus: string) => {
    if (!leiToTramitar) return;
    
    setIsUpdating(true);
    try {
      // Implementar lógica de tramitação aqui
      onRefetch();
    } catch (error) {
      // Falha ao tramitar lei
    } finally {
      setIsUpdating(false);
      setTramitarDialogOpen(false);
      setLeiToTramitar(null);
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
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Tipo de Lei</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Data da Lei</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leis.map((lei) => (
              <tr 
                key={lei.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/documentos/viewer/lei/${lei.id}`)}
              >
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium w-20">
                  {lei.numero}/{lei.ano}
                </td>
                <td className="px-4 py-3 text-sm text-center w-80">
                  {lei.servidor_nome || lei.servidor?.nome_completo || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {lei.tipo_nome || lei.tipo_lei?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {new Date(lei.data_lei).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(lei.status_novo || lei.status)} text-white`}
                    >
                      {formatStatus(lei.status_novo || lei.status)}
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
                          onClick={(e) => handleTramitarClick(e, lei)}
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
                          onClick={(e) => handleDeleteClick(e, lei)}
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
            <AlertDialogTitle>Tramitar Lei</AlertDialogTitle>
            <AlertDialogDescription>
              Lei {leiToTramitar?.numero}/{leiToTramitar?.ano} - {leiToTramitar?.servidor?.nome_completo}
              <br />
              Status atual: <strong>{formatStatus(leiToTramitar?.status_novo || leiToTramitar?.status || '')}</strong>
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
              Tem certeza que deseja excluir a lei {leiToDelete?.numero}/{leiToDelete?.ano} - {leiToDelete?.servidor?.nome_completo || 'N/A'}?
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
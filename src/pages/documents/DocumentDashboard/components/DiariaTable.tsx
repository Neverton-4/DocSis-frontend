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
import { Diaria } from '@/services/diariaService';
import { useDiariaOperations } from '../hooks/useDiariaOperations';
import { toast } from 'sonner';

// Tipo temporário para Diária - deve ser definido em types/index.ts
// Removido pois agora usamos o tipo do serviço

interface DiariaTableProps {
  diarias: Diaria[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
}

export const DiariaTable: React.FC<DiariaTableProps> = ({
  diarias,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch
}) => {
  const navigate = useNavigate();
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    diariaToDelete,
    tramitarDialogOpen,
    setTramitarDialogOpen,
    diariaToTramitar,
    isUpdating,
    formatStatus,
    getStatusColor,
    getTramitacaoOptions,
    handleTramitarClick,
    handleDeleteClick,
    handleConfirmTramitacao,
    handleConfirmDelete,
  } = useDiariaOperations();

  const formatTipoServidor = (tipo: string) => {
    const tipoMap: { [key: string]: string } = {
      'servidor': 'Servidor',
      'secretario': 'Secretário',
      'prefeito': 'Prefeito e Vice-Prefeito',
      'conselheiro': 'Conselheiro'
    };
    return tipoMap[tipo] || tipo;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-2 py-3 text-center text-sm font-medium text-white w-20">#</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Título</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Tipo de Servidor</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Data da Diária</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-24">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {diarias.map((diaria) => (
              <tr 
                key={diaria.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/documentos/viewer/diaria/${diaria.id}`)}
              >
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium w-20">
                  {diaria.numero}/{diaria.ano}
                </td>
                <td className="px-4 py-3 text-sm text-left">
                  {(diaria as any).titulo || `Diária - ${formatTipoServidor(diaria.tipo_servidor) || 'Tipo não informado'}`}
                </td>
                <td className="px-4 py-3 text-sm text-center w-32">
                  {formatTipoServidor(diaria.tipo_servidor) || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center w-32">
                  {diaria.data_diaria ? new Date(diaria.data_diaria).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm w-24">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(diaria.status_novo || diaria.status!)} text-white`}
                    >
                      {formatStatus(diaria.status_novo || diaria.status!)}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 w-32">
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
                          onClick={(e) => handleTramitarClick(e, diaria)}
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
                          onClick={(e) => handleDeleteClick(e, diaria)}
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
            <AlertDialogTitle>Tramitar Diária</AlertDialogTitle>
            <AlertDialogDescription>
              Diária {diariaToTramitar?.numero}/{diariaToTramitar?.ano} - {diariaToTramitar?.servidor?.nome_completo}
              <br />
              Status atual: <strong>{formatStatus(diariaToTramitar?.status_novo || diariaToTramitar?.status || '')}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {getTramitacaoOptions(diariaToTramitar?.status_novo || diariaToTramitar?.status || '').map((option) => (
              <Button
                key={option.value}
                variant="outline"
                onClick={() => handleConfirmTramitacao(option.value, onRefetch)}
                disabled={isUpdating}
                className="justify-start"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  option.label
                )}
              </Button>
            ))}
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
              Tem certeza que deseja excluir a diária {diariaToDelete?.numero}/{diariaToDelete?.ano} - {diariaToDelete?.servidor?.nome_completo || 'N/A'}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleConfirmDelete(onRefetch)}
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
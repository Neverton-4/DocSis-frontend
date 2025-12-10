import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Trash,
  Download
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
import { Portaria } from '@/types';
import { useDecretoOperations } from '../hooks/useDecretoOperations';
import { DecretoDownloadDialog } from './DecretoDownloadDialog';

interface DecretoTableProps {
  decretos: Portaria[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
}

export const DecretoTable: React.FC<DecretoTableProps> = ({
  decretos,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch
}) => {
  const navigate = useNavigate();
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [decretoToDownload, setDecretoToDownload] = useState<Portaria | null>(null);
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    decretoToDelete,
    tramitarDialogOpen,
    setTramitarDialogOpen,
    decretoToTramitar,
    isUpdating,
    formatStatus,
    getStatusColor,
    getTramitacaoOptions,
    handleTramitarClick,
    handleDeleteClick,
    handleConfirmTramitacao,
    handleConfirmDelete
  } = useDecretoOperations();

  const handleDownloadClick = (e: React.MouseEvent, decreto: Portaria) => {
    e.stopPropagation();
    setDecretoToDownload(decreto);
    setDownloadDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-2 py-3 text-center text-sm font-medium text-white w-20">#</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Título</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Tipo de Decreto</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Data do Decreto</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-24">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {decretos.map((decreto) => (
              <tr 
                key={decreto.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/documentos/viewer/decreto/${decreto.id}`)}
              >
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium w-20">
                  {decreto.numero}/{decreto.ano}
                </td>
                <td className="px-4 py-3 text-sm text-left">
                  {(decreto as any).titulo || `${decreto.tipo_nome || (decreto as any)?.tipo_decreto?.nome || 'Tipo não informado'}${(decreto as any).subtipo_nome ? ` - ${(decreto as any).subtipo_nome}` : ''}`}
                </td>
                <td className="px-4 py-3 text-sm text-center w-32">
                  {decreto.tipo_nome || (decreto as any)?.tipo_decreto?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center w-32">
                  {new Date(decreto.data_portaria).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm w-24">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(decreto.status_novo || decreto.status)} text-white`}
                    >
                      {formatStatus(decreto.status_novo || decreto.status)}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 w-32">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleDownloadClick(e, decreto)}
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
                          onClick={(e) => handleTramitarClick(e, decreto)}
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
                          onClick={(e) => handleDeleteClick(e, decreto)}
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
            <AlertDialogTitle>Tramitar Decreto</AlertDialogTitle>
            <AlertDialogDescription>
              Decreto {decretoToTramitar?.numero}/{decretoToTramitar?.ano} - {decretoToTramitar?.servidor?.nome_completo || decretoToTramitar?.servidor_nome}
              <br />
              Status atual: <strong>{formatStatus(decretoToTramitar?.status_novo || decretoToTramitar?.status || '')}</strong>
              <br /><br />
              Escolha a próxima ação:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {decretoToTramitar && getTramitacaoOptions(decretoToTramitar.status_novo || decretoToTramitar.status || '').map((opcao) => (
              <Button
                key={opcao.value}
                variant="outline"
                onClick={() => handleConfirmTramitacao(opcao.value, onRefetch)}
                disabled={isUpdating}
                className="justify-start"
              >
                {opcao.label}
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Download */}
      <DecretoDownloadDialog
        isOpen={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        decreto={decretoToDownload}
      />

      {/* Dialog de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o decreto {decretoToDelete?.numero}/{decretoToDelete?.ano} - {decretoToDelete?.servidor?.nome_completo || decretoToDelete?.servidor_nome || 'N/A'}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
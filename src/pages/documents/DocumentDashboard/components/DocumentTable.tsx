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
import { Portaria } from '@/types';
import { useDocumentOperations } from '../hooks';
import { DownloadDialog } from './DownloadDialog';

interface DocumentTableProps {
  portarias: Portaria[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  portarias,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch
}) => {
  const navigate = useNavigate();
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [portariaToDownload, setPortariaToDownload] = useState<Portaria | null>(null);
  
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    portariaToDelete,
    tramitarDialogOpen,
    setTramitarDialogOpen,
    portariaToTramitar,
    isUpdating,
    formatStatus,
    getStatusColor,
    getTramitacaoOptions,
    handleVisualizarClick,
    handleEditClick,
    handleTramitarClick,
    handleDeleteClick,
    handleConfirmTramitacao,
    handleConfirmDelete
  } = useDocumentOperations();

  const handleDownloadClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    setPortariaToDownload(portaria);
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
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Tipo de Portaria</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Data da Portaria</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-24">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {portarias.map((portaria) => (
              <tr 
                key={portaria.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/documentos/viewer/portaria/${portaria.id}`)}
              >
                <td className="px-2 py-3 text-sm text-center text-gray-900 font-medium w-20">
                  {portaria.numero}/{portaria.ano}
                </td>
                <td className="px-4 py-3 text-sm text-left">
                  {portaria.titulo || `${portaria.tipo_nome || portaria.tipo_portaria?.nome || 'Tipo não informado'}${portaria.subtipo_nome ? ` - ${portaria.subtipo_nome}` : ''}`}
                </td>
                <td className="px-4 py-3 text-sm text-center w-32">
                  {portaria.tipo_nome || portaria.tipo_portaria?.nome || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-center w-32">
                  {new Date(portaria.data_portaria).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm w-24">
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(portaria.status_novo || portaria.status)} text-white`}
                    >
                      {formatStatus(portaria.status_novo || portaria.status)}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 w-32">
                  <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleDownloadClick(e, portaria)}
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
                          onClick={(e) => handleTramitarClick(e, portaria)}
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
                          onClick={(e) => handleDeleteClick(e, portaria)}
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
            <AlertDialogTitle>Tramitar Portaria</AlertDialogTitle>
            <AlertDialogDescription>
              Portaria {portariaToTramitar?.numero}/{portariaToTramitar?.ano} - {portariaToTramitar?.servidor?.nome_completo}
              <br />
              Status atual: <strong>{formatStatus(portariaToTramitar?.status_novo || portariaToTramitar?.status || '')}</strong>
              <br /><br />
              Escolha a próxima ação:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {portariaToTramitar && (() => {
              const statusFinal = portariaToTramitar.status_novo || portariaToTramitar.status;
              const opcoes = getTramitacaoOptions(statusFinal);
              return opcoes;
            })().map((opcao) => (
              <Button
                key={opcao.value}
                variant="outline"
                onClick={() => handleConfirmTramitacao(opcao.value, onRefetch)}
                disabled={isUpdating}
                className="justify-start"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  opcao.label
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
              Tem certeza que deseja excluir a portaria {portariaToDelete?.numero}/{portariaToDelete?.ano} - {portariaToDelete?.servidor?.nome_completo || 'N/A'}?
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

      {/* Dialog de Download */}
      <DownloadDialog
        isOpen={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        portaria={portariaToDownload}
      />

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
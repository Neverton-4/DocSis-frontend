import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ServidorTabela } from '@/types';
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

interface ServidoresTableProps {
  servidores?: ServidorTabela[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  redirectPath?: string;
}

export const ServidoresTable: React.FC<ServidoresTableProps> = ({
  servidores = [],
  currentPage,
  setCurrentPage,
  totalPages,
  redirectPath = '/servidor'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servidorToDelete, setServidorToDelete] = useState<ServidorTabela | null>(null);

  const formatTipoServidor = (tipo: string) => {
    switch (tipo) {
      case 'efetivo':
        return 'Efetivo';
      case 'comissionado':
        return 'Comissionado';
      case 'contratado':
        return 'Contratado';
      case 'terceirizado':
        return 'Terceirizado';
      default:
        return tipo;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'licenca':
        return 'Em Licença';
      case 'aposentado':
        return 'Aposentado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500';
      case 'inativo':
        return 'bg-red-500';
      case 'licenca':
        return 'bg-yellow-500';
      case 'aposentado':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRowClick = (servidor: ServidorTabela) => {
    navigate(`${redirectPath}/${servidor.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, servidor: ServidorTabela) => {
    e.stopPropagation();
    setServidorToDelete(servidor);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (servidorToDelete) {
      console.log('Deletando servidor:', servidorToDelete.id);
      // Implementar a lógica de deleção aqui
    }
    setDeleteDialogOpen(false);
    setServidorToDelete(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Nome</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Cargo</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Tipo de Servidor</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Secretaria</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servidores && servidores.length > 0 ? servidores.map((servidor) => (
              <tr 
                key={servidor.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(servidor)}
              >
                <td className="px-4 py-3 text-sm text-center">{servidor.nome_completo}</td>
                <td className="px-4 py-3 text-sm text-center">{servidor.cargo_principal || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-center">{servidor.tipo_servidor_nome || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-center">{servidor.secretaria || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(servidor.status)} mr-2`}></span>
                    {formatStatus(servidor.status)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(servidor);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Detalhes</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleDeleteClick(e, servidor)}
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
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nenhum servidor encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o servidor {servidorToDelete?.nome_completo}?
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
      
      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            &lt;&lt;
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            &lt;
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage - 2 + i;
            if (page > 0 && page <= totalPages) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            }
            return null;
          })}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            &gt;
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServidoresTable;
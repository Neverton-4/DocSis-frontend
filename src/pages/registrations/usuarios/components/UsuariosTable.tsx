import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, Trash, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
import usuarioService from '@/services/usuarioService';
import { UsuarioTabela } from '../hooks/useUsuariosDashboard';

interface UsuariosTableProps {
  usuarios?: UsuarioTabela[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  sortField?: 'nome' | 'cargo' | 'secretaria';
  sortDirection?: 'asc' | 'desc';
  onToggleSort?: (field: 'nome' | 'cargo' | 'secretaria') => void;
  onDeleted?: () => void;
}

const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios = [],
  currentPage,
  setCurrentPage,
  totalPages,
  sortField,
  sortDirection,
  onToggleSort,
  onDeleted
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<UsuarioTabela | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, usuario: Usuario) => {
    e.stopPropagation();
    setUsuarioToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (usuarioToDelete?.id) {
      try {
        await usuarioService.delete(usuarioToDelete.id);
        onDeleted?.();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
    setDeleteDialogOpen(false);
    setUsuarioToDelete(null);
  };

  const SortIcon = ({ field }: { field: 'nome' | 'cargo' | 'secretaria' }) => {
    if (!sortField || sortField !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="inline h-3.5 w-3.5 ml-1" />
    ) : (
      <ArrowDown className="inline h-3.5 w-3.5 ml-1" />
    );
  };

  const handleRowClick = (usuario: UsuarioTabela) => {
    navigate(`/cadastros/usuarios/${usuario.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th
                className="px-4 py-3 text-center text-sm font-medium text-white cursor-pointer select-none"
                onClick={() => onToggleSort?.('nome')}
                aria-sort={sortField === 'nome' ? sortDirection : 'none'}
              >
                Nome do Usuário
                <SortIcon field="nome" />
              </th>
              <th
                className="px-4 py-3 text-center text-sm font-medium text-white cursor-pointer select-none"
                onClick={() => onToggleSort?.('cargo')}
                aria-sort={sortField === 'cargo' ? sortDirection : 'none'}
              >
                Cargo
                <SortIcon field="cargo" />
              </th>
              <th
                className="px-4 py-3 text-center text-sm font-medium text-white cursor-pointer select-none"
                onClick={() => onToggleSort?.('secretaria')}
                aria-sort={sortField === 'secretaria' ? sortDirection : 'none'}
              >
                Secretaria
                <SortIcon field="secretaria" />
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios && usuarios.length > 0 ? usuarios.map((usuario) => (
              <tr
                key={usuario.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(usuario)}
              >
                <td className="px-4 py-3 text-sm text-center">{usuario.nome}</td>
                <td className="px-4 py-3 text-sm text-center">{usuario.cargo || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-center">{usuario.secretaria_nome || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-center">{usuario.status}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(usuario);
                          }}
                          aria-label={`Ver usuário ${usuario.nome}`}
                        >
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Visualizar</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cadastros/usuarios/${usuario.id}?edit=1`);
                          }}
                          aria-label={`Editar usuário ${usuario.nome}`}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={(e) => handleDeleteClick(e, usuario)}
                          aria-label={`Excluir usuário ${usuario.nome}`}
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
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Nenhum usuário encontrado
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
              Tem certeza que deseja excluir o usuário {usuarioToDelete?.nome}? Esta ação não pode ser desfeita.
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

export default UsuariosTable;
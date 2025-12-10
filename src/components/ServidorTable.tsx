import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, Trash } from 'lucide-react';
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
import { Servidor, TipoServidorEnum, StatusServidorEnum } from '@/services/servidorService';

interface ServidorTableProps {
  servidores: Servidor[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export const ServidorTable: React.FC<ServidorTableProps> = ({
  servidores,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servidorToDelete, setServidorToDelete] = useState<Servidor | null>(null);

  const formatTipoServidor = (tipo: TipoServidorEnum) => {
    switch (tipo) {
      case TipoServidorEnum.EFETIVO:
        return 'Efetivo';
      case TipoServidorEnum.COMISSIONADO:
        return 'Comissionado';
      case TipoServidorEnum.CONTRATADO:
        return 'Contratado';
      case TipoServidorEnum.ESTAGIARIO:
        return 'Estagiário';
      case TipoServidorEnum.TERCEIRIZADO:
        return 'Terceirizado';
      default:
        return tipo;
    }
  };

  const formatStatus = (status: StatusServidorEnum) => {
    switch (status) {
      case StatusServidorEnum.ATIVO:
        return 'Ativo';
      case StatusServidorEnum.INATIVO:
        return 'Inativo';
      case StatusServidorEnum.LICENCA:
        return 'Licença';
      case StatusServidorEnum.APOSENTADO:
        return 'Aposentado';
      case StatusServidorEnum.EXONERADO:
        return 'Exonerado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: StatusServidorEnum) => {
    switch (status) {
      case StatusServidorEnum.ATIVO:
        return 'bg-green-500';
      case StatusServidorEnum.INATIVO:
        return 'bg-gray-500';
      case StatusServidorEnum.LICENCA:
        return 'bg-yellow-500';
      case StatusServidorEnum.APOSENTADO:
        return 'bg-blue-500';
      case StatusServidorEnum.EXONERADO:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRowClick = (servidor: Servidor) => {
    navigate(`/servidor/${servidor.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, servidor: Servidor) => {
    e.stopPropagation();
    setServidorToDelete(servidor);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, servidor: Servidor) => {
    e.stopPropagation();
    navigate(`/servidor/${servidor.id}/editar`);
  };

  const handleViewClick = (e: React.MouseEvent, servidor: Servidor) => {
    e.stopPropagation();
    navigate(`/servidor/${servidor.id}`);
  };

  const confirmDelete = async () => {
    if (servidorToDelete) {
      try {
        // Aqui você implementaria a lógica de exclusão
        console.log('Excluindo servidor:', servidorToDelete.id);
        setDeleteDialogOpen(false);
        setServidorToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir servidor:', error);
      }
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome Completo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Admissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servidores.map((servidor) => (
                <tr
                  key={servidor.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(servidor)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {servidor.nome_completo}
                    </div>
                    {servidor.email && (
                      <div className="text-sm text-gray-500">
                        {servidor.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCPF(servidor.cpf)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTipoServidor(servidor.tipo_servidor)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {servidor.cargo?.nome || servidor.cargo_2?.nome || (
                      <span className="text-gray-400 text-xs">Nenhum cargo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                      <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor(servidor.status)}`}
                      ></span>
                      {formatStatus(servidor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {servidor.data_admissao ? formatDate(servidor.data_admissao) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleViewClick(e, servidor)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualizar servidor</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleEditClick(e, servidor)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar servidor</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleDeleteClick(e, servidor)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir servidor</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{currentPage}</span> de{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o servidor "{servidorToDelete?.nome_completo}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServidorTable;
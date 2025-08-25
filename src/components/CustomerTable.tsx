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

export interface Processo {
  id: number;
  descricao: string;
  tipo_processo: string;
  status: string;
  created_at: string;
  servidor: {
    id: number;
    nome_completo: string;
    matricula: string;
    cpf: string;
  };
}

interface CustomerTableProps {
  processos: Processo[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  processos,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);

  const formatTipoProcesso = (tipo: string) => {
    switch (tipo) {
      case 'licenca':
        return 'Licença';
      case 'declaracao_de_tempo_servico':
        return 'Declaração de Tempo de Serviço';
      case 'gratificacao':
        return 'Gratificação';
      case 'outro':
        return 'Outro';
      default:
        return tipo;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500';
      case 'pendente':
        return 'bg-yellow-500';
      case 'em_andamento':
        return 'bg-blue-500';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleRowClick = (processo: Processo) => {
    navigate(`/protocolo/${processo.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, processo: Processo) => {
    e.stopPropagation();
    setProcessoToDelete(processo);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (processoToDelete) {
      console.log('Deletando processo:', processoToDelete.id);
      // Implementar a lógica de deleção aqui
    }
    setDeleteDialogOpen(false);
    setProcessoToDelete(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-4 py-3 text-center text-sm font-medium text-white">#</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Nome do Servidor</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Tipo de Processo</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Data de Criação</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {processos.map((processo) => (
              <tr 
                key={processo.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(processo)}
              >
                <td className="px-4 py-3 text-sm text-center text-gray-500">{processo.id}</td>
                <td className="px-4 py-3 text-sm text-center">{processo.servidor?.nome_completo || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-center">{formatTipoProcesso(processo.tipo_processo)}</td>
                <td className="px-4 py-3 text-sm text-center">{new Date(processo.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(processo.status)} mr-2`}></span>
                    {formatStatus(processo.status)}
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
                            handleRowClick(processo);
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
                          onClick={(e) => handleDeleteClick(e, processo)}
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
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o processo {processoToDelete?.id} - {processoToDelete?.servidor?.nome_completo || 'N/A'}?
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

export default CustomerTable;

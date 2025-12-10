import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface Processo {
  id: number;
  numero: string;
  ano: number;
  descricao: string;
  tipo_processo: string;
  status: string;
  created_at: string;
  nome_interessado?: string;
  status_dpto?: string;
  servidor: {
    id: number;
    nome_completo: string;
    matricula: string;
    cpf: string;
  };
}

interface CustomerTableProps {
  processos?: Processo[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  redirectPath?: string; // Nova prop para customizar o caminho de redirecionamento
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  processos = [],
  currentPage,
  setCurrentPage,
  totalPages,
  redirectPath = '/processo' // Valor padrão para manter compatibilidade
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    navigate(`${redirectPath}/${processo.id}`);
  };



  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Protocolo</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Nome do Interessado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Tipo de Processo</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Data de Criação</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status da Etapa</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-white">Status do Processo</th>
            </tr>
          </thead>
          <tbody>
            {processos && processos.length > 0 ? processos.map((processo) => (
              <tr 
                key={processo.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(processo)}
              >
                <td className="px-4 py-3 text-sm text-center text-gray-500">{processo.numero}/{processo.ano}</td>
                <td className="px-4 py-3 text-sm text-center">{processo.nome_interessado || processo.servidor?.nome_completo || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-center">{formatTipoProcesso(processo.tipo_processo)}</td>
                <td className="px-4 py-3 text-sm text-center">{new Date(processo.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm text-center">{processo.status_dpto || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(processo.status)} mr-2`}></span>
                    {formatStatus(processo.status)}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Nenhum processo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      
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

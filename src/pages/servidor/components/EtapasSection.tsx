import React from 'react';
import { Card } from '@/components/ui/card-component';
import { CheckCircle, Clock, XCircle, AlertCircle, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { departamentoService } from '@/services/departamentoService';

interface Etapa {
  id: number;
  departamento_id: number;
  observacao: string;
  etapa_status: string;
  data_inicio: string;
  data_fim?: string;
}

interface EtapasSectionProps {
  processoId: number;
  etapas?: Etapa[];
  isLoadingEtapas: boolean;
  errorEtapas: any;
}

const EtapasSection: React.FC<EtapasSectionProps> = ({ 
  processoId, 
  etapas, 
  isLoadingEtapas, 
  errorEtapas 
}) => {
  // Buscar departamentos
  const { data: departamentos } = useQuery({
    queryKey: ['departamentos'],
    queryFn: departamentoService.getAll
  });

  // Função para obter nome do departamento
  const getDepartamentoNome = (departamentoId: number) => {
    const departamento = departamentos?.find(d => d.id === departamentoId);
    return departamento?.nome || `Departamento ${departamentoId}`;
  };

  // Função para obter ícone e cor baseado no status
  const getStatusIconAndColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'concluido':
      case 'finalizado':
      case 'aprovado':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'em_andamento':
      case 'processando':
      case 'ativo':
        return { 
          icon: Play, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'pendente':
      case 'aguardando':
        return { 
          icon: Clock, 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'rejeitado':
      case 'cancelado':
      case 'negado':
        return { 
          icon: XCircle, 
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não definida';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    if (!status) return '';
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  if (isLoadingEtapas) {
    return (
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Etapas do Processo</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando etapas...</span>
        </div>
      </Card>
    );
  }

  if (errorEtapas) {
    return (
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">Etapas do Processo</h3>
        <div className="text-center py-8">
          <p className="text-red-600">Erro ao carregar etapas do processo</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">Etapas do Processo</h3>
      
      {!etapas || etapas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma etapa encontrada para este processo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {etapas.map((etapa, index) => {
            const { icon: StatusIcon, color, bgColor } = getStatusIconAndColor(etapa.etapa_status);
            
            return (
              <div key={etapa.id} className={`p-4 rounded-lg border ${bgColor}`}>
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 mt-0.5 ${color}`} />
                  <div className="flex-1">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Departamento:</span>
                        <span className="ml-2 text-gray-900">{getDepartamentoNome(etapa.departamento_id)}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Observação:</span>
                        <span className="ml-2 text-gray-900">{etapa.observacao || 'Sem observações'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`font-medium ${color}`}>
                          {formatStatus(etapa.etapa_status)}
                        </span>
                        <span className="text-gray-500">-</span>
                        <span className="text-sm text-gray-600">
                          {formatDate(etapa.data_inicio)}
                        </span>
                        <span className="text-gray-500">-</span>
                        <span className="text-sm text-gray-600">
                          {etapa.data_fim ? formatDate(etapa.data_fim) : 'Em andamento'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < etapas.length - 1 && (
                  <div className="mt-4 border-b border-gray-200"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default EtapasSection;
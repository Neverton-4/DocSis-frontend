import React from 'react';
import { Card } from '@/components/ui/card-component';
import { ProcessoEtapa } from '@/services/processoEtapaService';

interface ProcessStepsProps {
  etapas: ProcessoEtapa[] | undefined;
  isLoading: boolean;
  error: any;
}

const ProcessSteps: React.FC<ProcessStepsProps> = ({ etapas, isLoading, error }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500';
      case 'em_andamento':
        return 'bg-blue-500';
      case 'pendente':
        return 'bg-gray-300';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'em_andamento':
        return 'Em andamento';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">Etapas do Processo</h2>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Carregando etapas...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Erro ao carregar etapas</div>
        ) : etapas && etapas.length > 0 ? (
          etapas.sort((a, b) => a.ordem - b.ordem).map((etapa) => (
            <div key={etapa.id} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(etapa.etapa_status)} mt-2`}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                  {etapa.departamento_nome || 'Departamento não definido'}
                </p>
                  {etapa.etapa_final && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Final
                    </span>
                  )}
                </div>
                {etapa.observacao && (
                  <p className="text-sm text-gray-500">{etapa.observacao}</p>
                )}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">
                    {getStatusText(etapa.etapa_status)}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-400">
                      Início: {formatDate(etapa.data_inicio)}
                    </span>
                    {etapa.data_fim && (
                      <span className="text-xs text-gray-400">
                        Fim: {formatDate(etapa.data_fim)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">Nenhuma etapa registrada</div>
        )}
      </div>
    </Card>
  );
};

export default ProcessSteps;
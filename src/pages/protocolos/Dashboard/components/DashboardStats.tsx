import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card-component';
import { Processo } from '@/components/CustomerTable';

interface DashboardStatsProps {
  processos: Processo[];
  showStats: boolean;
  setShowStats: (show: boolean) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ processos, showStats, setShowStats }) => {
  const getStatusCount = (status: string) => {
    return processos.filter(p => p.status === status).length;
  };

  const totalProcessos = processos.length;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Esconder estatísticas
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Expandir estatísticas
            </>
          )}
        </Button>
      </div>

      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Total de Processos</span>
              <span className="text-lg font-bold">{totalProcessos}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Em Andamento</span>
              <span className="text-lg font-bold text-blue-500">
                {getStatusCount('em_andamento')}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Concluídos</span>
              <span className="text-lg font-bold text-green-500">
                {getStatusCount('concluido')}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Cancelados</span>
              <span className="text-lg font-bold text-red-500">
                {getStatusCount('cancelado')}
              </span>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default DashboardStats;
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Portaria } from '@/types';

interface DocumentStatsProps {
  portarias: Portaria[];
  showStats: boolean;
  setShowStats: (show: boolean) => void;
}

export const DocumentStats: React.FC<DocumentStatsProps> = ({ 
  portarias, 
  showStats, 
  setShowStats 
}) => {
  const totalPortarias = portarias.length;
  const pendentes = portarias.filter(p => p.status === 'criado').length;
  const emAndamento = portarias.filter(p => 
    p.status === 'revisado' || p.status === 'aguardando_assinatura'
  ).length;
  const concluidas = portarias.filter(p => 
    p.status === 'assinado' || p.status === 'publicado'
  ).length;

  return (
    <>
      <div className="flex justify-end mb-2">
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
              <span className="text-sm font-medium">Total de Portarias</span>
              <span className="text-lg font-bold">{totalPortarias}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Pendentes</span>
              <span className="text-lg font-bold text-yellow-500">{pendentes}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Em Andamento</span>
              <span className="text-lg font-bold text-blue-500">{emAndamento}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium">Concluídas</span>
              <span className="text-lg font-bold text-green-500">{concluidas}</span>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
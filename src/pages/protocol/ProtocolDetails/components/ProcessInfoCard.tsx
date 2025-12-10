import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import ServerInfo from './ServerInfo';
import ProcessInfo from './ProcessInfo';

interface ProcessInfoCardProps {
  processo: Processo;
  onVoltar: () => void;
  onEncaminhar: () => void;
  onComprovante: () => void;
  onParecer: () => void;
  onDeclaracao: () => void;
}

const ProcessInfoCard: React.FC<ProcessInfoCardProps> = ({ 
  processo, 
  onVoltar, 
  onEncaminhar,
  onComprovante,
  onParecer,
  onDeclaracao
}) => {
  return (
    <Card className="col-span-8 p-6 bg-white">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <ServerInfo processo={processo} />
        <ProcessInfo processo={processo} />
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={onParecer}>
          Parecer
        </Button>
        <Button variant="outline" onClick={onDeclaracao}>
          Declaração
        </Button>
        <Button variant="outline" onClick={onComprovante}>
          Comprovante
        </Button>
        <Button onClick={onEncaminhar}>
          Encaminhar
        </Button>
      </div>
    </Card>
  );
};

export default ProcessInfoCard;
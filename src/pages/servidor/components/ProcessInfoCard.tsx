import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import ProcessInfo from './ProcessInfo';

interface ProcessInfoCardProps {
  processo: Processo;
}

const ProcessInfoCard: React.FC<ProcessInfoCardProps> = ({ processo }) => {
  return (
    <Card className="p-4 bg-white mb-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        <ProcessInfo processo={processo} />
      </div>
    </Card>
  );
};

export default ProcessInfoCard;
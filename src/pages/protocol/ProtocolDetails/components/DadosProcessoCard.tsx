import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import { FolderOpen } from 'lucide-react';

interface DadosProcessoCardProps {
  processo: Processo;
}

const DadosProcessoCard: React.FC<DadosProcessoCardProps> = ({ processo }) => {
  const formatStatus = (status: string) => {
    if (!status) return '';
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };
  const toTitleCase = (s: string) => s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  const tipoDetalhe = (() => {
    const subtipo = (processo?.subtipo_descricao || '').trim();
    const base = processo?.tipo_nome || processo?.tipo_processo || '';
    return toTitleCase(subtipo ? subtipo : base);
  })();

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Dados do Processo</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <h4 className="font-medium mb-1">Tipo de Processo</h4>
          <p className="text-gray-600">{tipoDetalhe || 'N/A'}</p>
        </div>
        <div className="text-right">
          <h4 className="font-medium mb-1">Data de Entrada</h4>
          <p className="text-gray-600">{processo?.created_at ? new Date(processo.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Status do Processo</h4>
          <p className="text-gray-600">{formatStatus(processo?.status || '')}</p>
        </div>
        <div className="text-right">
          <h4 className="font-medium mb-1">Status do Departamento</h4>
          <p className="text-gray-600">{processo?.status_dpto || '—'}</p>
        </div>
        <div className="col-span-2">
          <h4 className="font-medium mb-1">Detalhes</h4>
          <p className="text-gray-600">{processo?.detalhes || '—'}</p>
        </div>
      </div>
    </Card>
  );
};

export default DadosProcessoCard;
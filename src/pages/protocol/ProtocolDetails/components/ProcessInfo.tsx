import React from 'react';
import { Processo } from '@/services/processoService';

interface ProcessInfoProps {
  processo: Processo;
}

const ProcessInfo: React.FC<ProcessInfoProps> = ({ processo }) => {
  // Função para formatar status removendo underscores e capitalizando primeira letra
  const formatStatus = (status: string) => {
    if (!status) return '';
    return status
      .replace(/_/g, ' ') // Remove underscores
      .toLowerCase() // Converte para minúsculo
      .replace(/^\w/, (c) => c.toUpperCase()); // Capitaliza primeira letra
  };

  return (
    <>
      {/* Linha divisória */}
      <div className="col-span-2 my-4 border-t border-gray-200"></div>

      {/* Dados do Processo */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-2">Dados do Processo</h3>
      </div>

      <div className="col-span-2">
        <h3 className="font-medium mb-0.5">Tipo de Processo</h3>
        <p className="text-gray-600">{processo?.nome || 'N/A'}</p>
      </div>

      <div>
        <h3 className="font-medium mb-0.5">Status</h3>
        <p className="text-gray-600">{formatStatus(processo?.status || '')}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-0.5">Data de Entrada</h3>
        <p className="text-gray-600">{processo?.created_at ? new Date(processo.created_at).toLocaleDateString() : 'N/A'}</p>
      </div>

      {processo?.detalhes && (
        <div className="col-span-2">
          <h3 className="font-medium mb-0.5">Detalhes</h3>
          <p className="text-gray-600">{processo.detalhes}</p>
        </div>
      )}
    </>
  );
};

export default ProcessInfo;
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
      {/* Dados do Processo */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-1">Dados do Processo</h3>
      </div>

      {/* Tipo de Processo - linha completa */}
      <div className="col-span-2">
        <h3 className="font-medium mb-0.5">Tipo de Processo</h3>
        <p className="text-gray-600 mb-2">{processo.nome}</p>
      </div>

      {/* Status e Data de Entrada - mesma linha */}
      <div>
        <h3 className="font-medium mb-0.5">Status</h3>
        <p className="text-gray-600 mb-2">{formatStatus(processo.status)}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-0.5">Data de Entrada</h3>
        <p className="text-gray-600 mb-2">{new Date(processo.created_at).toLocaleDateString()}</p>
      </div>

      {/* Detalhes - apenas se houver dados */}
      {processo.detalhes && processo.detalhes.trim() && (
        <div className="col-span-2">
          <h3 className="font-medium mb-0.5">Detalhes</h3>
          <p className="text-gray-600">{processo.detalhes}</p>
        </div>
      )}
    </>
  );
};

export default ProcessInfo;
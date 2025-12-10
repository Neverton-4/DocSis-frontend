import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import { Briefcase } from 'lucide-react';

interface DadosFuncionaisCardProps {
  processo: Processo;
}

const DadosFuncionaisCard: React.FC<DadosFuncionaisCardProps> = ({ processo }) => {
  const isServidor = processo?.iniciador_tipo === 'servidor';
  const interessado = processo?.interessado || processo?.servidor;

  // Só exibe para servidores
  if (processo?.iniciador_tipo !== 'servidor') {
    return null;
  }

  // Função para formatar data de admissão
  const formatDataAdmissao = (data: string) => {
    if (!data) return 'N/A';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  // Função para formatar tipo de servidor
  const formatTipoServidor = (tipo: string) => {
    if (!tipo) return 'N/A';
    return tipo;
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    if (!status) return 'N/A';
    return status;
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Dados Funcionais</h3>
      </div>
      
      <div className="space-y-4">
        {/* Linha 1: matricula, tipo_servidor e data_admissao */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <span className="text-sm font-medium text-gray-700">Matrícula:</span>
            <span className="ml-2 text-gray-600">{interessado?.matricula || 'N/A'}</span>
          </div>
          <div className="flex-1 min-w-[150px]">
            <span className="text-sm font-medium text-gray-700">Tipo de Servidor:</span>
            <span className="ml-2 text-gray-600">{formatTipoServidor(interessado?.tipo_servidor || '')}</span>
          </div>
          <div className="flex-1 min-w-[150px]">
            <span className="text-sm font-medium text-gray-700">Data de Admissão:</span>
            <span className="ml-2 text-gray-600">{formatDataAdmissao(interessado?.data_admissao || '')}</span>
          </div>
        </div>

        {/* Linha 2: secretaria, lotacao e status */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-gray-700">Secretaria:</span>
            <span className="ml-2 text-gray-600">{interessado?.nome_da_secretaria || 'N/A'}</span>
          </div>
          <div className="flex-1 min-w-[150px]">
            <span className="text-sm font-medium text-gray-700">Lotação:</span>
            <span className="ml-2 text-gray-600">{interessado?.lotacao || 'N/A'}</span>
          </div>
          <div className="flex-1 min-w-[100px]">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className="ml-2 text-gray-600">{formatStatus(interessado?.status || '')}</span>
          </div>
        </div>

        {/* Linha 3: cargo e cargo_2 */}
        <div className="flex gap-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-gray-700">Cargo:</span>
            <span className="ml-2 text-gray-600">{interessado?.cargo_nome || interessado?.cargo || 'N/A'}</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-gray-700">Cargo 2:</span>
            <span className="ml-2 text-gray-600">{interessado?.cargo_2_nome || interessado?.cargo_2 || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DadosFuncionaisCard;
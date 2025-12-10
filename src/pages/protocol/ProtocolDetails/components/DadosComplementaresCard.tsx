import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import { FileText, Info } from 'lucide-react';

interface DadosComplementaresCardProps {
  processo: Processo;
}

const DadosComplementaresCard: React.FC<DadosComplementaresCardProps> = ({ processo }) => {
  const interessado = processo?.interessado || processo?.servidor;

  // Função para formatar data
  const formatData = (data: string) => {
    if (!data) return 'N/A';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  // Função para formatar tipo
  const formatTipo = (tipo: string) => {
    if (!tipo) return 'N/A';
    return tipo;
  };

  // Função para formatar número
  const formatNumero = (numero: string | number) => {
    if (!numero) return 'N/A';
    return String(numero);
  };

  // Para servidor, exibe dados de expediente e amparo
  if (processo?.iniciador_tipo === 'servidor') {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Dados Complementares</h3>
        </div>
        
        <div className="space-y-6">
          {/* Seção Expediente */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Expediente
            </h4>
            <div className="flex gap-6 flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <span className="text-sm font-medium text-gray-700">Tipo:</span>
                <span className="ml-2 text-gray-600">{formatTipo(interessado?.expediente_tipo || '')}</span>
              </div>
              <div className="flex-1 min-w-[150px]">
                <span className="text-sm font-medium text-gray-700">Número:</span>
                <span className="ml-2 text-gray-600">{formatNumero(interessado?.expediente_numero || '')}</span>
              </div>
              <div className="flex-1 min-w-[150px]">
                <span className="text-sm font-medium text-gray-700">Data:</span>
                <span className="ml-2 text-gray-600">{formatData(interessado?.expediente_data || '')}</span>
              </div>
            </div>
          </div>

          {/* Seção Amparo */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              Amparo
            </h4>
            <div className="flex gap-6 flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <span className="text-sm font-medium text-gray-700">Tipo:</span>
                <span className="ml-2 text-gray-600">{formatTipo(interessado?.amparo_tipo || '')}</span>
              </div>
              <div className="flex-1 min-w-[150px]">
                <span className="text-sm font-medium text-gray-700">Número:</span>
                <span className="ml-2 text-gray-600">{formatNumero(interessado?.amparo_numero || '')}</span>
              </div>
              <div className="flex-1 min-w-[150px]">
                <span className="text-sm font-medium text-gray-700">Data:</span>
                <span className="ml-2 text-gray-600">{formatData(interessado?.amparo_data || '')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Para cidadão, exibe mensagem informativa
  if (processo?.iniciador_tipo === 'cidadao') {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Dados Complementares</h3>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-600">
            Os dados complementares do cidadão estão incluídos no card de Dados Pessoais.
          </p>
        </div>
      </Card>
    );
  }

  // Para outros tipos, não exibe nada
  return null;
};

export default DadosComplementaresCard;
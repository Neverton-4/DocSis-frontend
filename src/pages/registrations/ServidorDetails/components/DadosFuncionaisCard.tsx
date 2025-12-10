import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DadosFuncionaisCardProps {
  servidor: any;
}

const DadosFuncionaisCard: React.FC<DadosFuncionaisCardProps> = ({ servidor }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  const formatTipoServidor = (tipo: string | null) => {
    if (!tipo) return 'N/A';
    switch (tipo.toLowerCase()) {
      case 'efetivo':
        return 'Efetivo';
      case 'comissionado':
        return 'Comissionado';
      case 'temporario':
        return 'Temporário';
      case 'nao_servidor':
        return 'Não Servidor';
      default:
        return tipo;
    }
  };

  const formatStatus = (status: string | null) => {
    if (!status) return 'N/A';
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'licenca':
        return 'Em Licença';
      case 'aposentado':
        return 'Aposentado';
      case 'exonerado':
        return 'Exonerado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-500';
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-green-500';
      case 'inativo':
        return 'bg-red-500';
      case 'licenca':
        return 'bg-yellow-500';
      case 'aposentado':
        return 'bg-gray-500';
      case 'exonerado':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Dados Funcionais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Matrícula, Tipo de Servidor e Status (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Matrícula</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.matricula || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Servidor</label>
              <p className="text-sm text-gray-900 mt-1">{formatTipoServidor(servidor.tipo_servidor)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <div className="flex items-center mt-1">
                <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(servidor.status)} mr-2`}></span>
                <p className="text-sm text-gray-900">{formatStatus(servidor.status)}</p>
              </div>
            </div>
          </div>

          {/* Secretaria, Lotação e Data de Admissão (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Secretaria</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.secretaria?.nome || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Lotação</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.lotacao || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data de Admissão</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(servidor.data_admissao)}</p>
            </div>
          </div>

          {/* Cargo Principal e Cargo Secundário (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Cargo Principal</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.cargo?.nome || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Cargo Secundário</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.cargo_2?.nome || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosFuncionaisCard;
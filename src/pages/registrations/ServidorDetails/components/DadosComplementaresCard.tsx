import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DadosComplementaresCardProps {
  servidor: any;
}

const DadosComplementaresCard: React.FC<DadosComplementaresCardProps> = ({ servidor }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Dados Complementares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tipo de Expediente, Número do Expediente e Data do Expediente (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Expediente</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.expediente_tipo || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Número do Expediente</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.expediente_numero || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data do Expediente</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(servidor.expediente_data)}</p>
            </div>
          </div>

          {/* Tipo de Amparo, Número do Amparo e Data do Amparo (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tipo de Amparo</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.amparo_tipo || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Número do Amparo</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.amparo_numero || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data do Amparo</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(servidor.amparo_data)}</p>
            </div>
          </div>

          {/* Observações (única linha) */}
          {servidor.observacoes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Observações</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{servidor.observacoes}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosComplementaresCard;
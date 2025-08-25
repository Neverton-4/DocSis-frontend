
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Gerar números de 001 até 999 com status aleatórios
const generateDocumentNumbers = () => {
  const numbers = [];
  const statuses = ['disponivel', 'criado', 'em_revisao', 'aguardando_assinatura', 'revisao_assinatura', 'publicado'];
  
  for (let i = 1; i <= 999; i++) {
    const number = i.toString().padStart(3, '0');
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    numbers.push({
      number,
      status: randomStatus
    });
  }
  return numbers;
};

const statusColors = {
  disponivel: 'bg-gray-100 hover:bg-gray-200 border-gray-300',
  criado: 'bg-blue-200 hover:bg-blue-300 border-blue-400',
  em_revisao: 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400',
  aguardando_assinatura: 'bg-orange-200 hover:bg-orange-300 border-orange-400',
  revisao_assinatura: 'bg-purple-200 hover:bg-purple-300 border-purple-400',
  publicado: 'bg-green-200 hover:bg-green-300 border-green-400'
};

const statusLabels = {
  disponivel: 'Disponível',
  criado: 'Criado/Revisão',
  aguardando_assinatura: 'Aguardando Assinatura',
  revisao_assinatura: 'Revisão de Assinatura',
  publicado: 'Publicado'
};

interface DocumentGridProps {
  type: string;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({ type }) => {
  const documentNumbers = generateDocumentNumbers();

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Numeração
          </CardTitle>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
              <span>Criado/Revisão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-200 border border-orange-400 rounded"></div>
              <span>Aguardando Assinatura</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-200 border border-purple-400 rounded"></div>
              <span>Revisão de Assinatura</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
              <span>Publicado</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
          {documentNumbers.map((doc, index) => (
            <div
              key={index}
              className={`
                p-2 rounded-lg text-center cursor-pointer transition-all duration-200 transform hover:scale-105
                ${statusColors[doc.status as keyof typeof statusColors]}
                border-2 hover:border-gray-400
              `}
              title={statusLabels[doc.status as keyof typeof statusLabels]}
            >
              <div className="font-bold text-gray-800 text-sm">{doc.number}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

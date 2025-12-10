import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, Tag } from 'lucide-react';

interface DocumentHeaderProps {
  processoId: string;
  servidor: string;
  tipoProcesso: string;
  departamento?: string;
  dataAbertura?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  processoId,
  servidor,
  tipoProcesso,
  departamento,
  dataAbertura
}) => {
  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <FileText className="h-6 w-6 text-blue-600" />
          Processo #{processoId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Servidor:</span>
            <span className="font-medium text-gray-800">{servidor}</span>
          </div>
          
          {dataAbertura && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Data:</span>
              <span className="font-medium text-gray-800">{dataAbertura}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Tipo:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {tipoProcesso}
          </Badge>
          {departamento && (
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              {departamento}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
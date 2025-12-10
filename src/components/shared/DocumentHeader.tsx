import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentHeaderProps {
  numero: string;
  ano: string;
  titulo: string;
  servidor: string;
  tipoNome: string;
  subtipoNome?: string;
  documentType?: 'portaria' | 'decreto' | 'diaria';
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  numero,
  ano,
  titulo,
  servidor,
  tipoNome,
  subtipoNome,
  documentType = 'portaria'
}) => {
  // Determinar o nome do tipo de documento baseado no documentType
  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'decreto':
        return 'Decreto';
      case 'diaria':
        return 'Diária';
      case 'portaria':
      default:
        return 'Portaria';
    }
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-gray-800">{getDocumentTypeName()} nº {numero}/{ano}</span>
          <span className="text-lg text-gray-800">· {titulo}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {servidor || "Servidor não informado"} &nbsp; | &nbsp; 
          {tipoNome} {subtipoNome ? ` - ${subtipoNome}` : ""}
        </p>
      </CardContent>
    </Card>
  );
};
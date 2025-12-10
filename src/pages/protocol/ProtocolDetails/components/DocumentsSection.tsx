import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Paperclip, FileText, ChevronRight } from 'lucide-react';

interface DocumentsSectionProps {
  documentosPorDepartamento: { [key: string]: any[] };
  onVerDocumentos: (departamento: string) => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ 
  documentosPorDepartamento, 
  onVerDocumentos 
}) => {
  return (
    <Card className="p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Documentos em Anexos</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Anexar
        </Button>
      </div>
      
      <div className="space-y-4">
        {Object.keys(documentosPorDepartamento).map((departamento) => (
          <div 
            key={departamento}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onVerDocumentos(departamento)}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{departamento}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DocumentsSection;
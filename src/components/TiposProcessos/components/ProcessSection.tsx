// components/ProcessSection.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Edit, Trash2 } from 'lucide-react';
import { TipoProcesso } from '@/services/tipoProcessoService';

interface ProcessoSection {
  title: string;
  items: TipoProcesso[];
  tipo: 'licenca' | 'gratificacao' | 'declaracao' | 'outro';
}

interface ProcessSectionProps {
  section: ProcessoSection;
  onEdit: (processo: TipoProcesso) => void;
  onDelete: (id: number) => void;
}

const ProcessSection: React.FC<ProcessSectionProps> = ({
  section,
  onEdit,
  onDelete
}) => {
  return (
    <div>
      <Card className="overflow-hidden">
        <div className="bg-[#1E293B] text-white p-4">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="text-sm text-gray-300 mt-1">{section.items.length} processo(s)</p>
        </div>
        <div className="p-4 space-y-2 bg-white">
          {section.items.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{item.nome}</span>
                {item.descricao && (
                  <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProcessSection;
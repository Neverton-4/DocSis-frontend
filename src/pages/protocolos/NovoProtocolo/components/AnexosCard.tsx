import { FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AnexosCard = () => {
  return (
    <div className="col-span-2 p-6 bg-white">
      <div className="space-y-6">
        {["Protocolo", "Departamento de Recursos Humanos", "Assessoria Jurídica"].map(title => (
          <div key={title}>
            <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Nenhum documento anexado</span>
              </div>
            </div>
          </div>
        ))}
        <div className="pt-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
            <Paperclip className="h-4 w-4" />
            Anexar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnexosCard;
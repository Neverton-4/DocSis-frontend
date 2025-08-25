import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface BatchSignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  portarias: any[];
  selectedPortarias: number[];
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectPortaria: (portariaId: number, checked: boolean) => void;
  onBatchSign: () => void;
}

export const BatchSignDialog: React.FC<BatchSignDialogProps> = ({
  isOpen,
  onClose,
  portarias,
  selectedPortarias,
  selectAll,
  onSelectAll,
  onSelectPortaria,
  onBatchSign
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assinatura em Lote</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={onSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Selecionar todas as portarias ({portarias.length})
            </label>
          </div>
          
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            <div className="space-y-2 p-4">
              {portarias.map((portaria) => (
                <div key={portaria.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                  <Checkbox
                    id={`portaria-${portaria.id}`}
                    checked={selectedPortarias.includes(portaria.id)}
                    onCheckedChange={(checked) => onSelectPortaria(portaria.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{portaria.number}</span>
                      <Badge className="bg-orange-100 text-orange-800 text-xs">Pendente</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{portaria.title}</p>
                    <p className="text-xs text-gray-500">Servidor: {portaria.server}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedPortarias.length} de {portarias.length} portarias selecionadas
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onBatchSign}
            disabled={selectedPortarias.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Assinar ({selectedPortarias.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
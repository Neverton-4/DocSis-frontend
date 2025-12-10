import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { TipoParecer } from '@/services/tipoParecerService';

interface ParecerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tiposParecer?: TipoParecer[];
}

const ParecerDialog: React.FC<ParecerDialogProps> = ({ open, onOpenChange, tiposParecer = [] }) => {
  const [selectedParecer, setSelectedParecer] = useState<string>('');
  const [parecerFavoravel, setParecerFavoravel] = useState<string>('');

  // Encontra o tipo de parecer selecionado
  const tipoSelecionado = tiposParecer.find(tipo => tipo.id.toString() === selectedParecer);
  
  // Verifica se o tipo selecionado tem o campo parecer como true
  const mostrarPerguntaParecer = tipoSelecionado?.parecer === true;

  const handleBaixarModelo = () => {
    // Implementar lógica para baixar modelo
  };

  const handleGerarParecer = () => {
    // Implementar lógica para gerar parecer
    if (mostrarPerguntaParecer) {
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md bg-white p-6 rounded-lg shadow-lg -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Gerar Parecer Jurídico
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Parecer
              </label>
              <Select value={selectedParecer} onValueChange={setSelectedParecer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de parecer" />
                </SelectTrigger>
                <SelectContent>
                  {tiposParecer.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pergunta condicional sobre parecer favorável */}
            {mostrarPerguntaParecer && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  Este parecer é favorável?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="parecerFavoravel"
                      value="sim"
                      checked={parecerFavoravel === 'sim'}
                      onChange={(e) => setParecerFavoravel(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm">Sim</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="parecerFavoravel"
                      value="nao"
                      checked={parecerFavoravel === 'nao'}
                      onChange={(e) => setParecerFavoravel(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm">Não</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleBaixarModelo}
                disabled={!selectedParecer}
                className="flex-1"
              >
                Baixar Modelo
              </Button>
              <Button 
                onClick={handleGerarParecer}
                disabled={!selectedParecer || (mostrarPerguntaParecer && !parecerFavoravel)}
                className="flex-1"
              >
                Gerar Parecer
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ParecerDialog;
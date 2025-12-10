import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Customer, TipoProcesso } from '@/types';

interface ProcessoFormCidadaoProps {
  formData: Customer;
  tiposProcesso: TipoProcesso[];
  handleProcessoSelect: (tipo: TipoProcesso) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProcessoFormCidadao: React.FC<ProcessoFormCidadaoProps> = ({ 
  formData, 
  tiposProcesso, 
  handleProcessoSelect, 
  handleChange 
}) => {
  const getCamposExtras = () => {
    const tipo = tiposProcesso.find(tp => tp.id.toString() === formData.tipoProcesso_escolhido);
    return tipo?.campos_extras || [];
  };

  const handleTipoSelect = (tipoId: string) => {
    console.log('=== DEBUG CIDADAO SELECT ===');
    console.log('tipoId selecionado:', tipoId);
    console.log('tiposProcesso disponíveis:', tiposProcesso);
    
    const tipoSelecionado = tiposProcesso.find(tp => tp.id.toString() === tipoId);
    console.log('tipoSelecionado encontrado:', tipoSelecionado);
    
    if (tipoSelecionado) {
      handleProcessoSelect(tipoSelecionado);
    } else {
      console.error('Tipo não encontrado para ID:', tipoId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tipoProcesso">Selecione o processo</Label>
        <Select
          value={formData.tipoProcesso_escolhido || ''}
          onValueChange={handleTipoSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tipo de processo" />
          </SelectTrigger>
          <SelectContent>
            {tiposProcesso.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                {tipo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campos extras específicos do tipo selecionado */}
      {getCamposExtras().length > 0 && (
        <div className="border border-blue-200 bg-blue-50 rounded-md p-4">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Campos adicionais</h3>
          <div className="grid grid-cols-1 gap-4">
            {getCamposExtras().map((campo, index) => (
              <div key={index}>
                <Label htmlFor={`extra_${campo.nome}`}>
                  {campo.label || campo.nome}
                  {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {campo.tipo === 'select' && campo.opcoes ? (
                  <Select
                    value={formData.camposExtras?.[campo.nome] || ''}
                    onValueChange={(value) => {
                      const event = {
                        target: {
                          name: `extra_${campo.nome}`,
                          value: value,
                          type: 'text'
                        }
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleChange(event);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione ${campo.label || campo.nome}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {campo.opcoes.map((opcao, idx) => (
                        <SelectItem key={idx} value={opcao}>
                          {opcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : campo.tipo === 'textarea' ? (
                  <textarea
                    id={`extra_${campo.nome}`}
                    name={`extra_${campo.nome}`}
                    value={formData.camposExtras?.[campo.nome] || ''}
                    onChange={handleChange}
                    required={campo.obrigatorio}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={campo.placeholder || `Digite ${campo.label || campo.nome}`}
                  />
                ) : campo.tipo === 'checkbox' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`extra_${campo.nome}`}
                      name={`extra_${campo.nome}`}
                      checked={formData.camposExtras?.[campo.nome] || false}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`extra_${campo.nome}`} className="text-sm font-normal">
                      {campo.label || campo.nome}
                    </Label>
                  </div>
                ) : (
                  <input
                    type={campo.tipo || 'text'}
                    id={`extra_${campo.nome}`}
                    name={`extra_${campo.nome}`}
                    value={formData.camposExtras?.[campo.nome] || ''}
                    onChange={handleChange}
                    required={campo.obrigatorio}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={campo.placeholder || `Digite ${campo.label || campo.nome}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tipoProcessoOutro">Detalhar o processo</Label>
        <textarea
          id="tipoProcessoOutro"
          name="tipoProcessoOutro"
          value={formData.tipoProcessoOutro || ''}
          onChange={handleChange}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Descreva os detalhes do processo..."
        />
      </div>
    </div>
  );
};

export default ProcessoFormCidadao;
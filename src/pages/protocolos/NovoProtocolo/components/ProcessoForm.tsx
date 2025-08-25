import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TipoCategoria } from '@/types';

const ProcessoForm = ({ formData, tiposProcesso, categoriaSelecionada, handleProcessoSelect, handleChange }) => {
  const getTipoCategoria = (tipo: string): TipoCategoria | null => {
    const match = tiposProcesso.find(tp => tp.nome === tipo);
    return match?.tipo ?? 'outro';
  };

  const getTiposPorCategoria = (categoria) => tiposProcesso.filter(tp => tp.tipo === categoria);

  const getValorCategoria = (categoria) => {
    const tipo = tiposProcesso.find(tp => tp.nome === formData.tipoProcesso);
    return tipo?.tipo === categoria ? formData.tipoProcesso : '';
  };

  const getCamposExtras = () => {
    const tipo = tiposProcesso.find(tp => tp.nome === formData.tipoProcesso);
    return tipo?.campos_extras || [];
  };

  const handleCategoriaSelect = (categoria: string, value: string) => {
    handleProcessoSelect({ nome: value, tipo: categoria });
  };

  return (
    <div className="border-t mt-8 pt-8">
      <h2 className="text-lg font-semibold mb-6">Processo</h2>
      <div className="grid grid-cols-2 gap-4">
        {["licenca", "declaracao", "gratificacao", "outro"].map((categoria) => (
          <div key={categoria} className="space-y-2">
            <Label>{categoria.charAt(0).toUpperCase() + categoria.slice(1)}s</Label>
            <Select
              value={getValorCategoria(categoria)}
              onValueChange={(value) => handleCategoriaSelect(categoria, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecione uma ${categoria}`} />
              </SelectTrigger>
              <SelectContent>
                {getTiposPorCategoria(categoria).map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.nome}>{tipo.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {getCamposExtras().length > 0 && (
        <div className="mt-6 border border-blue-200 bg-blue-50 rounded-md p-4">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Campos adicionais</h3>
          <div className="grid grid-cols-2 gap-4">
            {getCamposExtras().map((campo, index) => (
              <div key={index}>
                <Label htmlFor={`extra_${campo.nome}`}>{campo.nome}</Label>
                <input
                  type={campo.tipo}
                  id={`extra_${campo.nome}`}
                  name={`extra_${campo.nome}`}
                  required={campo.obrigatorio}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Label htmlFor="tipoProcessoOutro">Detalhar o processo</Label>
        <textarea
          id="tipoProcessoOutro"
          name="tipoProcessoOutro"
          value={formData.tipoProcessoOutro}
          onChange={handleChange}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default ProcessoForm;

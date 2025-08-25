import React from 'react';
import { Label } from '@/components/ui/label';

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProcessoDetalhamento: React.FC<Props> = ({ value, onChange }) => (
  <div className="mt-6">
    <Label htmlFor="tipoProcessoOutro">Detalhar o processo</Label>
    <textarea
      id="tipoProcessoOutro"
      name="tipoProcessoOutro"
      value={value}
      onChange={onChange}
      rows={3}
      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
);

export default ProcessoDetalhamento;

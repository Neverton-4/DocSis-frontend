import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TipoProcessoSelectProps {
  categoria: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  getTiposPorCategoria: (categoria: string) => { id: string; nome: string }[];
}

const TipoProcessoSelect: React.FC<TipoProcessoSelectProps> = ({
  categoria,
  label,
  placeholder,
  value,
  onChange,
  getTiposPorCategoria,
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select
      value={value}
      onValueChange={(val) => onChange(val)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {getTiposPorCategoria(categoria).map(tipo => (
          <SelectItem key={tipo.id} value={tipo.nome}>
            {tipo.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default TipoProcessoSelect;

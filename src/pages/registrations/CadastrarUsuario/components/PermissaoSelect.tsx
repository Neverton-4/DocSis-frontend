import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  label: string;
  value: 'Permitido' | 'Não Permitido';
  onChange: (v: 'Permitido' | 'Não Permitido') => void;
  disabled?: boolean;
}

export const PermissaoSelect: React.FC<Props> = ({ label, value, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Permitido">Permitido</SelectItem>
          <SelectItem value="Não Permitido">Não Permitido</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PermissaoSelect;
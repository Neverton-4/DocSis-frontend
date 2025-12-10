import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types';

interface DadosComplementaresFormProps {
  formData: Customer;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const DadosComplementaresForm: React.FC<DadosComplementaresFormProps> = ({
  formData,
  onInputChange,
  onSelectChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Complementares</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes || ''}
            onChange={onInputChange}
            placeholder="Observações adicionais sobre o servidor"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosComplementaresForm;
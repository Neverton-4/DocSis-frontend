import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CidadaoFormData {
  nome_completo: string;
  cpf: string;
  rg: string;
  rg_uf: string;
  orgao_exp: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'O';
  contato: string;
  is_whatsapp: boolean;
  email: string;
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'outro';
  profissao: string;
  observacoes: string;
}

interface DadosComplementaresFormProps {
  formData: CidadaoFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const DadosComplementaresForm: React.FC<DadosComplementaresFormProps> = ({
  formData,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Dados Complementares
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estado_civil">Estado Civil</Label>
            <Select value={formData.estado_civil} onValueChange={(value) => onSelectChange('estado_civil', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profissao">Profissão</Label>
            <Input
              id="profissao"
              name="profissao"
              value={formData.profissao}
              onChange={onInputChange}
              placeholder="Profissão do cidadão"
              maxLength={100}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={onInputChange}
            placeholder="Observações adicionais sobre o cidadão"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default DadosComplementaresForm;
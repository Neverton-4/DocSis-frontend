import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/types';
import { Cargo } from '@/services/cargoService';
import { Secretaria } from '@/services/secretariaService';

interface DadosFuncionaisFormProps {
  formData: Customer;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  cargos: Cargo[];
  secretarias: Secretaria[];
}

const DadosFuncionaisForm: React.FC<DadosFuncionaisFormProps> = ({
  formData,
  onInputChange,
  onSelectChange,
  cargos,
  secretarias
}) => {
  
  const handleCargoChange = (value: string) => {
    const cargo = cargos.find(c => c.id.toString() === value);
    onSelectChange('cargo', cargo?.nome || '');
    onSelectChange('cargo_id', value); // ✅ NOVO: Atualizar também o cargo_id
  };

  const handleSecretariaChange = (value: string) => {
    onSelectChange('secretaria_id', value);
    const secretaria = secretarias.find(s => s.id.toString() === value);
    onSelectChange('secretaria', secretaria?.nome || '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Funcionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primeira linha: Matrícula, Tipo de Servidor, Data de Admissão e Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={onInputChange}
              placeholder="Digite a matrícula"

              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoServidor">Tipo de Servidor *</Label>
            <Select value={formData.tipoServidor} onValueChange={(value) => onSelectChange('tipoServidor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efetivo">Efetivo</SelectItem>
                <SelectItem value="comissionado">Comissionado</SelectItem>
                <SelectItem value="contratado">Contratado</SelectItem>
                <SelectItem value="terceirizado">Terceirizado</SelectItem>
                <SelectItem value="estagiario">Estagiário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_admissao">Data de Admissão *</Label>
            <Input
              id="data_admissao"
              name="data_admissao"
              type="date"
              value={formData.data_admissao}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => onSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="licenca">Em Licença</SelectItem>
                <SelectItem value="aposentado">Aposentado</SelectItem>
                <SelectItem value="exonerado">Exonerado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Segunda linha: Secretaria, Cargo e Lotação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="secretaria">Secretaria *</Label>
            <Select 
              value={formData.secretaria_id?.toString() || ''} 
              onValueChange={handleSecretariaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a secretaria" />
              </SelectTrigger>
              <SelectContent>
                {secretarias.map((secretaria) => (
                  <SelectItem key={secretaria.id} value={secretaria.id.toString()}>
                    {secretaria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo *</Label>
            <Select 
              value={formData.cargo_id?.toString() || ''} 
              onValueChange={handleCargoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id.toString()}>
                    {cargo.nome_completo || cargo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lotacao">Lotação</Label>
            <Input
              id="lotacao"
              name="lotacao"
              value={formData.lotacao}
              onChange={onInputChange}
              placeholder="Digite a lotação do servidor"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosFuncionaisForm;
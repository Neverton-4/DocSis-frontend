import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card-component';
import { salvarServidor, ExpedienteTipoEnum, AmparoTipoEnum } from '@/services/servidorService';
import { cargoService, Cargo } from '@/services/cargoService';
import { secretariaService, Secretaria } from '@/services/secretariaService';
import { Customer } from '@/types';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTiposServidor } from '@/hooks/useTiposServidor';

const CadastrarServidor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tiposServidorSimples } = useTiposServidor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [formData, setFormData] = useState<Customer>({
    id: '',
    fullName: '',
    cpf: '',
    rg: '',
    matricula: '',
    data_nascimento: '',
    sexo: 'M',
    contato: '',
    email: '',
    tipoServidor: 'efetivo',
    cargo: '',
    lotacao: '',
    secretaria_id: 0,
    data_admissao: '',
    logradouro: '',
    bairro: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
    cep: '',
    secretaria: '',
    is_whatsapp: false,
    status: 'ativo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tipoProcesso: '',
    tipoProcesso_escolhido: '',
    tipoProcessoOutro: '',
    camposExtras: {},
    // Novos campos RG
    rg_uf: '',
    orgao_exp: '',
    // Novos campos de expediente
    expediente_tipo: 'INTEGRAL',
    expediente_inicio: '',
    expediente_fim: '',
    // Novos campos de amparo
    amparo_tipo: 'CONCURSO_PUBLICO',
    amparo_numero: '',
    amparo_ano: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cargosData, secretariasData] = await Promise.all([
          cargoService.getAll(),
          secretariaService.getAll()
        ]);
        setCargos(cargosData);
        setSecretarias(secretariasData);
      } catch (error) {
        toast.error('Erro ao carregar dados necessários');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatações específicas
    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (name === 'contato') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 10) {
        formattedValue = numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        formattedValue = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    } else if (name === 'rg') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCargoChange = (value: string) => {
    const cargo = cargos.find(c => c.id.toString() === value);
    setFormData(prev => ({
      ...prev,
      cargo: cargo?.nome || ''
    }));
  };

  const handleSecretariaChange = (value: string) => {
    const secretaria = secretarias.find(s => s.id.toString() === value);
    setFormData(prev => ({
      ...prev,
      secretaria_id: parseInt(value),
      lotacao: secretaria?.nome || '',
      secretaria: secretaria?.nome || ''
    }));
  };



  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Nome completo é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return false;
    }
    if (!formData.data_nascimento) {
      toast.error('Data de nascimento é obrigatória');
      return false;
    }
    if (!formData.matricula.trim()) {
      toast.error('Matrícula é obrigatória');
      return false;
    }
    if (!formData.data_admissao) {
      toast.error('Data de admissão é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nome_completo: formData.fullName,
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg,
        contato: formData.contato.replace(/\D/g, ''),
        email: formData.email,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        tipo_servidor_id: formData.tipoServidor ? parseInt(formData.tipoServidor) : null,
        secretaria_id: formData.secretaria_id,
        matricula: formData.matricula,
        data_admissao: formData.data_admissao,
        // Novos campos RG
        rg_uf: formData.rg_uf,
        orgao_exp: formData.orgao_exp,
        // Novos campos de expediente
        expediente_tipo: formData.expediente_tipo,
        expediente_inicio: formData.expediente_inicio,
        expediente_fim: formData.expediente_fim,
        // Novos campos de amparo
        amparo_tipo: formData.amparo_tipo,
        amparo_numero: formData.amparo_numero,
        amparo_ano: formData.amparo_ano
      };

      await salvarServidor(payload);
      toast.success('Servidor cadastrado com sucesso!');
      navigate('/servidores');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb="Cadastrar Servidor"
      />
      <div className="flex-1 p-8 max-w-[1280px] mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Botão Voltar */}
          <div className="mb-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              ← Voltar
            </button>
          </div>

          {/* Dados Pessoais */}
          <Card className="p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Dados Pessoais</h2>
            <div className="grid gap-3">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    name="rg"
                    value={formData.rg}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>

              {/* Novos campos RG */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rg_uf">UF do RG</Label>
                  <Select value={formData.rg_uf} onValueChange={(value) => handleSelectChange('rg_uf', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione a UF" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgao_exp">Órgão Expedidor</Label>
                  <Input
                    id="orgao_exp"
                    name="orgao_exp"
                    value={formData.orgao_exp}
                    onChange={handleChange}
                    placeholder="Ex: SSP, PC, IFP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select value={formData.sexo} onValueChange={(value) => handleSelectChange('sexo', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o sexo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    name="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input
                    id="contato"
                    name="contato"
                    value={formData.contato}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Novos campos de expediente */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expediente_tipo">Tipo de Expediente</Label>
                  <Select value={formData.expediente_tipo} onValueChange={(value) => handleSelectChange('expediente_tipo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTEGRAL">Integral</SelectItem>
                      <SelectItem value="PARCIAL">Parcial</SelectItem>
                      <SelectItem value="FLEXIVEL">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expediente_inicio">Horário de Início</Label>
                  <Input
                    id="expediente_inicio"
                    name="expediente_inicio"
                    type="time"
                    value={formData.expediente_inicio}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expediente_fim">Horário de Fim</Label>
                  <Input
                    id="expediente_fim"
                    name="expediente_fim"
                    type="time"
                    value={formData.expediente_fim}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Novos campos de amparo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="amparo_tipo">Tipo de Amparo</Label>
                  <Select value={formData.amparo_tipo} onValueChange={(value) => handleSelectChange('amparo_tipo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONCURSO_PUBLICO">Concurso Público</SelectItem>
                      <SelectItem value="PROCESSO_SELETIVO">Processo Seletivo</SelectItem>
                      <SelectItem value="NOMEACAO">Nomeação</SelectItem>
                      <SelectItem value="CONTRATO_TEMPORARIO">Contrato Temporário</SelectItem>
                      <SelectItem value="OUTROS">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amparo_numero">Número do Amparo</Label>
                  <Input
                    id="amparo_numero"
                    name="amparo_numero"
                    value={formData.amparo_numero}
                    onChange={handleChange}
                    placeholder="Ex: 001/2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amparo_ano">Ano do Amparo</Label>
                  <Input
                    id="amparo_ano"
                    name="amparo_ano"
                    type="number"
                    value={formData.amparo_ano}
                    onChange={handleChange}
                    placeholder="Ex: 2023"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Dados Funcionais */}
          <Card className="p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Dados Funcionais</h2>
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleChange}
                    required
                    placeholder="Digite a matrícula"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoServidor">Tipo de Servidor</Label>
                  <Select value={formData.tipoServidor} onValueChange={(value) => handleSelectChange('tipoServidor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposServidorSimples.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_admissao">Data de Admissão</Label>
                  <Input
                    id="data_admissao"
                    name="data_admissao"
                    type="date"
                    value={formData.data_admissao}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
        <Select value={formData.cargo || ''} onValueChange={(value) => handleCargoChange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.id} value={cargo.id.toString()}>
                          {cargo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretaria_id">Secretaria</Label>
                  <Select value={formData.secretaria_id?.toString() || ''} onValueChange={(value) => handleSecretariaChange(value)}>
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
              </div>
            </div>

            {/* Botões de ação dentro do card Dados Funcionais */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div></div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                  Voltar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CadastrarServidor;
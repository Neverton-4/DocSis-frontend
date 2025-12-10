import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card-component';
import { Checkbox } from '@/components/ui/checkbox';
import { salvarCidadao, SexoEnum, EstadoCivilEnum, Cidadao } from '@/services/cidadaoService';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';

const CadastrarCidadao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Cidadao, 'id' | 'created_at' | 'updated_at'>>({
    nome_completo: '',
    cpf: '',
    rg: '',
    rg_uf: '',
    data_nascimento: '',
    sexo: 'M',
    contato: '',
    is_whatsapp: false,
    email: '',
    estado_civil: 'solteiro',
    profissao: '',
    observacoes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_whatsapp: checked }));
  };

  const validateForm = () => {
    if (!formData.nome_completo.trim()) {
      toast.error('Nome completo é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return false;
    }
    if (!formData.rg.trim()) {
      toast.error('RG é obrigatório');
      return false;
    }
    if (!formData.data_nascimento) {
      toast.error('Data de nascimento é obrigatória');
      return false;
    }
    if (!formData.contato.trim()) {
      toast.error('Contato é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return false;
    }
    if (!formData.profissao.trim()) {
      toast.error('Profissão é obrigatória');
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
        nome_completo: formData.nome_completo,
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg,
        rg_uf: formData.rg_uf,
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo,
        contato: formData.contato.replace(/\D/g, ''),
        is_whatsapp: formData.is_whatsapp,
        email: formData.email,
        estado_civil: formData.estado_civil,
        profissao: formData.profissao,
        observacoes: formData.observacoes
      };

      await salvarCidadao(payload);
      toast.success('Cidadão cadastrado com sucesso!');
      navigate('/processo/novo?tipo=cidadao');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('CPF')) {
        toast.error('CPF já cadastrado no sistema');
      } else {
        toast.error(error.message || 'Erro ao cadastrar cidadão');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb="Cadastrar Cidadão"
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
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleChange}
                    required
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
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
                  <Label htmlFor="rg">RG *</Label>
                  <Input
                    id="rg"
                    name="rg"
                    value={formData.rg}
                    onChange={handleChange}
                    required
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rg_uf">UF do RG</Label>
                  <Select value={formData.rg_uf || ''} onValueChange={(value) => handleSelectChange('rg_uf', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
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
                  <Label>Sexo *</Label>
                  <Select value={formData.sexo} onValueChange={(value) => handleSelectChange('sexo', value)}>
                    <SelectTrigger><SelectValue placeholder="Selecione o sexo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil *</Label>
                  <Select value={formData.estado_civil} onValueChange={(value) => handleSelectChange('estado_civil', value)}>
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
                  <Label htmlFor="profissao">Profissão *</Label>
                  <Input
                    id="profissao"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleChange}
                    required
                    placeholder="Digite a profissão"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Dados de Contato */}
          <Card className="p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Dados de Contato</h2>
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="contato">Contato *</Label>
                  <Input
                    id="contato"
                    name="contato"
                    value={formData.contato}
                    onChange={handleChange}
                    required
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_whatsapp"
                      checked={formData.is_whatsapp}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="is_whatsapp">É WhatsApp?</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Observações */}
          <Card className="p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Observações</h2>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes || ''}
                onChange={handleChange}
                placeholder="Digite observações adicionais (opcional)"
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>

            {/* Botões de ação dentro do card Observações */}
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

export default CadastrarCidadao;
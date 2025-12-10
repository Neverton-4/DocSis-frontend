import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card-component';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { salvarJuridico, JuridicoCompleto } from '@/services/juridicoService';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';

const CadastrarJuridico = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<JuridicoCompleto, 'id' | 'created_at' | 'updated_at'>>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    contato: '',
    is_whatsapp: false,
    email: '',
    observacoes: '',
    enderecos: [{
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    }]
  });

  // Função para validar CNPJ
  const validarCNPJ = (cnpj: string): boolean => {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpjLimpo.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpjLimpo[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    if (parseInt(cnpjLimpo[12]) !== digito1) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpjLimpo[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    return parseInt(cnpjLimpo[13]) === digito2;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatações específicas
    if (name === 'cnpj') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (name === 'contato') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 10) {
        formattedValue = numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        formattedValue = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    } else if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Campos de endereço
    if (['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        enderecos: [{
          ...prev.enderecos[0],
          [name]: formattedValue
        }]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'uf') {
      setFormData(prev => ({
        ...prev,
        enderecos: [{
          ...prev.enderecos[0],
          uf: value
        }]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_whatsapp: checked }));
  };

  const validateForm = () => {
    if (!formData.razao_social.trim()) {
      toast.error('Razão social é obrigatória');
      return false;
    }
    if (!formData.cnpj.trim()) {
      toast.error('CNPJ é obrigatório');
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
    if (!formData.enderecos[0].logradouro.trim()) {
      toast.error('Logradouro é obrigatório');
      return false;
    }
    if (!formData.enderecos[0].cidade.trim()) {
      toast.error('Cidade é obrigatória');
      return false;
    }
    if (!formData.enderecos[0].uf.trim()) {
      toast.error('UF é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const erros: string[] = [];
    
    if (!formData.razao_social.trim()) {
      erros.push('Razão Social é obrigatória');
    }
    
    if (!formData.cnpj.trim()) {
      erros.push('CNPJ é obrigatório');
    } else if (!validarCNPJ(formData.cnpj)) {
      erros.push('CNPJ inválido');
    }
    
    if (!formData.contato.trim()) {
      erros.push('Contato é obrigatório');
    }
    
    if (!formData.enderecos[0].cep.trim()) {
       erros.push('CEP é obrigatório');
     }
     
     if (!formData.enderecos[0].logradouro.trim()) {
       erros.push('Logradouro é obrigatório');
     }
     
     if (!formData.enderecos[0].numero.trim()) {
       erros.push('Número é obrigatório');
     }
     
     if (!formData.enderecos[0].bairro.trim()) {
       erros.push('Bairro é obrigatório');
     }
     
     if (!formData.enderecos[0].cidade.trim()) {
       erros.push('Cidade é obrigatória');
     }
     
     if (!formData.enderecos[0].uf.trim()) {
       erros.push('UF é obrigatória');
     }
    
    if (erros.length > 0) {
       toast.error(erros.join(', '));
       return;
     }

    setIsSubmitting(true);

    try {
      // Limpar formatações antes de enviar
      const dataToSend = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        contato: formData.contato.replace(/\D/g, ''),
        enderecos: [{
          ...formData.enderecos[0],
          cep: formData.enderecos[0].cep.replace(/\D/g, '')
        }]
      };

      await salvarJuridico(dataToSend);
      toast.success('Jurídico cadastrado com sucesso!');
      navigate(-1); // Volta para a página anterior
    } catch (error: any) {
      console.error('Erro ao cadastrar jurídico:', error);
      toast.error(error.message || 'Erro ao cadastrar jurídico');
    } finally {
      setIsSubmitting(false);
    }
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Cadastrar Novo Jurídico</h1>
            <p className="text-gray-600">Preencha os dados da pessoa jurídica</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados da Empresa */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Dados da Empresa</h2>
              <div className="grid gap-4">
                {/* Linha 1: Razão Social e Nome Fantasia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      name="razao_social"
                      value={formData.razao_social}
                      onChange={handleChange}
                      required
                      placeholder="Digite a razão social"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="nome_fantasia"
                      name="nome_fantasia"
                      value={formData.nome_fantasia}
                      onChange={handleChange}
                      placeholder="Digite o nome fantasia"
                    />
                  </div>
                </div>

                {/* Linha 2: CNPJ, Inscrição Estadual e Municipal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleChange}
                      required
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricao_estadual"
                      name="inscricao_estadual"
                      value={formData.inscricao_estadual}
                      onChange={handleChange}
                      placeholder="Digite a inscrição estadual"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                    <Input
                      id="inscricao_municipal"
                      name="inscricao_municipal"
                      value={formData.inscricao_municipal}
                      onChange={handleChange}
                      placeholder="Digite a inscrição municipal"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Dados de Contato */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Dados de Contato</h2>
              <div className="grid gap-4">
                {/* Linha 1: Contato e Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contato">Telefone/Celular *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="contato"
                        name="contato"
                        value={formData.contato}
                        onChange={handleChange}
                        required
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="flex-1"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_whatsapp"
                          checked={formData.is_whatsapp}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="is_whatsapp" className="text-sm">WhatsApp</Label>
                      </div>
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
                      placeholder="empresa@exemplo.com"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Endereço */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Endereço</h2>
              <div className="grid gap-4">
                {/* Linha 1: Logradouro, Número e Complemento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                      id="logradouro"
                      name="logradouro"
                      value={formData.enderecos[0].logradouro}
                      onChange={handleChange}
                      required
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      name="numero"
                      value={formData.enderecos[0].numero}
                      onChange={handleChange}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      name="complemento"
                      value={formData.enderecos[0].complemento}
                      onChange={handleChange}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>
                </div>

                {/* Linha 2: Bairro, Cidade, UF e CEP */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      name="bairro"
                      value={formData.enderecos[0].bairro}
                      onChange={handleChange}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      value={formData.enderecos[0].cidade}
                      onChange={handleChange}
                      required
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF *</Label>
                    <Select value={formData.enderecos[0].uf} onValueChange={(value) => handleSelectChange('uf', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(estado => (
                          <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      name="cep"
                      value={formData.enderecos[0].cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Observações */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Observações</h2>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre a empresa..."
                  rows={4}
                />
              </div>
            </Card>

            {/* Botões */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Jurídico'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastrarJuridico;
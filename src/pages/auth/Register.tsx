import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card-component';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/config/api';

interface ServidorInfo {
  nome: string;
  matricula: string;
  cargo: string | null;
  email: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    username: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingCpf, setIsValidatingCpf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpfValidated, setCpfValidated] = useState(false);
  const [servidorInfo, setServidorInfo] = useState<ServidorInfo | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cpf') {
      formattedValue = formatCpf(value);
      setCpfValidated(false);
      setServidorInfo(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpa erros quando o usuário começa a digitar
    if (error) setError(null);
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCpfBlur = async () => {
    const cpfNumbers = formData.cpf.replace(/\D/g, '');
    
    if (!cpfNumbers) return;
    
    if (!validateCpf(formData.cpf)) {
      setFieldErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
      return;
    }
    
    setIsValidatingCpf(true);
    try {
      const response = await api.post('/auth/validate-cpf', { cpf: cpfNumbers });
      
      if (response.data.valid) {
        setCpfValidated(true);
        setServidorInfo(response.data.servidor);
        // Preenche automaticamente o nome e email se disponíveis
        setFormData(prev => ({
          ...prev,
          nome: response.data.servidor.nome || prev.nome,
          email: response.data.servidor.email || prev.email
        }));
        toast({
          title: "CPF Validado",
          description: `Servidor encontrado: ${response.data.servidor.nome}`,
        });
      } else {
        setFieldErrors(prev => ({ ...prev, cpf: response.data.message }));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao validar CPF';
      setFieldErrors(prev => ({ ...prev, cpf: errorMessage }));
    } finally {
      setIsValidatingCpf(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome completo é obrigatório';
    }
    
    if (!formData.cpf) {
      errors.cpf = 'CPF é obrigatório';
    } else if (!validateCpf(formData.cpf)) {
      errors.cpf = 'CPF inválido';
    } else if (!cpfValidated) {
      errors.cpf = 'CPF deve ser validado';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.length < 3) {
      errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    
    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'Senhas não coincidem';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        email: formData.email,
        username: formData.username,
        senha: formData.senha,
        confirmar_senha: formData.confirmarSenha
      });

      toast({
        title: "Sucesso",
        description: "Usuário cadastrado com sucesso! Você pode fazer login agora.",
      });
      
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao cadastrar usuário';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cadastro de Usuário</h1>
          <p className="text-gray-500 mt-2">Crie sua conta para acessar o sistema</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cpfValidated && servidorInfo && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              CPF validado! Servidor: {servidorInfo.nome}
              {servidorInfo.cargo && ` - ${servidorInfo.cargo}`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite seu nome completo"
              className={fieldErrors.nome ? 'border-red-500' : ''}
            />
            {fieldErrors.nome && (
              <p className="text-sm text-red-500">{fieldErrors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              name="cpf"
              type="text"
              value={formData.cpf}
              onChange={handleChange}
              onBlur={handleCpfBlur}
              required
              placeholder="000.000.000-00"
              maxLength={14}
              className={fieldErrors.cpf ? 'border-red-500' : cpfValidated ? 'border-green-500' : ''}
            />
            {isValidatingCpf && (
              <p className="text-sm text-blue-500">Validando CPF...</p>
            )}
            {fieldErrors.cpf && (
              <p className="text-sm text-red-500">{fieldErrors.cpf}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu.email@exemplo.com"
              className={fieldErrors.email ? 'border-red-500' : ''}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário *</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Digite seu nome de usuário"
              className={fieldErrors.username ? 'border-red-500' : ''}
            />
            {fieldErrors.username && (
              <p className="text-sm text-red-500">{fieldErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="Digite sua senha (mín. 6 caracteres)"
              className={fieldErrors.senha ? 'border-red-500' : ''}
            />
            {fieldErrors.senha && (
              <p className="text-sm text-red-500">{fieldErrors.senha}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
            <Input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              placeholder="Confirme sua senha"
              className={fieldErrors.confirmarSenha ? 'border-red-500' : ''}
            />
            {fieldErrors.confirmarSenha && (
              <p className="text-sm text-red-500">{fieldErrors.confirmarSenha}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !cpfValidated}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
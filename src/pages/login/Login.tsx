import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card-component';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpa o erro quando o usuário começa a digitar
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.username, formData.password);
      
      // Se "Lembrar-me" estiver marcado, salva as credenciais no localStorage
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          username: formData.username,
          rememberMe: true
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });
      navigate('/'); // Mudança aqui: de '/dashboard' para '/'
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Usuário ou senha inválidos';
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

  // Verifica se há credenciais salvas no localStorage
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const { username, rememberMe } = JSON.parse(rememberedUser);
      setFormData(prev => ({
        ...prev,
        username,
        rememberMe
      }));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Protocolos</h1>
          <p className="text-gray-500 mt-2">Faça login para acessar o sistema</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Digite sua senha"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                }
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Lembrar-me
              </Label>
            </div>
            <Link
              to="/esqueci-senha"
              className="text-sm text-primary hover:text-primary/80"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Remover esta seção em produção */}
        {/* 
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Usuários disponíveis:</p>
          <p>admin / admin (Acesso total)</p>
          <p>protocolo / protocolo (Protocolo)</p>
          <p>juridico / juridico (Assessoria Jurídica)</p>
          <p>rh / rh (Recursos Humanos)</p>
        </div>
        */}
      </Card>
    </div>
  );
};

export default Login;
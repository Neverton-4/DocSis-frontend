import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card-component';
import Header from '../../components/Header';
import { Customer, TipoServidor, Secretaria, TipoProcesso } from '../../types';
import { toast } from 'sonner';
import { Paperclip, FileText, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { tipoProcessoService, TipoProcesso as TipoProcessoInterface } from '../../services/tipoProcessoService';
import { secretariaService, Secretaria as SecretariaInterface } from '../../services/secretariaService';

// Tipos de categorias de processos para melhorar a tipagem
type TipoCategoria = 'licenca' | 'declaracao' | 'gratificacao' | 'outro';

const NovoProtocolo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servidores, setServidores] = useState<any[]>([]);
  const [tiposProcesso, setTiposProcesso] = useState<TipoProcessoInterface[]>([]);
  const [secretarias, setSecretarias] = useState<SecretariaInterface[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Estado para controlar a categoria de processo selecionada
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<TipoCategoria | null>(null);

  const [formData, setFormData] = React.useState<Customer>({
    id: '',
    fullName: '',
    cpf: '',
    endereco: {
      logradouro: '',
      bairro: '',
      numero: '',
      cidade: '',
      uf: '',
    },
    tipoServidor: 'efetivo' as TipoServidor,
    lotacao: '',
    cargo: '',
    sexo: 'M' as 'M' | 'F' | 'O',
    secretaria: '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contato: '',
    email: '',
    dateOfBirth: '',
    tipoProcesso: '' as TipoProcesso, // Inicializa vazio
    tipoProcessoOutro: '',
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [tipos, secretariasData] = await Promise.all([
          tipoProcessoService.getAll(),
          secretariaService.getAll()
        ]);
        
        setTiposProcesso(tipos);
        setSecretarias(secretariasData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados necessários');
      }
    };

    carregarDados();
  }, []);

  // Funções auxiliares para verificar o tipo de processo
  const getTipoCategoria = (tipoProcesso: string): TipoCategoria | null => {
    if (!tipoProcesso) return null;
    if (tipoProcesso.startsWith('licenca_')) return 'licenca';
    if (tipoProcesso.startsWith('declaracao_')) return 'declaracao';
    if (tipoProcesso.startsWith('gratificacao_')) return 'gratificacao';
    return 'outro';
  };

  // Atualiza o estado quando um tipo de processo é selecionado
  useEffect(() => {
    setCategoriaSelecionada(getTipoCategoria(formData.tipoProcesso));
  }, [formData.tipoProcesso]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função unificada para lidar com a seleção de processos
  const handleProcessoSelect = (value: string) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        tipoProcesso: value as TipoProcesso
      }));
    }
  };

  const handleSearchServidor = async (value: string) => {
    if (value.length < 3) {
      setServidores([]);
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/api/processos/servidores?nome=${value}`);
      setServidores(response.data);
      setShowAutocomplete(true);
    } catch (error) {
      console.error('Erro ao buscar servidores:', error);
      toast.error('Erro ao buscar servidores');
    }
  };

  const handleServidorSelect = (servidor: any) => {
    setFormData({
      ...formData,
      fullName: servidor.nome_completo,
      cpf: servidor.cpf,
      endereco: {
        logradouro: servidor.endereco.logradouro,
        bairro: servidor.endereco.bairro,
        numero: servidor.endereco.numero,
        cidade: servidor.endereco.cidade,
        uf: servidor.endereco.uf
      },
      tipoServidor: servidor.tipo_servidor as TipoServidor,
      lotacao: servidor.lotacao,
      cargo: servidor.cargo,
      sexo: servidor.sexo as 'M' | 'F' | 'O',
      secretaria: servidor.secretaria,
      contato: servidor.contato,
      email: servidor.email,
      dateOfBirth: servidor.data_nascimento
    });
    setShowAutocomplete(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, fullName: value }));

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      handleSearchServidor(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement the save logic here
    toast.success("Protocolo cadastrado com sucesso!");
    navigate('/');
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const getTiposPorCategoria = (tipo: string) => {
    return tiposProcesso.filter(tp => tp.tipo === tipo);
  };

  // Obtém se um select de categoria específica deve exibir um valor
  const getValorCategoria = (categoria: TipoCategoria): string => {
    return categoriaSelecionada === categoria ? formData.tipoProcesso : '';
  };

  return (
    <div className="flex flex-col h-full">
      <Header 
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb="Novo Protocolo"
      />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-10 gap-6">
          {/* Card de Informações */}
          <Card className="col-span-8 p-6 bg-white">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-4 space-y-2 relative">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleNameChange}
                        required
                      />
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {showAutocomplete && servidores.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {servidores.map((servidor) => (
                          <div
                            key={servidor.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleServidorSelect(servidor)}
                          >
                            <div className="font-medium">{servidor.nome_completo}</div>
                            <div className="text-sm text-gray-500">
                              CPF: {servidor.cpf} | Matrícula: {servidor.matricula}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-4">
                  <div className="col-span-9 space-y-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      name="endereco.logradouro"
                      value={formData.endereco.logradouro}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-1 space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-4">
                  <div className="col-span-4 space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-4 space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      name="endereco.uf"
                      value={formData.endereco.uf}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Contato</Label>
                    <Input
                      id="contato"
                      name="contato"
                      value={formData.contato}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sexo</Label>
                    <Select
                      value={formData.sexo}
                      onValueChange={(value) => handleSelectChange('sexo', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="O">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Servidor</Label>
                    <Select
                      value={formData.tipoServidor}
                      onValueChange={(value) => handleSelectChange('tipoServidor', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efetivo">Efetivo</SelectItem>
                        <SelectItem value="comissionado">Comissionado</SelectItem>
                        <SelectItem value="temporario">Temporário</SelectItem>
                        <SelectItem value="nao_servidor">Não Servidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lotação</Label>
                    <Select
                      value={formData.lotacao}
                      onValueChange={(value) => handleSelectChange('lotacao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a lotação" />
                      </SelectTrigger>
                      <SelectContent>
                        {secretarias.map((secretaria) => (
                          <SelectItem key={secretaria.id} value={secretaria.abrev}>
                             ({secretaria.abrev}) {secretaria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="border-t mt-8 pt-8">
                  <h2 className="text-lg font-semibold mb-6">Processo</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Licenças</Label>
                      <Select
                        value={getValorCategoria('licenca')}
                        onValueChange={(value) => handleProcessoSelect(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma licença" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTiposPorCategoria('licenca').map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.nome}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Declarações</Label>
                      <Select
                        value={getValorCategoria('declaracao')}
                        onValueChange={(value) => handleProcessoSelect(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma declaração" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTiposPorCategoria('declaracao').map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.nome}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Gratificações</Label>
                      <Select
                        value={getValorCategoria('gratificacao')}
                        onValueChange={(value) => handleProcessoSelect(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma gratificação" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTiposPorCategoria('gratificacao').map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.nome}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Outros</Label>
                      <Select
                        value={getValorCategoria('outro')}
                        onValueChange={(value) => handleProcessoSelect(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione outro tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTiposPorCategoria('outro').map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.nome}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="tipoProcessoOutro">Detalhar o processo</Label>
                    <textarea
                      id="tipoProcessoOutro"
                      name="tipoProcessoOutro"
                      value={formData.tipoProcessoOutro}
                      onChange={handleChange}
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="outline" onClick={handleVoltar}>
                  Voltar
                </Button>
                <Button type="submit">
                  Criar
                </Button>
              </div>
            </form>
          </Card>

          {/* Card de Anexos */}
          <Card className="col-span-2 p-6 bg-white">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Protocolo</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Nenhum documento anexado</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Departamento de Recursos Humanos</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Nenhum documento anexado</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Assessoria Jurídica</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Nenhum documento anexado</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2 w-full">
                  <Paperclip className="h-4 w-4" />
                  Anexar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NovoProtocolo;
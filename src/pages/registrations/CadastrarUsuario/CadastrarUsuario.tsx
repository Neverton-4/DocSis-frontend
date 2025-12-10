import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import api from '@/config/api';

interface Tela {
  id: number;
  nome: string;
}

interface Permissao {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
}

interface Assinante {
  id: number;
  nome: string;
  tipo_assinante: 'prefeito' | 'secretario' | 'procurador' | 'controlador';
  ativo: boolean;
}

type Role = 'admin' | 'user';
type Status = 'ativo' | 'inativo';

const required = (v?: string) => v && v.toString().trim().length > 0;

const CadastrarUsuario: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Formulário principal
  const [form, setForm] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '',
    departamento_id: '' as string | number,
    servidor_id: '' as string | number,
    rubrica: '',
    pode_assinar: false,
    role: 'user' as Role,
    status: 'ativo' as Status,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Dados auxiliares
  const [departamentos, setDepartamentos] = useState<Array<{ id: number; nome: string }>>([]);
  const [telas, setTelas] = useState<Tela[]>([]);
  const [permissoesPorTela, setPermissoesPorTela] = useState<Record<number, Permissao[]>>({});
  const [assinantes, setAssinantes] = useState<Assinante[]>([]);

  // Estados de UI de permissões
  const [acessoTela, setAcessoTela] = useState<Record<number, boolean>>({});
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<Record<number, 'Permitido' | 'Não Permitido'>>({});
  const [assinantesSelecionados, setAssinantesSelecionados] = useState<Record<number, 'Permitido' | 'Não Permitido'>>({});

  const canSubmit = useMemo(() => {
    return (
      required(form.nome) &&
      required(form.username) &&
      required(form.email) &&
      required(form.senha) &&
      form.senha === form.confirmarSenha &&
      required(form.cargo) &&
      required(String(form.servidor_id)) &&
      required(form.rubrica)
    );
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch inicial
  useEffect(() => {
    const loadData = async () => {
      try {
        const [depRes, telasRes, assinRes] = await Promise.all([
          api.get('/departamentos'),
          api.get('/telas/with-permissoes'),
          api.get('/assinantes', { params: { ativo: true } }),
        ]);
        const telasData: (Tela & { permissoes?: Permissao[] })[] = telasRes.data || [];
        setDepartamentos(depRes.data || []);
        setTelas(telasData.map(t => ({ id: t.id, nome: t.nome })));
        setAssinantes(assinRes.data || []);
        // Inicializar estados e mapear permissões por tela
        const initAcesso: Record<number, boolean> = {};
        const mapPerms: Record<number, Permissao[]> = {};
        telasData.forEach((t) => {
          initAcesso[t.id] = false;
          if (t.permissoes) {
            mapPerms[t.id] = t.permissoes;
          }
        });
        setAcessoTela(initAcesso);
        setPermissoesPorTela(mapPerms);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais', err);
        toast.error('Falha ao carregar dados (telas/departamentos/assinantes). Backend ativo?');
      }
    };
    loadData();
  }, []);

  // Carregar permissões ao selecionar uma aba
  const loadPermissoesForTela = async (telaId: number) => {
    try {
      if (!permissoesPorTela[telaId]) {
        const res = await api.get(`/permissoes/tela/${telaId}`);
        setPermissoesPorTela((prev) => ({ ...prev, [telaId]: res.data || [] }));
      }
    } catch (err) {
      console.error('Erro ao carregar permissões da tela', telaId, err);
      toast.error('Falha ao carregar permissões da tela.');
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!required(form.nome)) errors.nome = 'Nome é obrigatório';
    if (!required(form.username)) errors.username = 'Username é obrigatório';
    if (!required(form.email)) errors.email = 'Email é obrigatório';
    if (!required(form.senha)) errors.senha = 'Senha é obrigatória';
    if (form.senha !== form.confirmarSenha) errors.confirmarSenha = 'Senhas não conferem';
    if (!required(form.cargo)) errors.cargo = 'Cargo é obrigatório';
    if (!required(String(form.servidor_id))) errors.servidor_id = 'Servidor (ID) é obrigatório';
    if (!required(form.rubrica)) errors.rubrica = 'Rubrica é obrigatória';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Corrija os campos obrigatórios.');
      return;
    }

    try {
      // 1) Registrar usuário básico via /api/auth/register
      const registerRes = await api.post('/auth/register', {
        nome: form.nome,
        cpf: undefined, // cadastro novo não usa cpf no schema_usuarios
        email: form.email,
        username: form.username,
        senha: form.senha,
        cargo: form.cargo,
        departamento_id: form.departamento_id || null,
        servidor_id: Number(form.servidor_id),
        rubrica: form.rubrica,
        pode_assinar: form.pode_assinar,
        role: form.role,
        status: form.status,
      });

      const usuarioId: number = registerRes.data?.id || registerRes.data?.usuario?.id;
      if (!usuarioId) {
        toast.warning('Usuário cadastrado, mas ID não retornado.');
      }

      // 2) Criar permissões do usuário (apenas as marcadas como Permitido)
      if (usuarioId) {
        const permissoesAtivas: string[] = [];
        Object.entries(permissoesPorTela).forEach(([telaIdStr, perms]) => {
          const telaId = Number(telaIdStr);
          const acesso = acessoTela[telaId];
          perms.forEach((p) => {
            const status = permissoesSelecionadas[p.id];
            if (acesso && status === 'Permitido') {
              // Usaremos o código da permissão como identificador
              permissoesAtivas.push(p.codigo);
            }
          });
        });

        if (permissoesAtivas.length > 0) {
          try {
            await api.post(`/permissoes-usuario/usuario/${usuarioId}/bulk`, permissoesAtivas);
          } catch (e) {
            console.warn('Falha ao criar permissões em lote, tentando individualmente...', e);
            // fallback simples: tentar criar uma a uma
            for (const perm of permissoesAtivas) {
              try {
                await api.post(`/permissoes-usuario/`, {
                  usuario_id: usuarioId,
                  permissao: perm,
                  ativo: true,
                });
              } catch (ie) {
                console.error('Erro ao criar permissão individual', perm, ie);
              }
            }
          }
        }

        // 3) Criar associações de assinantes, se pode_assinar
        if (form.pode_assinar) {
          const ativos = Object.entries(assinantesSelecionados)
            .filter(([_, status]) => status === 'Permitido')
            .map(([assinanteId]) => Number(assinanteId));
          for (const assinanteId of ativos) {
            try {
              await api.post('/usuario-assinantes', {
                usuario_id: usuarioId,
                assinante_id: assinanteId,
                ativo: true,
              });
            } catch (ie) {
              console.error('Erro ao criar associação usuário-assinante', assinanteId, ie);
            }
          }
        }
      }

      toast.success('Usuário cadastrado com sucesso!');
      navigate('/cadastros/usuarios');
    } catch (err: any) {
      console.error('Erro ao cadastrar usuário', err);
      const msg = err?.response?.data?.detail || 'Falha ao cadastrar usuário';
      toast.error(msg);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || 'Usuário'}
        userRole={user?.cargo || 'Cargo'}
        breadcrumb={`Cadastrar Usuário`}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
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

          {/* Card: Dados do Usuário */}
          <Card className="p-4 bg-white mb-6">
            <CardHeader>
              <CardTitle>Dados do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" value={form.nome} onChange={handleChange} />
                  {fieldErrors.nome && <span className="text-red-600 text-sm">{fieldErrors.nome}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input id="username" name="username" value={form.username} onChange={handleChange} />
                  {fieldErrors.username && <span className="text-red-600 text-sm">{fieldErrors.username}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                  {fieldErrors.email && <span className="text-red-600 text-sm">{fieldErrors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <Input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} />
                  {fieldErrors.senha && <span className="text-red-600 text-sm">{fieldErrors.senha}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <Input id="confirmarSenha" name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={handleChange} />
                  {fieldErrors.confirmarSenha && <span className="text-red-600 text-sm">{fieldErrors.confirmarSenha}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Input id="cargo" name="cargo" value={form.cargo} onChange={handleChange} />
                  {fieldErrors.cargo && <span className="text-red-600 text-sm">{fieldErrors.cargo}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select onValueChange={(v) => setForm((p) => ({ ...p, departamento_id: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servidor_id">Servidor (ID) *</Label>
                  <Input id="servidor_id" name="servidor_id" value={String(form.servidor_id)} onChange={handleChange} />
                  {fieldErrors.servidor_id && <span className="text-red-600 text-sm">{fieldErrors.servidor_id}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rubrica">Rubrica *</Label>
                  <Input id="rubrica" name="rubrica" value={form.rubrica} onChange={handleChange} />
                  {fieldErrors.rubrica && <span className="text-red-600 text-sm">{fieldErrors.rubrica}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Pode Assinar</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.pode_assinar} onCheckedChange={(v) => setForm((p) => ({ ...p, pode_assinar: v }))} />
                    <span className="text-sm text-muted-foreground">{form.pode_assinar ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v: Role) => setForm((p) => ({ ...p, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: Status) => setForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!canSubmit} onClick={handleSubmit}>
                  Salvar Usuário
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: Permissões de Tela */}
          <Card className="p-4 bg-white mb-6">
            <CardHeader>
              <CardTitle>Permissões de Tela</CardTitle>
            </CardHeader>
            <CardContent>
              {telas.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhuma tela cadastrada ou não carregada.</div>
              ) : (
                <Tabs defaultValue={String(telas[0]?.id)} onValueChange={(val) => loadPermissoesForTela(Number(val))}>
                  <TabsList className="flex flex-wrap gap-2">
                    {telas.map((t) => (
                      <TabsTrigger key={t.id} value={String(t.id)}>{t.nome}</TabsTrigger>
                    ))}
                  </TabsList>
                  {telas.map((t) => (
                    <TabsContent key={t.id} value={String(t.id)}>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <Label>Acesso à tela</Label>
                          <Switch
                            checked={!!acessoTela[t.id]}
                            onCheckedChange={(v) => setAcessoTela((p) => ({ ...p, [t.id]: v }))}
                          />
                          <span className="text-sm text-muted-foreground">{acessoTela[t.id] ? 'Permitido' : 'Não Permitido'}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(permissoesPorTela[t.id] || []).map((perm) => (
                            <div key={perm.id} className="space-y-2">
                              <Label>{perm.nome}</Label>
                              <Select
                                value={permissoesSelecionadas[perm.id] || 'Não Permitido'}
                                onValueChange={(v: 'Permitido' | 'Não Permitido') =>
                                  setPermissoesSelecionadas((p) => ({ ...p, [perm.id]: v }))
                                }
                                disabled={!acessoTela[t.id]}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Permitido">Permitido</SelectItem>
                                  <SelectItem value="Não Permitido">Não Permitido</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Card: Permissões de Assinante */}
          {form.pode_assinar && (
            <Card className="p-4 bg-white mb-6">
              <CardHeader>
                <CardTitle>Permissões de Assinante</CardTitle>
              </CardHeader>
              <CardContent>
                {assinantes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nenhum assinante disponível.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assinantes.map((a) => (
                      <div key={a.id} className="space-y-2">
                        <Label>{a.nome} ({a.tipo_assinante})</Label>
                        <Select
                          value={assinantesSelecionados[a.id] || 'Não Permitido'}
                          onValueChange={(v: 'Permitido' | 'Não Permitido') =>
                            setAssinantesSelecionados((p) => ({ ...p, [a.id]: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Permitido">Permitido</SelectItem>
                            <SelectItem value="Não Permitido">Não Permitido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CadastrarUsuario;
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/config/api';

export interface FormState {
  nome: string;
  username: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  cargo: string;
  departamento_id: string | number;
  servidor_id: string | number;
  rubrica: string;
  pode_assinar: boolean;
  role: 'admin' | 'user';
  status: 'ativo' | 'inativo';
}

export const useCadastrarUsuario = () => {
  const [loading, setLoading] = useState(false);

  const submit = async (
    form: FormState,
    permissoesPorTela: Record<number, Array<{ id: number; codigo: string }>>,
    acessoTela: Record<number, boolean>,
    permissoesSelecionadas: Record<number, 'Permitido' | 'Não Permitido'>,
    assinantesSelecionados: Record<number, 'Permitido' | 'Não Permitido'>,
  ) => {
    setLoading(true);
    try {
      const registerRes = await api.post('/auth/register', {
        nome: form.nome,
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

      if (usuarioId) {
        const permissoesAtivas: string[] = [];
        Object.entries(permissoesPorTela).forEach(([telaIdStr, perms]) => {
          const telaId = Number(telaIdStr);
          const acesso = acessoTela[telaId];
          perms.forEach((p) => {
            const status = permissoesSelecionadas[p.id];
            if (acesso && status === 'Permitido') {
              permissoesAtivas.push(p.codigo);
            }
          });
        });

        if (permissoesAtivas.length > 0) {
          try {
            await api.post(`/permissoes-usuario/usuario/${usuarioId}/bulk`, permissoesAtivas);
          } catch (e) {
            for (const perm of permissoesAtivas) {
              try {
                await api.post(`/permissoes-usuario/`, {
                  usuario_id: usuarioId,
                  permissao: perm,
                  ativo: true,
                });
              } catch {}
            }
          }
        }

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
            } catch {}
          }
        }
      }
      toast.success('Usuário cadastrado com sucesso!');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Falha ao cadastrar usuário';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
};
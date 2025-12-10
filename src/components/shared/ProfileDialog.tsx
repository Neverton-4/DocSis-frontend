import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card-component';
import { toast } from 'sonner';
import { User, Lock, Save, X, Briefcase, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword } from '@/services/authService';

interface ProfileDialogProps {
  children: React.ReactNode;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'functional' | 'password'>('profile');
  
  // Estados de edição por aba
  const [editProfile, setEditProfile] = useState(false)
  const [editFunctional, setEditFunctional] = useState(false)
  const [editPassword, setEditPassword] = useState(false)

  // Profile state (somente leitura inicialmente)
  const [profileData, setProfileData] = useState({
    nome: user?.nome || '',
    username: user?.username || '',
    email: user?.email || ''
  });

  // Functional state
  const [functionalData, setFunctionalData] = useState({
    secretaria: user?.secretaria?.nome || user?.secretaria?.abrev || '',
    departamento: user?.departamento?.nome || '',
    cargo: user?.cargo || '',
    rubrica: (user as any)?.rubrica || ''
  })
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFunctionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFunctionalData(prev => ({ ...prev, [name]: value }))
  }

  const startEdit = (tab: 'profile' | 'functional' | 'password') => {
    setEditProfile(tab === 'profile')
    setEditFunctional(tab === 'functional')
    setEditPassword(tab === 'password')
  }

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!profileData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!profileData.username.trim()) newErrors.username = 'Username é obrigatório';
    if (!profileData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) newErrors.email = 'E-mail inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFunctional = () => {
    const newErrors: Record<string, string> = {};
    if (!functionalData.secretaria.trim()) newErrors.secretaria = 'Secretaria é obrigatória';
    if (!functionalData.departamento.trim()) newErrors.departamento = 'Departamento é obrigatório';
    if (!functionalData.cargo.trim()) newErrors.cargo = 'Cargo é obrigatório';
    if (!functionalData.rubrica.trim()) newErrors.rubrica = 'Rubrica é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setLoading(true);
    try {
      const payload: any = {}
      if (profileData.email !== user?.email) payload.email = profileData.email
      if (profileData.username !== user?.username) payload.username = profileData.username
      if (Object.keys(payload).length > 0) {
        await updateProfile(payload);
      }
      toast.success('Perfil atualizado com sucesso!');
      setEditProfile(false)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFunctionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFunctional()) return
    setLoading(true)
    try {
      const payload: any = {}
      if (functionalData.cargo !== (user?.cargo || '')) payload.cargo = functionalData.cargo
      if (functionalData.rubrica !== ((user as any)?.rubrica || '')) payload.rubrica = functionalData.rubrica
      if (Object.keys(payload).length > 0 && user?.id) {
        await (await import('@/services/usuarioService')).usuarioService.update(user.id, payload)
      }
      toast.success('Dados funcionais atualizados com sucesso!')
      setEditFunctional(false)
    } catch (error) {
      console.error('Erro ao atualizar dados funcionais:', error)
      toast.error('Erro ao atualizar dados funcionais. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setLoading(true);
    try {
      await changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      toast.success('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      if (error.response?.status === 400) {
        toast.error('Senha atual incorreta.');
      } else {
        toast.error('Erro ao alterar senha. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Por favor, tente novamente.');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl bg-white p-6 rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold mb-4 flex justify-between items-center">
            <span>Meu Perfil</span>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </Dialog.Title>
          
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="inline mr-2 h-4 w-4" />
              Perfil
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'functional' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('functional')}
            >
              <Briefcase className="inline mr-2 h-4 w-4" />
              Dados Funcionais
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'password' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock className="inline mr-2 h-4 w-4" />
              Senha
            </button>
          </div>
          
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" name="nome" value={profileData.nome} onChange={handleProfileChange} disabled={!editProfile} className={errors.nome ? 'border-red-500' : ''} />
                  {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={profileData.username} onChange={handleProfileChange} disabled={!editProfile} className={errors.username ? 'border-red-500' : ''} />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} disabled={!editProfile} className={errors.email ? 'border-red-500' : ''} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type={editProfile ? 'submit' : 'button'} onClick={!editProfile ? () => startEdit('profile') : undefined} disabled={loading}>
                  {loading ? 'Salvando...' : (editProfile ? 'Salvar' : 'Editar')}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'functional' && (
            <form onSubmit={handleFunctionalSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="secretaria">Secretaria</Label>
                  <Input id="secretaria" name="secretaria" value={functionalData.secretaria} onChange={handleFunctionalChange} disabled={!editFunctional} className={errors.secretaria ? 'border-red-500' : ''} />
                  {errors.secretaria && <p className="text-red-500 text-sm mt-1">{errors.secretaria}</p>}
                </div>
                <div>
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input id="departamento" name="departamento" value={functionalData.departamento} onChange={handleFunctionalChange} disabled={!editFunctional} className={errors.departamento ? 'border-red-500' : ''} />
                  {errors.departamento && <p className="text-red-500 text-sm mt-1">{errors.departamento}</p>}
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" value={functionalData.cargo} onChange={handleFunctionalChange} disabled={!editFunctional} className={errors.cargo ? 'border-red-500' : ''} />
                  {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>}
                </div>
                <div>
                  <Label htmlFor="rubrica">Rubrica</Label>
                  <Input id="rubrica" name="rubrica" value={functionalData.rubrica} onChange={handleFunctionalChange} disabled={!editFunctional} className={errors.rubrica ? 'border-red-500' : ''} />
                  {errors.rubrica && <p className="text-red-500 text-sm mt-1">{errors.rubrica}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type={editFunctional ? 'submit' : 'button'} onClick={!editFunctional ? () => startEdit('functional') : undefined} disabled={loading}>
                  {loading ? 'Salvando...' : (editFunctional ? 'Salvar' : 'Editar')}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} className={errors.currentPassword ? 'border-red-500' : ''} />
                  {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                </div>
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} className={errors.newPassword ? 'border-red-500' : ''} />
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={errors.confirmPassword ? 'border-red-500' : ''} />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Alterando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProfileDialog;
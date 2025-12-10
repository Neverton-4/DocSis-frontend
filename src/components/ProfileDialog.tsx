import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Building, Briefcase, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface ProfileDialogProps {
  children: React.ReactNode;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ children }) => {
  const { user, checkAuth } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Atualizar dados quando o usuário ou diálogo abrir
  React.useEffect(() => {
    if (isOpen && user) {
      setEditData({
        email: user.email || '',
        username: user.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else if (!isOpen) {
      // Reset do estado de edição quando o diálogo fechar
      setIsEditing(false);
    }
  }, [isOpen, user]);

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Garantir que o modo de edição seja resetado ao fechar
      setIsEditing(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditData({
        email: user?.email || '',
        username: user?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Validações básicas
      if (editData.newPassword && editData.newPassword !== editData.confirmPassword) {
          toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        return;
      }
      
      if (editData.newPassword && editData.newPassword.length < 8) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 8 caracteres",
          variant: "destructive",
        });
        return;
      }
      
      // Atualizar perfil (email e username)
      if (editData.email !== user?.email || editData.username !== user?.username) {
        await axios.put('/auth/profile', {
          email: editData.email,
          username: editData.username
        });
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        });
      }
      
      // Atualizar senha se fornecida
      if (editData.newPassword && editData.currentPassword) {
        await axios.put('/auth/password', {
          current_password: editData.currentPassword,
          new_password: editData.newPassword,
          confirm_password: editData.confirmPassword
        });
        toast({
          title: "Sucesso",
          description: "Senha alterada com sucesso!",
        });
      }
      
      // Atualizar contexto do usuário
      await checkAuth();
      
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const message = error.response?.data?.detail || 'Erro ao salvar alterações';
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      email: user?.email || '',
      username: user?.username || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </DialogTitle>
          <DialogDescription>
            Visualize e edite suas informações pessoais
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Informações Pessoais */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Informações Pessoais</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome
                </Label>
                <div className="p-1.5 bg-gray-50 rounded-md text-sm">
                  {user?.nome || 'Não informado'}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Cargo
                </Label>
                <div className="p-1.5 bg-gray-50 rounded-md text-sm">
                  {user?.cargo || 'Não informado'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    placeholder="Digite seu email"
                    className="h-8"
                  />
                ) : (
                  <div className="p-1.5 bg-gray-50 rounded-md text-sm">
                    {user?.email || 'Não informado'}
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuário
                </Label>
                {isEditing ? (
                  <Input
                    name="username"
                    type="text"
                    value={editData.username}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome de usuário"
                    className="h-8"
                  />
                ) : (
                  <div className="p-1.5 bg-gray-50 rounded-md text-sm">
                    {user?.username || 'Não informado'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Departamento
                </Label>
                <div className="p-1.5 bg-gray-50 rounded-md text-sm">
                  {user?.departamento?.nome || 'Não informado'}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Secretaria
                </Label>
                <div className="p-1.5 bg-gray-50 rounded-md text-sm">
                  {user?.secretaria?.nome || 'Não informado'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Alteração de Senha */}
          {isEditing && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                
                <div className="space-y-1.5">
                  <Label>Senha Atual</Label>
                  <Input
                    name="currentPassword"
                    type="password"
                    value={editData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha atual"
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Nova Senha</Label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={editData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Digite sua nova senha"
                    className="h-8"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={editData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua nova senha"
                    className="h-8"
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <Button onClick={handleEditToggle} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
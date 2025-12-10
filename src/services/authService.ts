import api from '@/config/api';

// Função para atualizar o perfil do usuário
export const updateProfile = async (profileData: { email?: string; username?: string }) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

// Função para alterar a senha do usuário
export const changePassword = async (passwordData: { current_password: string; new_password: string }) => {
  try {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
};
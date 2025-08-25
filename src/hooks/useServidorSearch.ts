import { useState } from 'react';
import api from '@/config/api'; // ✅ Usar configuração centralizada
import { toast } from 'sonner';
import { Servidor } from '@/types';

export const useServidorSearch = () => {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSearchServidor = async (value: string) => {
    if (value.length < 3) {
      setServidores([]);
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await api.get(`/processos/servidores?nome=${value}`);
      setServidores(response.data);
      setShowAutocomplete(true);
    } catch (error) {
      console.error('Erro ao buscar servidores:', error);
      toast.error('Erro ao buscar servidores');
    }
  };

  return {
    servidores,
    showAutocomplete,
    setShowAutocomplete,
    searchTimeout,
    setSearchTimeout,
    handleSearchServidor
  };
};
import { useState } from 'react';
import { Customer, TipoProcesso, TipoServidor } from '../types';

export const useProtocoloForm = () => {
  const [formData, setFormData] = useState<Customer>({
    // ... estado inicial do formData ...
  });

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

  const handleTipoProcessoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipoProcesso: value as TipoProcesso
    }));
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSelectChange,
    handleTipoProcessoChange
  };
};
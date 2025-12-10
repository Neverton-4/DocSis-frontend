import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Customer } from '@/types';

interface Props {
  formData: Customer;
  setFormData: React.Dispatch<React.SetStateAction<Customer>>;
}

const AutocompleteServidor: React.FC<Props> = ({ formData, setFormData }) => {
  const [query, setQuery] = useState('');
  const [servidores, setServidores] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setServidores([]);
      setShowAutocomplete(false);
      return;
    }

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/processos/servidores?nome=${query}`);
        setServidores(response.data);
        setShowAutocomplete(true);
      } catch (error) {
        console.error('Erro ao buscar servidores:', error);
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (servidor: any) => {
    // Obter primeiro endereço se existir
    const primeiroEndereco = servidor.enderecos?.[0];
    
    setFormData(prev => ({
      ...prev,
      fullName: servidor?.nome_completo || '',
      cpf: servidor?.cpf || '',
      rg: servidor?.rg || '',
      endereco: {
        logradouro: primeiroEndereco?.logradouro || '',
        bairro: primeiroEndereco?.bairro || '',
        numero: primeiroEndereco?.numero || '',
        complemento: primeiroEndereco?.complemento || '',
        cidade: primeiroEndereco?.cidade || '',
        uf: primeiroEndereco?.uf || '',
        cep: primeiroEndereco?.cep || '',
      },
      tipoServidor: servidor?.tipo_servidor || '',
      // Mapear lotação e cargo dos objetos aninhados
      lotacao: servidor?.lotacao?.abrev || '',
      secretaria_id: servidor?.secretaria_id || 0,
      cargo: servidor?.cargo?.nome || servidor?.cargo_2?.nome || '',
      sexo: servidor?.sexo || '',
      secretaria: servidor?.secretaria || '',
      contato: servidor?.contato || '',
      is_whatsapp: servidor?.is_whatsapp || false,
      email: servidor?.email || '',
      dateOfBirth: servidor?.data_nascimento || '',
    }));
    setShowAutocomplete(false);
    setQuery(servidor?.nome_completo || '');
  };

  return (
    <div className="mb-6 relative">
      <label htmlFor="fullName" className="block font-semibold mb-1">Nome Completo</label>
      <input
        id="fullName"
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full border rounded p-2"
      />
      {showAutocomplete && servidores.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-auto rounded mt-1">
          {servidores.map(s => (
            <li
              key={s.id}
              className="cursor-pointer p-2 hover:bg-gray-100"
              onClick={() => handleSelect(s)}
            >
              {s?.nome_completo || 'Nome não informado'} - CPF: {s?.cpf || 'CPF não informado'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteServidor;

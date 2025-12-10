import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UsuariosSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const UsuariosSearch: React.FC<UsuariosSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar por nome, cargo ou departamento..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 w-80"
        aria-label="Buscar usuários"
      />
    </div>
  );
};

export default UsuariosSearch;
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ServidoresSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ServidoresSearch: React.FC<ServidoresSearchProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar por nome, CPF ou email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 w-80"
      />
    </div>
  );
};

export default ServidoresSearch;
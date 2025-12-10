import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DashboardSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DashboardSearch: React.FC<DashboardSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por ID, nome, CPF, matrícula ou status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 w-96"
        />
      </div>
    </div>
  );
};

export default DashboardSearch;
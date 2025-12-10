import React from 'react';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import UsuariosActions from './components/UsuariosActions';
import UsuariosSearch from './components/UsuariosSearch';
import UsuariosLoading from './components/UsuariosLoading';
import UsuariosTable from './components/UsuariosTable';
import useUsuariosDashboard from './hooks/useUsuariosDashboard';

const UsuariosDashboard: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    usuariosFiltrados,
    loading,
    sortField,
    sortDirection,
    toggleSort,
    refetchUsuarios
  } = useUsuariosDashboard();

  const { user } = useAuth();

  if (loading) {
    return <UsuariosLoading />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || 'Usuário'}
        userRole={user?.cargo || 'Cargo'}
        breadcrumb={`Usuários - ${user?.secretaria?.nome || 'Secretaria'}`}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <UsuariosActions />

            <UsuariosSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <UsuariosTable
            usuarios={usuariosFiltrados}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSort={toggleSort}
            onDeleted={refetchUsuarios}
          />
        </div>
      </div>
    </div>
  );
};

export default UsuariosDashboard;
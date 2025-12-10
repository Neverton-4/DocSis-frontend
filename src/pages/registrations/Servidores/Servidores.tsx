import React from 'react';
import ServidoresTable from './components/ServidoresTable';
import { Header } from '@/components/layout';
import ServidoresActions from './components/ServidoresActions';
import ServidoresSearch from './components/ServidoresSearch';
import ServidoresLoading from './components/ServidoresLoading';
import useServidoresDashboard from './hooks/useServidoresDashboard';
import { useAuth } from '@/contexts/AuthContext';

const ServidoresDashboard: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    yearDialogOpen,
    setYearDialogOpen,
    selectedYear,
    setSelectedYear,
    isLoading,
    showStats,
    setShowStats,
    servidores,
    loading,
    filteredServidores,
    handleYearChange,
    totalPages,
    protocolTypeDialogOpen,
    setProtocolTypeDialogOpen,
    registrationDialogOpen,
    setRegistrationDialogOpen
  } = useServidoresDashboard();

  const { user } = useAuth();

  if (loading) {
    return <ServidoresLoading />;
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb={`Servidores - ${user?.secretaria?.nome || 'Secretaria'}`}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <ServidoresActions />

            <ServidoresSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <ServidoresTable 
            servidores={filteredServidores}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default ServidoresDashboard;
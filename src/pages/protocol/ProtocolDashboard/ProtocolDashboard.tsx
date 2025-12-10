import React from 'react';
import CustomerTable from '@/components/CustomerTable';
import { Header } from '@/components/layout';
import DashboardStats from '@/pages/protocol/ProtocolDashboard/components/DashboardStats';
import DashboardActions from '@/pages/protocol/ProtocolDashboard/components/DashboardActions';
import DashboardSearch from '@/pages/protocol/ProtocolDashboard/components/DashboardSearch';
import DashboardLoading from '@/pages/protocol/ProtocolDashboard/components/DashboardLoading';
import useDashboard from '@/hooks/useDashboard';
import { useAuth } from '../../../contexts/AuthContext';

const Dashboard: React.FC = () => {
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
    processos,
    loading,
    filteredProcessos,
    handleYearChange,
    totalPages,
    protocolTypeDialogOpen,
    setProtocolTypeDialogOpen,
    registrationDialogOpen,
    setRegistrationDialogOpen
  } = useDashboard();

  const { user } = useAuth();

  if (loading) {
    return <DashboardLoading />;
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb={`Protocolos - ${user?.secretaria?.nome || 'Secretaria'}`}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 pt-0 max-w-[1280px] mx-auto">
          <DashboardStats 
            processos={processos}
            showStats={showStats}
            setShowStats={setShowStats}
          />
          
          <div className="flex justify-between items-center mb-6">
            <DashboardActions 
              yearDialogOpen={yearDialogOpen}
              setYearDialogOpen={setYearDialogOpen}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              isLoading={isLoading}
              handleYearChange={handleYearChange}
              protocolTypeDialogOpen={protocolTypeDialogOpen}
              setProtocolTypeDialogOpen={setProtocolTypeDialogOpen}
              registrationDialogOpen={registrationDialogOpen}
              setRegistrationDialogOpen={setRegistrationDialogOpen}
            />

            <DashboardSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <CustomerTable 
            processos={filteredProcessos}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

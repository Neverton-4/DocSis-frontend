import React, { useState } from 'react';
import { Loader2, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout';
import { CustomerTable } from '@/components/CustomerTable';
import { useServidorManagement } from './hooks';

// Componente principal
const Servidor = () => {
  const {
    // Tab states
    activeTab,
    handleTabChange,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    
    // Data states
    processos,
    filteredProcessos,
    loading,
    error,
    refetch,
    
    // Pagination states
    currentPage,
    setCurrentPage,
    totalPages
  } = useServidorManagement();

  const handleSearch = () => {
    // Trigger search with current filters
    refetch();
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'processos':
        return 'Processos';
      case 'diarias':
        return 'Diárias';
      case 'suprimento':
        return 'Suprimento de Fundos';
      default:
        return 'Processos';
    }
  };

  const getTabCount = (tab: string) => {
    if (tab === 'processos') {
      // Para a aba processos, retorna o total de processos filtrados
      return filteredProcessos.length;
    }
    // Para outras abas (diárias, suprimento), mantém a lógica original
    return filteredProcessos.filter(p => p.tipo_processo === tab).length;
  };

  // Generate years for selector (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch}>Tentar Novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Servidor" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Abas do lado esquerdo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('processos')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'processos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Processos ({getTabCount('processos')})
            </button>
            <button
              onClick={() => handleTabChange('diarias')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'diarias'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Diárias ({getTabCount('diarias')})
            </button>
            <button
              onClick={() => handleTabChange('suprimento')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'suprimento'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Suprimento de Fundos ({getTabCount('suprimento')})
            </button>
          </div>
          
          {/* Controles do lado direito */}
          <div className="flex items-center gap-4">
            {/* Seletor de Ano */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Campo de Busca */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, protocolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleSearch}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Conteúdo baseado na aba ativa */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getTabLabel(activeTab)}</h2>
            <div className="text-sm text-gray-500">
              {getTabCount(activeTab)} registros encontrados
            </div>
          </div>
          
          <CustomerTable
            processos={filteredProcessos}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            redirectPath="/servidor/processo"
          />
        </div>
      </div>
    </div>
  );
};

export default Servidor;
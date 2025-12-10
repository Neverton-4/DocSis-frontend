import React, { useState } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout';
import { AssessorTable } from './components/AssessorTable';
import { useAssessorManagement } from './hooks';

// Componente principal
const Assessorias = () => {
  const {
    // Tab states
    activeTab,
    handleTabChange,
    
    // Filter states
    viewMode,
    setViewMode,
    
    // Data states
    assessores,
    filteredAssessores,
    loading,
    error,
    refetch
  } = useAssessorManagement();

  const handlePrint = () => {
    window.print();
  };

  const getTabLimits = (tab: string) => {
    switch (tab) {
      case 'assessores1':
        return 25;
      case 'assessores2':
        return 30;
      case 'assessores3':
        return 25;
      default:
        return 25;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'assessores1':
        return 'Assessores I';
      case 'assessores2':
        return 'Assessores II';
      case 'assessores3':
        return 'Assessores III';
      default:
        return 'Assessores I';
    }
  };

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
        breadcrumb="Assessorias" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Abas do lado esquerdo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('assessores1')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'assessores1'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assessores I ({Math.min(filteredAssessores.filter(a => a.categoria === 'I').length, getTabLimits('assessores1'))})
            </button>
            <button
              onClick={() => handleTabChange('assessores2')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'assessores2'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assessores II ({Math.min(filteredAssessores.filter(a => a.categoria === 'II').length, getTabLimits('assessores2'))})
            </button>
            <button
              onClick={() => handleTabChange('assessores3')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'assessores3'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assessores III ({Math.min(filteredAssessores.filter(a => a.categoria === 'III').length, getTabLimits('assessores3'))})
            </button>
          </div>
          
          {/* Controles do lado direito */}
          <div className="flex items-center gap-4">
            {/* Radio buttons para Histórico/Ativos */}
            <div className="flex items-center gap-4 bg-white rounded-lg p-2 border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  value="ativos"
                  checked={viewMode === 'ativos'}
                  onChange={(e) => setViewMode(e.target.value as 'ativos' | 'historico')}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium">Ativos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="viewMode"
                  value="historico"
                  checked={viewMode === 'historico'}
                  onChange={(e) => setViewMode(e.target.value as 'ativos' | 'historico')}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium">Histórico</span>
              </label>
            </div>
            
            {/* Botão Imprimir */}
            <Button 
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </div>
        
        {/* Conteúdo baseado na aba ativa */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getTabLabel(activeTab)}</h2>
            <div className="text-sm text-gray-500">
              {viewMode === 'ativos' ? `Limite: ${getTabLimits(activeTab)} assessores` : 'Sem limite de registros'}
            </div>
          </div>
          
          <AssessorTable 
            assessores={filteredAssessores}
            activeTab={activeTab}
            viewMode={viewMode}
            limit={viewMode === 'ativos' ? getTabLimits(activeTab) : undefined}
            onRefetch={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default Assessorias;
import { useState, useEffect } from 'react';

type TabType = 'documento' | 'anexos';

const TAB_STORAGE_KEY = 'signatureViewer_activeTab';

export const useTabPersistence = (defaultTab: TabType = 'documento') => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  // Carregar o estado da aba do localStorage na inicialização
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
      if (savedTab && (savedTab === 'documento' || savedTab === 'anexos')) {
        setActiveTab(savedTab as TabType);
      }
    } catch (error) {
      console.warn('Erro ao carregar estado da aba do localStorage:', error);
      // Em caso de erro, usar o valor padrão
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Função para alterar a aba e persistir no localStorage
  const handleTabChange = (tab: TabType) => {
    try {
      setActiveTab(tab);
      localStorage.setItem(TAB_STORAGE_KEY, tab);
    } catch (error) {
      console.warn('Erro ao salvar estado da aba no localStorage:', error);
      // Mesmo com erro no localStorage, ainda atualiza o estado local
      setActiveTab(tab);
    }
  };

  // Função para limpar o estado persistido (opcional)
  const clearPersistedTab = () => {
    try {
      localStorage.removeItem(TAB_STORAGE_KEY);
      setActiveTab(defaultTab);
    } catch (error) {
      console.warn('Erro ao limpar estado da aba do localStorage:', error);
    }
  };

  return {
    activeTab,
    handleTabChange,
    clearPersistedTab
  };
};
import { useState, useEffect } from 'react'

type TabType = 'documento' | 'anexos'

const TAB_STORAGE_KEY = 'publicationViewer_activeTab'

export const useTabPersistence = (defaultTab: TabType = 'documento') => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)

  useEffect(() => {
    try {
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY)
      if (savedTab && (savedTab === 'documento' || savedTab === 'anexos')) {
        setActiveTab(savedTab as TabType)
      }
    } catch {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  const handleTabChange = (tab: TabType) => {
    try {
      setActiveTab(tab)
      localStorage.setItem(TAB_STORAGE_KEY, tab)
    } catch {
      setActiveTab(tab)
    }
  }

  const clearPersistedTab = () => {
    try {
      localStorage.removeItem(TAB_STORAGE_KEY)
      setActiveTab(defaultTab)
    } catch {}
  }

  return { activeTab, handleTabChange, clearPersistedTab }
}
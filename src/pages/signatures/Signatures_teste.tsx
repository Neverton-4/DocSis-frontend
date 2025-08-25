import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortarias } from '@/hooks/usePortarias';
import { useAssinaturas } from '@/hooks/useAssinaturas';
import { useAuth } from '@/contexts/AuthContext';
import { Portaria } from '@/types';
import { AssinaturaPortaria } from '@/services/assinaturaService';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { SignatureHeader } from './components/SignatureHeader';
import { SignatureTabs } from './components/SignatureTabs';
import { SignatureModals } from './components/SignatureModals';
import { useSignatureLogic } from './hooks/useSignatureLogic';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';

// Dados mock para decretos e diárias (até serem integrados)
const mockDecretos = [
  {
    id: 1,
    number: '004/2024',
    server: 'João Silva',
    title: 'Designação de Comissão',
    date: '18/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: ['Secretário']
  }
];

const mockDiarias = [
  {
    id: 1,
    number: '006/2024',
    server: 'Pedro Costa',
    title: 'Viagem Oficial a Campo Grande',
    date: '20/01/2024',
    requiredSignatures: ['Secretário', 'Prefeito'],
    completedSignatures: []
  }
];

export const Signatures = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('portarias');
  const [currentYear, setCurrentYear] = useState('2025');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Integração com dados reais das portarias
  const { portarias, loading, error, fetchByStatus } = usePortarias();
  const { fetchByPortaria } = useAssinaturas();
  const { user } = useAuth();
  const [pendingPortarias, setPendingPortarias] = useState<Portaria[]>([]);
  const [portariasSignatures, setPortariasSignatures] = useState<Record<number, AssinaturaPortaria[]>>({});
  
  // Estados para assinatura em lote
  const [isBatchSignDialogOpen, setIsBatchSignDialogOpen] = useState(false);
  const [selectedPortariasForBatch, setSelectedPortariasForBatch] = useState<number[]>([]);
  const [selectAllPortarias, setSelectAllPortarias] = useState(false);
  
  const buttonData = getSignatureButtonsData(doc);
return (
  <div className="flex gap-2">
    {buttonData.map((button) => (
      <Button
        key={button.id}
        onClick={button.onClick}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
        disabled={button.disabled}
      >
        {button.text}
      </Button>
    ))}
  </div>
);

  // Hook customizado para lógica de assinatura
  const signatureLogic = useSignatureLogic({
    pendingPortarias,
    portariasSignatures,
    setPortariasSignatures,
    fetchByStatus,
    fetchByPortaria,
    toast
  });

  // Buscar portarias com status 'aguardando_assinatura'
  useEffect(() => {
    const loadPendingPortarias = async () => {
      try {
        await fetchByStatus('aguardando_assinatura');
      } catch (err) {
        console.error('Erro ao carregar portarias pendentes:', err);
      }
    };
    
    loadPendingPortarias();
  }, []);

  // Atualizar portarias pendentes quando os dados chegarem
  useEffect(() => {
    setPendingPortarias(portarias.filter(p => p.status === 'aguardando_assinatura'));
  }, [portarias]);

  // Buscar assinaturas para cada portaria
  useEffect(() => {
    const loadSignatures = async () => {
      if (pendingPortarias.length === 0) return;
      
      const signaturesMap: Record<number, AssinaturaPortaria[]> = {};
      
      for (const portaria of pendingPortarias) {
        try {
          const signatures = await fetchByPortaria(portaria.id);
          signaturesMap[portaria.id] = signatures;
        } catch (err) {
          console.error(`Erro ao carregar assinaturas da portaria ${portaria.id}:`, err);
          signaturesMap[portaria.id] = [];
        }
      }
      
      setPortariasSignatures(signaturesMap);
    };
    
    loadSignatures();
  }, [pendingPortarias, fetchByPortaria]);

  const handleYearChange = () => {
    setCurrentYear(selectedYear);
    setIsYearDialogOpen(false);
  };

  const handleViewDocument = (doc: any) => {
    if (activeTab === 'portarias') {
      navigate(`/document-viewer/${doc.id}`);
    } else {
      navigate(`/document-viewer/${doc.id}`);
    }
  };

  // Funções para assinatura em lote
  const handleSelectAllPortarias = (checked: boolean) => {
    setSelectAllPortarias(checked);
    if (checked) {
      setSelectedPortariasForBatch(pendingPortarias.map(p => p.id));
    } else {
      setSelectedPortariasForBatch([]);
    }
  };

  const handleSelectPortaria = (portariaId: number, checked: boolean) => {
    if (checked) {
      setSelectedPortariasForBatch(prev => [...prev, portariaId]);
    } else {
      setSelectedPortariasForBatch(prev => prev.filter(id => id !== portariaId));
      setSelectAllPortarias(false);
    }
  };

  const handleBatchSign = async () => {
    // Implementar lógica de assinatura em lote
    console.log('Assinar em lote:', selectedPortariasForBatch);
    setIsBatchSignDialogOpen(false);
    setSelectedPortariasForBatch([]);
    setSelectAllPortarias(false);
  };

  if (loading && activeTab === 'portarias') {
    return <LoadingSpinner />;
  }

  if (error && activeTab === 'portarias') {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName={user?.nome || "Usuário"} 
        userRole={user?.cargo || "Usuário"} 
        breadcrumb="Documentos / Assinaturas Pendentes" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignatureHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentYear={currentYear}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          isYearDialogOpen={isYearDialogOpen}
          setIsYearDialogOpen={setIsYearDialogOpen}
          handleYearChange={handleYearChange}
        />
        
        <SignatureTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          pendingPortarias={pendingPortarias}
          portariasSignatures={portariasSignatures}
          mockDecretos={mockDecretos}
          mockDiarias={mockDiarias}
          handleViewDocument={handleViewDocument}
          signatureLogic={signatureLogic}
          isBatchSignDialogOpen={isBatchSignDialogOpen}
          setIsBatchSignDialogOpen={setIsBatchSignDialogOpen}
          selectedPortariasForBatch={selectedPortariasForBatch}
          selectAllPortarias={selectAllPortarias}
          handleSelectAllPortarias={handleSelectAllPortarias}
          handleSelectPortaria={handleSelectPortaria}
          handleBatchSign={handleBatchSign}
        />
      </div>
      
      <SignatureModals
        signatureLogic={signatureLogic}
      />
    </div>
  );
};

export default Signatures;


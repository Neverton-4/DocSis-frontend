import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Gavel, Car, Bell } from 'lucide-react';
import { PortariasTab } from './PortariasTab';
import { DecretosTab } from './DecretosTab';
import { DiariasTab } from './DiariasTab';
import { SignatureHeader } from './SignatureHeader';
import { Portaria } from '@/types';
import { AssinaturaPortaria } from '@/services/assinaturaService';

interface SignatureTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  pendingPortarias: Portaria[];
  portariasSignatures: Record<number, AssinaturaPortaria[]>;
  mockDecretos: any[];
  mockDiarias: any[];
  handleViewDocument: (doc: any) => void;
  signatureLogic: any;
  isBatchSignDialogOpen: boolean;
  setIsBatchSignDialogOpen: (open: boolean) => void;
  selectedPortariasForBatch: number[];
  selectAllPortarias: boolean;
  handleSelectAllPortarias: (checked: boolean) => void;
  handleSelectPortaria: (portariaId: number, checked: boolean) => void;
  handleBatchSign: () => void;
}

export const SignatureTabs: React.FC<SignatureTabsProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  pendingPortarias,
  portariasSignatures,
  mockDecretos,
  mockDiarias,
  handleViewDocument,
  signatureLogic,
  isBatchSignDialogOpen,
  setIsBatchSignDialogOpen,
  selectedPortariasForBatch,
  selectAllPortarias,
  handleSelectAllPortarias,
  handleSelectPortaria,
  handleBatchSign
}) => {
  // Filtrar documentos baseado na aba ativa e busca
  const getFilteredDocuments = () => {
    let documents: any[] = [];
    
    switch (activeTab) {
      case 'portarias':
        documents = pendingPortarias.map(p => {
          const signatures = portariasSignatures[p.id] || [];
          const completedSignatures = ['Secretário', 'Prefeito'].filter(tipo => 
            signatureLogic.isSignatureCompleted(p.id, tipo)
          );
          
          return {
            id: p.id,
            number: `${p.numero}/${p.ano}`,
            type: 'portarias',
            server: p.servidor?.nome_completo || 'Não informado',
            title: `${p.tipo_portaria?.nome || 'Tipo não informado'}${p.subtipo_portaria ? ` - ${p.subtipo_portaria.nome}` : ''}`,
            date: new Date(p.data_portaria).toLocaleDateString('pt-BR'),
            requiredSignatures: ['Secretário', 'Prefeito'],
            completedSignatures,
            originalData: p
          };
        });
        break;
      case 'decretos':
        documents = mockDecretos.map(d => ({ ...d, type: 'decretos' }));
        break;
      case 'diarias':
        documents = mockDiarias.map(d => ({ ...d, type: 'diarias' }));
        break;
    }

    if (!searchTerm) return documents;
    
    const searchLower = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.number.toLowerCase().includes(searchLower) ||
      doc.server.toLowerCase().includes(searchLower) ||
      doc.title.toLowerCase().includes(searchLower)
    );
  };

  const filteredDocuments = getFilteredDocuments();

  // Contar documentos por tipo
  const getDocumentCount = (type: string) => {
    switch (type) {
      case 'portarias':
        return pendingPortarias.length;
      case 'decretos':
        return mockDecretos.length;
      case 'diarias':
        return mockDiarias.length;
      default:
        return 0;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex justify-between items-center">
        <TabsList className="grid grid-cols-3 w-auto">
          <TabsTrigger value="portarias" className="flex items-center gap-2 relative">
            <FileText className="w-4 h-4" />
            Portarias
            {getDocumentCount('portarias') > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                <Bell className="w-3 h-3" />
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger value="decretos" className="flex items-center gap-2 relative">
            <Gavel className="w-4 h-4" />
            Decretos
            {getDocumentCount('decretos') > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                <Bell className="w-3 h-3" />
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger value="diarias" className="flex items-center gap-2 relative">
            <Car className="w-4 h-4" />
            Diárias
            {getDocumentCount('diarias') > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                <Bell className="w-3 h-3" />
              </div>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="portarias" className="mt-0">
        <PortariasTab
          filteredDocuments={filteredDocuments}
          searchTerm={searchTerm}
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
      </TabsContent>

      <TabsContent value="decretos" className="mt-0">
        <DecretosTab
          filteredDocuments={filteredDocuments}
          searchTerm={searchTerm}
          handleViewDocument={handleViewDocument}
        />
      </TabsContent>

      <TabsContent value="diarias" className="mt-0">
        <DiariasTab
          filteredDocuments={filteredDocuments}
          searchTerm={searchTerm}
          handleViewDocument={handleViewDocument}
        />
      </TabsContent>
    </Tabs>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Gavel, Car, FileSignature } from 'lucide-react';
import { DocumentCard } from './DocumentCard';

interface DocumentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  filteredDocuments: any[];
  searchTerm: string;
  getDocumentCount: (type: string) => number;
  isSignatureCompleted: (portariaId: number, tipoAssinatura: string) => boolean;
  onViewDocument: (doc: any) => void;
  onSignDocument: (doc: any, tipoAssinatura?: string) => void;
  isSigningDocument: boolean;
  // Batch signing props
  selectedPortarias?: number[];
  selectAllPortarias?: boolean;
  onTogglePortariaSelection?: (portariaId: number) => void;
  onToggleSelectAllPortarias?: () => void;
  onOpenBatchSignDialog?: () => void;
  // Refresh data function
  refreshData?: () => Promise<void>;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  activeTab,
  onTabChange,
  filteredDocuments,
  searchTerm,
  getDocumentCount,
  isSignatureCompleted,
  onViewDocument,
  onSignDocument,
  isSigningDocument,
  selectedPortarias = [],
  selectAllPortarias = false,
  onTogglePortariaSelection,
  onToggleSelectAllPortarias,
  onOpenBatchSignDialog,
  refreshData
}) => {
  const renderEmptyState = (type: 'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros', icon: React.ReactNode) => {
    const getTypeName = () => {
      switch (type) {
        case 'portarias': return { singular: 'portaria', plural: 'portarias', gender: 'a' };
        case 'decretos': return { singular: 'decreto', plural: 'decretos', gender: 'o' };
        case 'diarias': return { singular: 'diária', plural: 'diárias', gender: 'a' };
        case 'leis': return { singular: 'lei', plural: 'leis', gender: 'a' };
        case 'editais': return { singular: 'edital', plural: 'editais', gender: 'o' };
        case 'outros': return { singular: 'documento', plural: 'documentos', gender: 'o' };
        default: return { singular: 'documento', plural: 'documentos', gender: 'o' };
      }
    };
    
    const typeInfo = getTypeName();
    
    return (
      <div className="text-center py-8">
        {icon}
        <p className="text-gray-600">
          {searchTerm 
            ? `Nenhum${typeInfo.gender === 'a' ? 'a' : ''} ${typeInfo.singular} encontrad${typeInfo.gender} com os critérios de busca.`
            : `Não há ${typeInfo.plural} aguardando assinatura.`
          }
        </p>
      </div>
    );
  };

  const getIcon = (tabType: string) => {
    switch (tabType) {
      case 'portarias': return <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case 'decretos': return <Gavel className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case 'diarias': return <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case 'leis': return <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case 'editais': return <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      case 'outros': return <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
      default: return <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />;
    }
  };

  const renderDocumentList = (tabType: string) => (
    filteredDocuments.length === 0 ? (
      renderEmptyState(
        tabType as 'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros',
        getIcon(tabType)
      )
    ) : (
      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            activeTab={activeTab}
            isSignatureCompleted={isSignatureCompleted}
            onViewDocument={onViewDocument}
            onSignDocument={onSignDocument}
            isSigningDocument={isSigningDocument}
            showCheckbox={true} // Agora todas as abas terão checkbox
            isSelected={selectedPortarias.includes(doc.id)}
            onToggleSelection={onTogglePortariaSelection}
            refreshData={refreshData}
          />
        ))}
      </div>
    )
  );

  const getTabTitle = (tabType: string) => {
    switch (tabType) {
      case 'portarias': return 'Portarias';
      case 'decretos': return 'Decretos';
      case 'diarias': return 'Diárias';
      case 'leis': return 'Leis';
      case 'editais': return 'Editais';
      case 'outros': return 'Outros';
      default: return 'Documentos';
    }
  };

  const renderTabContent = (tabType: string) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getTabTitle(tabType)} Aguardando Assinatura ({filteredDocuments.length})</CardTitle>
          {onOpenBatchSignDialog && (
            <Button 
              onClick={onOpenBatchSignDialog}
              disabled={selectedPortarias.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <FileSignature className="w-4 h-4 mr-2" />
              Assinar em lote ({selectedPortarias.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Select All Checkbox - only show when there are documents */}
        {filteredDocuments.length > 0 && onToggleSelectAllPortarias && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
            <Checkbox
              checked={selectAllPortarias}
              onCheckedChange={onToggleSelectAllPortarias}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium cursor-pointer" onClick={onToggleSelectAllPortarias}>
              Selecionar todos
            </label>
          </div>
        )}
        
        {renderDocumentList(tabType)}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {activeTab === 'portarias' && renderTabContent('portarias')}
      {activeTab === 'decretos' && renderTabContent('decretos')}
      {activeTab === 'diarias' && renderTabContent('diarias')}
      {activeTab === 'leis' && renderTabContent('leis')}
      {activeTab === 'editais' && renderTabContent('editais')}
      {activeTab === 'outros' && renderTabContent('outros')}
    </div>
  );
};
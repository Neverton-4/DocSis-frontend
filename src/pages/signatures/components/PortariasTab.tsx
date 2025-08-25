import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { BatchSignDialog } from './BatchSignDialog';

interface PortariasTabProps {
  filteredDocuments: any[];
  searchTerm: string;
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

export const PortariasTab: React.FC<PortariasTabProps> = ({
  filteredDocuments,
  searchTerm,
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
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Portarias Aguardando Assinatura ({filteredDocuments.length})</CardTitle>
            {filteredDocuments.length > 0 && (
              <Button
                onClick={() => setIsBatchSignDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Assinar em Lote
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhuma portaria encontrada com os critérios de busca.' : 'Não há portarias aguardando assinatura.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  handleViewDocument={handleViewDocument}
                  signatureLogic={signatureLogic}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <BatchSignDialog
        isOpen={isBatchSignDialogOpen}
        onClose={() => setIsBatchSignDialogOpen(false)}
        portarias={filteredDocuments}
        selectedPortarias={selectedPortariasForBatch}
        selectAll={selectAllPortarias}
        onSelectAll={handleSelectAllPortarias}
        onSelectPortaria={handleSelectPortaria}
        onBatchSign={handleBatchSign}
      />
    </>
  );
};
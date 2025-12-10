import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle } from 'lucide-react';
import { SignatureButtons } from './SignatureButtons';

interface DocumentCardProps {
  doc: any;
  activeTab: string;
  isSignatureCompleted: (portariaId: number, tipoAssinatura: string) => boolean;
  onViewDocument: (doc: any) => void;
  onSignDocument: (doc: any, tipoAssinatura?: string) => void;
  isSigningDocument: boolean;
  // Batch signing props
  isSelected?: boolean;
  onToggleSelection?: (docId: number) => void;
  showCheckbox?: boolean;
  // Refresh data function
  refreshData?: () => Promise<void>;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  activeTab,
  isSignatureCompleted,
  onViewDocument,
  onSignDocument,
  isSigningDocument,
  isSelected = false,
  onToggleSelection,
  showCheckbox = false,
  refreshData
}) => {
  const tipoNome = doc?.originalData?.tipo_nome || doc?.originalData?.tipo_portaria?.nome || doc?.tipo_nome || doc?.tipo_documento?.nome;
  const typeLabel = activeTab === 'decretos' ? 'Decreto' : activeTab === 'diarias' ? 'Diária' : activeTab === 'leis' ? 'Lei' : activeTab === 'editais' ? 'Edital' : activeTab === 'outros' ? 'Documento' : 'Portaria';
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      {/* Checkbox for batch selection - now available for all tabs */}
      {showCheckbox && onToggleSelection && (
        <div className="flex items-center mr-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(doc.id)}
            className="h-4 w-4"
          />
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-medium text-gray-900">{typeLabel} nº {doc.number}</span>
        </div>
        <div className="mb-1">
          <span className="text-lg font-bold uppercase text-gray-900">{doc.title}</span>
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <span>Tipo de {typeLabel}: {tipoNome || 'Tipo não informado'}</span> • <span>Data: {doc.date}</span>
        </div>
        <div className="flex gap-2">
          {doc.requiredSignatures.map((signature: string, index: number) => {
            const statusKey = signature.toLowerCase() === 'prefeito' ? 'prefeito' : 'secretario';
            const status = doc.assinaturasStatus?.[statusKey] || 'pendente';
            const isCompleted = doc.completedSignatures.includes(signature);
            
            return (
              <div key={index} className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'assinada' 
                      ? 'bg-green-100 text-green-800' 
                      : status === 'pendente'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {signature}
                </span>
                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            );
          })}</div>
      </div>
      <SignatureButtons
          doc={doc}
          activeTab={activeTab}
          isSignatureCompleted={isSignatureCompleted}
          onViewDocument={onViewDocument}
          onSignDocument={onSignDocument}
          isSigningDocument={isSigningDocument}
          refreshData={refreshData}
        />
    </div>
  );
};
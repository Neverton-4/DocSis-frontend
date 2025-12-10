import React from 'react';
import { ProcessoDocumento } from '@/services/processoDocumentoService';
import { ProcessoAnexo } from '@/services/processoAnexoService';
import DocumentsAttachments from './DocumentsAttachments';

interface SidebarSectionProps {
  processoId: number;
  documentos: ProcessoDocumento[] | undefined;
  anexos: ProcessoAnexo[] | undefined;
  isLoadingDocumentos: boolean;
  isLoadingAnexos: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  processoId,
  documentos,
  anexos,
  isLoadingDocumentos,
  isLoadingAnexos
}) => {
  return (
    <div className="col-span-4 space-y-6">
      <DocumentsAttachments 
        processoId={processoId}
        documentos={documentos}
        anexos={anexos}
        isLoadingDocumentos={isLoadingDocumentos}
        isLoadingAnexos={isLoadingAnexos}
      />
    </div>
  );
};

export default SidebarSection;
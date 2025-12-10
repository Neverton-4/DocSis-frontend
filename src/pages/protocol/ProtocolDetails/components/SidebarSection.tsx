import React from 'react';
import { ProcessoEtapa } from '@/services/processoEtapaService';
import { ProcessoDocumento } from '@/services/processoDocumentoService';
import { ProcessoAnexo } from '@/services/processoAnexoService';
import DocumentsAttachments from './DocumentsAttachments';
import ProcessSteps from './ProcessSteps';

interface SidebarSectionProps {
  processoId: number;
  etapas: ProcessoEtapa[] | undefined;
  isLoadingEtapas: boolean;
  errorEtapas: any;
  documentos: ProcessoDocumento[] | undefined;
  anexos: ProcessoAnexo[] | undefined;
  isLoadingDocumentos: boolean;
  isLoadingAnexos: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  processoId,
  etapas,
  isLoadingEtapas,
  errorEtapas,
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
      
      <ProcessSteps 
        etapas={etapas}
        isLoading={isLoadingEtapas}
        error={errorEtapas}
      />
    </div>
  );
};

export default SidebarSection;
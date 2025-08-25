import React from 'react';
import { Etapa } from '@/services/etapaService';
import DocumentsAttachments from './DocumentsAttachments';
import ProcessSteps from './ProcessSteps';

interface SidebarSectionProps {
  processoId: number;
  etapas: Etapa[] | undefined;
  isLoadingEtapas: boolean;
  errorEtapas: any;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  processoId,
  etapas,
  isLoadingEtapas,
  errorEtapas
}) => {
  return (
    <div className="col-span-4 space-y-6">
      <DocumentsAttachments processoId={processoId} />
      
      <ProcessSteps 
        etapas={etapas}
        isLoading={isLoadingEtapas}
        error={errorEtapas}
      />
    </div>
  );
};

export default SidebarSection;
import React from 'react';
import Header from '@/components/layout/Header';
import {
  DocumentHeader,
  PDFViewer,
  BackButton,
  DocumentSignatureModal,
  CertificateSelector
} from '@components/shared';
import { DocumentActions, DocumentTabs } from './components';
import { useDocumentViewer, useDocumentSignature, useTabPersistence } from './hooks';

export const SignatureDocumentViewer = () => {
  const {
    portariaData,
    loading,
    error,
    pdfUrl,
    anexosData,
    documentType,
    handleAnexoClick,
    handleDocumentoPrincipalClick,
    handleBack
  } = useDocumentViewer();

  const {
    assinaturaData,
    pdfBlob,
    showSignatureModal,
    showCertificateSelector,
    selectedCertificate,
    isProcessingSignature,
    handleCertificateSelected,
    processDigitalSignature,
    closeSignatureModal
  } = useDocumentSignature(portariaData, documentType);

  // Hook para persistência de abas
  const { activeTab, handleTabChange } = useTabPersistence('documento');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Documentos / Visualizar Documento" 
      />
      
      {/* Botão Voltar */}
      <BackButton onBack={handleBack} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Área principal */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            
          {/* Informações da Portaria */}
          {portariaData && (
            <DocumentHeader
              numero={portariaData.portaria.numero}
              ano={portariaData.portaria.ano.toString()}
              titulo={portariaData.portaria.titulo || `${portariaData.tipo?.nome || 'Tipo não informado'}${portariaData.subtipo?.nome_subtipo ? ` - ${portariaData.subtipo.nome_subtipo}` : ''}`}
              servidor={portariaData.servidor?.nome || 'Servidor não informado'}
              tipoNome={portariaData.tipo?.nome || 'Tipo não informado'}
              subtipoNome={portariaData.subtipo?.nome_subtipo}
              documentType={documentType || 'portaria'}
            />
          )}

            {/* PDF Viewer */}
            <PDFViewer
              pdfUrl={pdfUrl}
              loading={loading}
              error={error}
            />
          </div>

          {/* Sidebar - Botões sempre visíveis */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {/* Actions acima dos Documentos - Sempre visível */}
            <div className="mb-4">
              <DocumentActions
                portariaData={portariaData}
                documentType={documentType}
              />
            </div>

            {/* Thumbnails */}
            <DocumentTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              documentoPrincipal={!!portariaData?.documento_principal}
              documentoThumbnailBase64={portariaData?.documento_principal?.thumbnail}
              anexosData={anexosData}
              onDocumentoPrincipalClick={handleDocumentoPrincipalClick}
              onAnexoClick={handleAnexoClick}
            />
          </div>
        </div>
      </div>
      
      {/* Modal de Assinatura */}
      <DocumentSignatureModal
        showCertificateSelector={showCertificateSelector}
        onCancelCertificateSelector={closeSignatureModal}
        onCertificateSelected={handleCertificateSelected}
        showSignatureModal={showSignatureModal}
        assinaturaData={assinaturaData}
        pdfBlob={pdfBlob}
        selectedCertificate={selectedCertificate}
        isProcessingSignature={isProcessingSignature}
        onProcessDigitalSignature={processDigitalSignature}
        onCloseSignatureModal={closeSignatureModal}
      />
    </div>
  );
};

export default SignatureDocumentViewer;
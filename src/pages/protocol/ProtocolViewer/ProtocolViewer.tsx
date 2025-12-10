import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import {
  DocumentHeader,
  PDFViewer,
  DocumentThumbnails,
  DocumentActions,
  BackButton
} from '@/components/shared';
import { AttachmentModal } from './components';
import { useDocumentViewer, useDocumentAttachment } from './hooks';

export const ProtocolDocumentViewer = () => {
  const navigate = useNavigate();
  
  const {
    protocoloData,
    loading,
    error,
    pdfUrl,
    anexosData,
    handleAnexoClick,
    handleDocumentoPrincipalClick,
    handleBack
  } = useDocumentViewer();

  const {
    showAttachmentModal,
    setShowAttachmentModal,
    attachmentFile,
    setAttachmentFile,
    attachmentTitle,
    setAttachmentTitle,
    isUploading,
    handleAttachDocument,
    handleConfirmAttachment
  } = useDocumentAttachment(protocoloData?.processo?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Protocolos / Visualizar Documento" 
      />
      
      {/* Botão Voltar */}
      <BackButton onBack={handleBack} />

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Carregando documento...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Área principal */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Informações do Protocolo */}
            {protocoloData && protocoloData.processo && (
              <DocumentHeader
                processoId={protocoloData.processo.id?.toString() || ''}
                servidor={protocoloData.processo?.servidor?.nome_completo || 'Servidor não informado'}
                tipoProcesso={protocoloData.processo?.tipo_processo?.nome || 'Tipo não informado'}
                departamento={protocoloData.processo?.departamento?.nome || 'Departamento não informado'}
                dataAbertura={protocoloData.processo?.data_abertura || ''}
              />
            )}

            {/* PDF Viewer */}
            <PDFViewer
              pdfUrl={pdfUrl}
              loading={loading}
              error={error}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            
            {/* Thumbnails */}
            <DocumentThumbnails
              documentoPrincipal={!!protocoloData?.documento_principal}
              documentoThumbnailBase64={protocoloData?.documento_principal?.thumbnail}
              anexosData={anexosData}
              onDocumentoPrincipalClick={handleDocumentoPrincipalClick}
              onAnexoClick={handleAnexoClick}
            />

            {/* Actions */}
            <DocumentActions
              onAttachDocument={handleAttachDocument}
            />
          </div>
        </div>
      </div>
      )}
      
      {/* Modal de Anexo */}
      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        attachmentFile={attachmentFile}
        setAttachmentFile={setAttachmentFile}
        attachmentTitle={attachmentTitle}
        setAttachmentTitle={setAttachmentTitle}
        isUploading={isUploading}
        onConfirm={handleConfirmAttachment}
      />
    </div>
  );
};

export default ProtocolDocumentViewer;
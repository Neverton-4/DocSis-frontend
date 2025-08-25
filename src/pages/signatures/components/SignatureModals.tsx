import React from 'react';
import { Button } from '@/components/ui/button';
import { CertificateSelector } from '@/components/CertificateSelector';

interface SignatureModalsProps {
  signatureLogic: any;
}

export const SignatureModals: React.FC<SignatureModalsProps> = ({ signatureLogic }) => {
  const {
    showCertificateSelector,
    showSignatureModal,
    assinaturaData,
    pdfBlob,
    selectedCertificate,
    isProcessingSignature,
    handleCertificateSelected,
    processDigitalSignature,
    closeSignatureModal
  } = signatureLogic;

  return (
    <>
      {/* Seletor de Certificados */}
      {showCertificateSelector && (
        <CertificateSelector
          isVisible={showCertificateSelector}
          onCancel={() => signatureLogic.setShowCertificateSelector(false)}
          onCertificateSelected={handleCertificateSelected}
        />
      )}
      
      {/* Modal de Assinatura */}
      {showSignatureModal && assinaturaData && pdfBlob && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirmar Assinatura Digital</h2>
              <Button variant="outline" onClick={closeSignatureModal}>
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações da Assinatura */}
              <div>
                <h3 className="font-semibold mb-3">Informações da Assinatura</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Documento:</strong> Portaria #{assinaturaData.portaria_id}</p>
                  <p><strong>Assinante:</strong> {assinaturaData.assinatura_info?.nome_assinante}</p>
                  <p><strong>Cargo:</strong> {assinaturaData.assinatura_info?.cargo_assinante}</p>
                  <p><strong>Certificado:</strong> {selectedCertificate.subjectName}</p>
                  <p><strong>Válido até:</strong> {new Date(selectedCertificate.validTo).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={processDigitalSignature}
                    disabled={isProcessingSignature}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessingSignature ? 'Processando...' : 'Confirmar Assinatura'}
                  </Button>
                  <Button variant="outline" onClick={closeSignatureModal}>
                    Cancelar
                  </Button>
                </div>
              </div>
              
              {/* Preview do PDF */}
              <div>
                <h3 className="font-semibold mb-3">Preview do Documento</h3>
                <div className="border rounded-lg overflow-hidden" style={{height: '400px'}}>
                  <iframe
                    src={URL.createObjectURL(pdfBlob)}
                    className="w-full h-full"
                    title="Preview do PDF"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
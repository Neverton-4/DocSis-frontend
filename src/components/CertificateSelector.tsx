import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Calendar, User, AlertTriangle } from 'lucide-react';
import { digitalSignature, CertificateInfo } from '@/utils/digitalSignature';
import { useToast } from '@/hooks/use-toast';

interface CertificateSelectorProps {
  onCertificateSelected: (certificate: CertificateInfo) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const CertificateSelector: React.FC<CertificateSelectorProps> = ({
  onCertificateSelected,
  onCancel,
  isVisible
}) => {
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateInfo | null>(null);
  const [pkiStatus, setPkiStatus] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      checkPkiStatus();
    }
  }, [isVisible]);

  const checkPkiStatus = async () => {
    setLoading(true);
    try {
      const status = await digitalSignature.checkStatus();
      setPkiStatus(status);
      
      if (status) {
        await loadCertificates();
      } else {
        toast({
          title: "Web PKI Express não encontrado",
          description: "Certifique-se de que o Web PKI Express está instalado e rodando na porta 8080.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status do PKI:', error);
      setPkiStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const certs = await digitalSignature.listCertificates();
      setCertificates(certs);
      
      if (certs.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum certificado digital válido encontrado.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar certificados digitais.",
        variant: "destructive"
      });
    }
  };

  const handleConfirm = () => {
    if (selectedCertificate) {
      onCertificateSelected(selectedCertificate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const isCertificateExpired = (cert: CertificateInfo) => {
    return new Date() > cert.validTo;
  };

  const isCertificateExpiringSoon = (cert: CertificateInfo) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return cert.validTo <= thirtyDaysFromNow && cert.validTo > new Date();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Selecionar Certificado Digital
          </h2>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Verificando Web PKI Express...</span>
          </div>
        ) : pkiStatus === false ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Web PKI Express não está rodando</h3>
            <p className="text-gray-600 mb-4">
              Para usar a assinatura digital, é necessário que o Web PKI Express esteja instalado e rodando.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">Como resolver:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Certifique-se de que o Web PKI Express está instalado</li>
                <li>Inicie o serviço Web PKI Express</li>
                <li>Verifique se está rodando na porta 8080</li>
                <li>Tente novamente</li>
              </ol>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={checkPkiStatus}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {certificates.map((cert, index) => {
                const isExpired = isCertificateExpired(cert);
                const isExpiringSoon = isCertificateExpiringSoon(cert);
                const isSelected = selectedCertificate?.thumbprint === cert.thumbprint;

                return (
                  <Card 
                    key={cert.thumbprint}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    } ${isExpired ? 'opacity-50' : ''}`}
                    onClick={() => !isExpired && setSelectedCertificate(cert)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="font-semibold">{cert.subject}</span>
                            {isExpired && <Badge variant="destructive">Expirado</Badge>}
                            {isExpiringSoon && <Badge variant="outline">Expira em breve</Badge>}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Emissor:</strong> {cert.issuer}</div>
                            <div><strong>Número de Série:</strong> {cert.serialNumber}</div>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <strong>Válido de:</strong> {formatDate(cert.validFrom)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <strong>até:</strong> {formatDate(cert.validTo)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="ml-4">
                            <Badge variant="default">Selecionado</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {certificates.length === 0 && pkiStatus === true && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum certificado digital encontrado.</p>
                <p className="text-sm mt-2">Verifique se possui certificados instalados no computador.</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!selectedCertificate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar Seleção
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
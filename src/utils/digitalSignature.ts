import { toast } from '@/hooks/use-toast';

// Interface para informações do certificado
export interface CertificateInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: Date;
  validTo: Date;
  thumbprint: string;
  subjectName: string;
  issuerName: string;
}

// Interface para resultado da assinatura
export interface SignatureResult {
  success: boolean;
  signedData?: ArrayBuffer;
  certificate?: CertificateInfo;
  error?: string;
}

// Classe principal para assinatura digital com Web PKI Express
export class DigitalSignaturePKI {
  private static instance: DigitalSignaturePKI;
  private pki: any;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DigitalSignaturePKI {
    if (!DigitalSignaturePKI.instance) {
      DigitalSignaturePKI.instance = new DigitalSignaturePKI();
    }
    return DigitalSignaturePKI.instance;
  }

  // Inicializar Web PKI Express
  public async initialize(): Promise<boolean> {
    try {
      // Verificar se Web PKI Express está disponível
      if (typeof (window as any).LacunaWebPKI === 'undefined') {
        throw new Error('Web PKI Express não está carregado. Certifique-se de que está instalado e rodando.');
      }

      this.pki = new (window as any).LacunaWebPKI({
        // Configuração para Web PKI Express local
        endpoint: 'http://localhost:8080/', // Porta padrão do Web PKI Express
        // Não precisa de licenseUrl para versão Express
      });
      
      // Inicializar Web PKI Express
      await new Promise((resolve, reject) => {
        this.pki.init({
          ready: () => {
            console.log('Web PKI Express inicializado com sucesso');
            resolve(true);
          },
          notInstalled: () => {
            reject(new Error('Web PKI Express não está instalado ou não está rodando'));
          },
          outdated: () => {
            reject(new Error('Web PKI Express está desatualizado'));
          }
        });
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar Web PKI Express:', error);
      toast({
        title: "Erro",
        description: "Erro ao inicializar Web PKI Express. Verifique se está instalado e rodando.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Listar certificados disponíveis
  public async listCertificates(): Promise<CertificateInfo[]> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Falha ao inicializar Web PKI Express');
      }
    }

    try {
      const certificates = await new Promise<any[]>((resolve, reject) => {
        this.pki.listCertificates({
          filter: this.pki.certificateFilters.isWithinValidity
        }).success((certs: any[]) => {
          resolve(certs);
        }).fail((error: any) => {
          reject(error);
        });
      });

      return certificates.map(cert => ({
        subject: cert.subjectName,
        issuer: cert.issuerName,
        serialNumber: cert.serialNumber,
        validFrom: new Date(cert.validityStart),
        validTo: new Date(cert.validityEnd),
        thumbprint: cert.thumbprint,
        subjectName: cert.subjectName,
        issuerName: cert.issuerName
      }));
    } catch (error) {
      console.error('Erro ao listar certificados:', error);
      throw new Error('Erro ao listar certificados digitais');
    }
  }

  // Assinar PDF especificamente
  public async signPDF(
    pdfData: ArrayBuffer,
    certificateThumbprint: string,
    signatureInfo: {
      reason?: string;
      location?: string;
      contactInfo?: string;
      fieldName?: string;
      pageNumber?: number;
      coordinates?: { x0: number; y0: number; x1: number; y1: number };
    }
  ): Promise<SignatureResult> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Falha ao inicializar Web PKI Express');
      }
    }

    try {
      const pdfBase64 = this.arrayBufferToBase64(pdfData);

      const signatureResult = await new Promise<any>((resolve, reject) => {
        this.pki.signPdf({
          thumbprint: certificateThumbprint,
          pdfBytes: pdfBase64,
          reason: signatureInfo.reason || 'Assinatura Digital',
          location: signatureInfo.location || 'Sistema de Protocolos',
          contactInfo: signatureInfo.contactInfo || '',
          certificationLevel: 'NOT_CERTIFIED',
          signatureFieldName: signatureInfo.fieldName,
          pageNumber: signatureInfo.pageNumber || 1,
          rectangle: signatureInfo.coordinates ? {
            llx: signatureInfo.coordinates.x0,
            lly: signatureInfo.coordinates.y0,
            urx: signatureInfo.coordinates.x1,
            ury: signatureInfo.coordinates.y1
          } : undefined,
          // Configurações específicas para Web PKI Express
          visualRepresentation: {
            text: {
              includeSigningTime: true,
              signerName: true,
              includeLocation: true
            }
          }
        }).success((result: any) => {
          resolve(result);
        }).fail((error: any) => {
          reject(error);
        });
      });

      const signedPdfData = this.base64ToArrayBuffer(signatureResult.signedPdf);

      return {
        success: true,
        signedData: signedPdfData,
        certificate: {
          subject: signatureResult.certificate.subjectName,
          issuer: signatureResult.certificate.issuerName,
          serialNumber: signatureResult.certificate.serialNumber,
          validFrom: new Date(signatureResult.certificate.validityStart),
          validTo: new Date(signatureResult.certificate.validityEnd),
          thumbprint: signatureResult.certificate.thumbprint,
          subjectName: signatureResult.certificate.subjectName,
          issuerName: signatureResult.certificate.issuerName
        }
      };
    } catch (error) {
      console.error('Erro ao assinar PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na assinatura do PDF'
      };
    }
  }

  // Verificar se Web PKI Express está rodando
  public async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:8080/api/system/info');
      return response.ok;
    } catch (error) {
      console.error('Web PKI Express não está rodando:', error);
      return false;
    }
  }

  // Utilitários para conversão
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Função auxiliar para facilitar o uso
export const digitalSignature = DigitalSignaturePKI.getInstance();
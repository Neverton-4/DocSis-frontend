import api from '@/config/api';

// Tipos para Lacuna Web PKI
interface LacunaConfig {
  license: string;
  sessionId: string;
  apiUrl: string;
}

interface SignatureSession {
  success: boolean;
  session_id: string;
  web_pki_config: LacunaConfig;
  expires_at: string;
  signer_info: {
    name: string;
    cpf: string;
  };
}

interface CertificateInfo {
  subjectName: string;
  issuerName: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  thumbprint: string;
  certificateType: 'A1' | 'A3' | 'UNKNOWN';
}

interface SignatureResult {
  signature: string;
  certificate: CertificateInfo;
  signedHash: string;
}

// Declaração global para Lacuna Web PKI
declare global {
  interface Window {
    LacunaWebPKI: any;
  }
}

class LacunaService {
  private webPki: any = null;
  private isInitialized = false;

  /**
   * Inicializa o Lacuna Web PKI
   */
  async initialize(config: LacunaConfig): Promise<boolean> {
    try {
      // Verificar se o script já foi carregado
      if (!window.LacunaWebPKI) {
        await this.loadWebPKIScript();
      }

      // Inicializar Web PKI
      this.webPki = new window.LacunaWebPKI(config.license);
      
      // Verificar se Web PKI está disponível
      const isAvailable = await new Promise((resolve) => {
        this.webPki.init({
          ready: () => resolve(true),
          notInstalled: () => resolve(false),
          restPkiUrl: config.apiUrl
        });
      });

      if (!isAvailable) {
        throw new Error('Lacuna Web PKI não está instalado ou não está disponível');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar Lacuna Web PKI:', error);
      return false;
    }
  }

  /**
   * Carrega o script do Lacuna Web PKI dinamicamente
   */
  private loadWebPKIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="lacuna-web-pki"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.lacunasoftware.com/libs/web-pki/lacuna-web-pki-2.14.0.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar script do Lacuna Web PKI'));
      document.head.appendChild(script);
    });
  }

  /**
   * Lista certificados disponíveis
   */
  async listCertificates(): Promise<CertificateInfo[]> {
    if (!this.isInitialized || !this.webPki) {
      throw new Error('Lacuna Web PKI não foi inicializado');
    }

    try {
      const certificates = await new Promise((resolve, reject) => {
        this.webPki.listCertificates({
          selectId: null,
          filter: this.webPki.certificateFilters.pkiBrazil
        }).success((certs: any[]) => {
          resolve(certs);
        }).fail((error: any) => {
          reject(error);
        });
      });

      return (certificates as any[]).map(cert => ({
        subjectName: cert.subjectName,
        issuerName: cert.issuerName,
        serialNumber: cert.serialNumber,
        validFrom: cert.validFrom,
        validTo: cert.validTo,
        thumbprint: cert.thumbprint,
        certificateType: this.detectCertificateType(cert)
      }));
    } catch (error) {
      console.error('Erro ao listar certificados:', error);
      throw new Error('Falha ao listar certificados disponíveis');
    }
  }

  /**
   * Detecta o tipo de certificado (A1 ou A3)
   */
  private detectCertificateType(certificate: any): 'A1' | 'A3' | 'UNKNOWN' {
    // A1: Certificados em software (geralmente armazenados no computador)
    // A3: Certificados em hardware (cartão inteligente, token USB)
    
    if (certificate.keyUsage && certificate.keyUsage.includes('nonRepudiation')) {
      // Verificar se está em hardware (A3) ou software (A1)
      if (certificate.isHardware || certificate.pkcs11ModuleName) {
        return 'A3';
      } else {
        return 'A1';
      }
    }
    
    return 'UNKNOWN';
  }

  /**
   * Executa a assinatura digital
   */
  async signDocument(sessionId: string, certificateThumbprint: string): Promise<SignatureResult> {
    if (!this.isInitialized || !this.webPki) {
      throw new Error('Lacuna Web PKI não foi inicializado');
    }

    try {
      const result = await new Promise((resolve, reject) => {
        this.webPki.signWithRestPki({
          sessionId: sessionId,
          thumbprint: certificateThumbprint
        }).success((result: any) => {
          resolve(result);
        }).fail((error: any) => {
          reject(error);
        });
      });

      return result as SignatureResult;
    } catch (error) {
      console.error('Erro ao assinar documento:', error);
      throw new Error('Falha ao executar assinatura digital');
    }
  }

  /**
   * Inicia sessão de assinatura no backend
   */
  async startSignatureSession(numeroDocumento: string, ano: number, assinanteId: number, assinanteNome: string, tipoAssinante: 'prefeito' | 'secretario' = 'prefeito'): Promise<SignatureSession> {
    // Fluxo Web PKI desativado: chamadas ao endpoint /api/documentos foram removidas.
    // Mantemos este método para compatibilidade, mas impedimos seu uso.
    throw new Error('Fluxo Web PKI desativado. Use o host local para assinatura.');
  }

  /**
   * Finaliza assinatura no backend
   */
  async finalizeSignature(numeroDocumento: string, ano: number, sessionId: string, signatureResult: SignatureResult, tipoAssinante: 'prefeito' | 'secretario' = 'prefeito'): Promise<any> {
    // Fluxo Web PKI desativado: chamadas ao endpoint /api/documentos foram removidas.
    throw new Error('Fluxo Web PKI desativado. Use o host local para assinatura.');
  }

  /**
   * Fluxo completo de assinatura
   */
  async signDocumento(numeroDocumento: string, ano: number, assinanteId: number, assinanteNome: string, tipoAssinante: 'prefeito' | 'secretario' = 'prefeito'): Promise<any> {
    // Fluxo Web PKI desativado: impedir execução deste caminho.
    throw new Error('Fluxo Web PKI desativado. Utilize o host local.');
  }

  // Aliases para compatibilidade com código existente
  async signPortaria(numeroPortaria: string, ano: number, assinanteId: number, assinanteNome: string, tipoAssinante: 'prefeito' | 'secretario' = 'prefeito'): Promise<any> {
    return this.signDocumento(numeroPortaria, ano, assinanteId, assinanteNome, tipoAssinante);
  }

  /**
   * Verifica se Web PKI está disponível
   */
  async isWebPKIAvailable(): Promise<boolean> {
    try {
      if (!window.LacunaWebPKI) {
        await this.loadWebPKIScript();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Busca assinantes por tela e tipo
   */
  async getAssinantesByTelaAndType(telaId: number, tipoAssinante: string): Promise<any[]> {
    // Desativado: removido uso de /api/documentos.
    throw new Error('Busca de assinantes via /api/documentos desativada.');
  }

  /**
   * Atualiza coordenadas de assinatura visual
   */
  async updateSignatureCoordinates(
    documentoId: number, 
    tipoAssinante: string, 
    coordinates: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      pagina?: number;
      nome_assinante?: string;
      cargo_assinante?: string;
    }
  ): Promise<any> {
    // Desativado: removido uso de /api/documentos.
    throw new Error('Atualização de coordenadas via /api/documentos desativada.');
  }
}

// Exportar instância singleton
export const lacunaService = new LacunaService();
export default lacunaService;

// Exportar tipos
export type { LacunaConfig, SignatureSession, CertificateInfo, SignatureResult };
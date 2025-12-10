// Configurações do Lacuna Web PKI
export const lacunaConfig = {
  // URL base da API do Lacuna Web PKI
  apiUrl: import.meta.env.VITE_LACUNA_API_URL || 'https://webpki.lacunasoftware.com/api',
  
  // Chave de licença do Lacuna Web PKI
  licenseKey: import.meta.env.VITE_LACUNA_LICENSE_KEY || '',
  
  // Configurações de timeout
  timeout: {
    session: 30 * 60 * 1000, // 30 minutos em millisegundos
    request: 30 * 1000, // 30 segundos em millisegundos
  },
  
  // Configurações de assinatura visual
  visualSignature: {
    defaultPosition: {
      x0: 100,
      y0: 100,
      x1: 300,
      y1: 150,
      page: 1
    },
    text: {
      fontSize: 10,
      fontColor: '#000000',
      includeSigningTime: true,
      showValidationInfo: true
    }
  },
  
  // Configurações de certificado
  certificate: {
    acceptExpired: false,
    acceptUnknown: false
  },
  
  // URLs dos endpoints do backend
  endpoints: {
    startSession: '/portarias/numero/{numero}/ano/{ano}/assinar-prefeito',
    finalizeSession: '/portarias/numero/{numero}/ano/{ano}/finalizar-assinatura',
    updateCoordinates: '/portarias/{portariaId}/assinatura-coordenadas/{tipoAssinante}',
    getSigners: '/portarias/assinantes/tela/{telaId}/tipo/{tipoAssinante}'
  }
};

// Tipos para TypeScript
export interface LacunaSessionConfig {
  sessionId: string;
  lacunaSessionId: string;
  webPkiConfig: {
    license: string;
    sessionId: string;
    apiUrl: string;
  };
  expiresAt: string;
  signerInfo: {
    name: string;
    cpf: string;
  };
}

export interface SignatureCoordinates {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  pagina?: number;
  nome_assinante?: string;
  cargo_assinante?: string;
}

export interface SignerInfo {
  id: number;
  nome: string;
  cpf: string;
  tipo_assinante: string;
  tela_id: number;
  ativo: boolean;
}
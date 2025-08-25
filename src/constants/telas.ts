// Constantes para IDs das telas do sistema
export const TELAS = {
  ASSINATURAS: 3, // ID da tela de assinaturas - ajustar conforme o banco
  PROTOCOLOS: 1,
  PORTARIAS: 2,
  // Adicionar outros IDs conforme necessário
} as const;

export type TelaId = typeof TELAS[keyof typeof TELAS];
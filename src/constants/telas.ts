// Constantes para IDs das telas do sistema
export const TELAS = {
  ASSINATURAS: 3, // ID da tela de assinaturas - ajustar conforme o banco
  PROTOCOLOS: 1,
  DOCUMENTOS: 2,
  // Adicionar outros IDs conforme necessário
} as const;

export type TelaId = typeof TELAS[keyof typeof TELAS];

export const TELAS_CONFIG: Record<string, { id: number; codigo?: string; liberado?: boolean }> = {
  protocolos: { id: TELAS.PROTOCOLOS, codigo: 'protocolos', liberado: false },
  documentos: { id: TELAS.DOCUMENTOS, codigo: 'documentos', liberado: false },
  assinaturas: { id: TELAS.ASSINATURAS, codigo: 'assinaturas', liberado: false },
};
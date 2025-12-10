// Utilitário temporário para debug da API
import { documentoService as portariaService } from '@/services/documentoPortariaService';

export const debugPortariaAPI = async (portariaId: number) => {
  try {
    // Utilitário de debug desativado (logs suprimidos)
    await portariaService.getPortariaDocumento(portariaId, false, true, true);
  } catch (error) {
    // Manter apenas erro para diagnosticar problemas reais
    console.error('❌ Erro na API:', error);
  }
};
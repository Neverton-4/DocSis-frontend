// Utilitário temporário para debug da API
import { documentoService as portariaService } from '@/services/documentoPortariaService';

export const debugPortariaAPI = async (portariaId: number) => {
  console.group('🔍 DEBUG API - Portaria', portariaId);
  
  try {
    // Teste da API com thumbnails
    console.log('📡 Chamando API com thumbnails...');
    const response = await portariaService.getPortariaDocumento(portariaId, false, true, true);
    
    console.log('📋 Resposta completa:', response);
    console.log('📄 Documento principal:', response.documento_principal);
    console.log('🖼️ Thumbnail documento (documento_thumbnail_base64):', response.documento_thumbnail_base64 ? 'PRESENTE' : 'AUSENTE');
    console.log('📎 Anexos:', response.anexos);
    
    if (response.anexos && response.anexos.length > 0) {
      console.log('📎=== DEBUG ESPECÍFICO DOS ANEXOS ===');
      response.anexos.forEach((anexo: any, index: number) => {
        console.log(`📎 Anexo ${index + 1} - Debug detalhado:`, {
          id: anexo.id,
          nome_arquivo: anexo.nome_arquivo,
          '❗ thumbnail_base64': anexo.thumbnail_base64 ? `PRESENTE (${anexo.thumbnail_base64.length} chars)` : 'AUSENTE',
          thumbnail_url: anexo.thumbnail_url || 'AUSENTE',
          caminho_arquivo: anexo.caminho_arquivo,
          estrutura_completa: anexo
        });
        
        // Testar se é base64 válido
        if (anexo.thumbnail_base64) {
          try {
            const testImg = `data:image/png;base64,${anexo.thumbnail_base64}`;
            console.log(`✅ Anexo ${index + 1} - Base64 parece válido`);
          } catch (e) {
            console.error(`❌ Anexo ${index + 1} - Problema com base64:`, e);
          }
        }
      });
    } else {
      console.log('📎 Nenhum anexo encontrado');
    }
    
    // Verificar se campos esperados existem
    console.log('✅ Campos da API verificados:');
    console.log('  - documento_thumbnail_base64:', !!response.documento_thumbnail_base64);
    console.log('  - anexos[0].thumbnail_base64:', response.anexos?.[0]?.thumbnail_base64 ? true : false);
    
  } catch (error) {
    console.error('❌ Erro na API:', error);
  }
  
  console.groupEnd();
};
/**
 * Extrai e formata o título do nome do arquivo
 * Exemplo: "080-25-LEONARDO JOSÉ FURTADO DE CARVALHO-Controlador Geral-100%-Jan.docx"
 * Retorna: "LEONARDO JOSÉ FURTADO DE CARVALHO-Controlador Geral-100%"
 */
export const extractTitleFromFilename = (filename: string): string => {
  // Remove a extensão do arquivo
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, '');
  
  // Divide o nome por hífen
  const parts = nameWithoutExtension.split('-');
  
  // Se tem pelo menos 3 partes (número-ano-resto), remove as duas primeiras
  if (parts.length >= 3) {
    // Remove as duas primeiras partes (número e ano)
    const titleParts = parts.slice(2);
    
    // Junta as partes restantes com hífen, mas remove a última parte se for um mês
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const lastPart = titleParts[titleParts.length - 1];
    
    // Se a última parte é um mês, remove ela
    if (months.includes(lastPart)) {
      titleParts.pop();
    }
    
    return titleParts.join('-');
  }
  
  // Se não segue o padrão esperado, retorna o nome original sem extensão
  return nameWithoutExtension;
};
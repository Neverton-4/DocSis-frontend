export const isLicenca = (tipo: string) => tipo.startsWith('licenca_');
export const isDeclaracao = (tipo: string) => tipo.startsWith('declaracao_');
export const isGratificacao = (tipo: string) => tipo.startsWith('gratificacao_');
export const isOutro = (tipo: string) => !isLicenca(tipo) && !isDeclaracao(tipo) && !isGratificacao(tipo);

export const getTiposPorCategoria = (tiposProcesso: TipoProcessoInterface[], tipo: string) => {
  return tiposProcesso.filter(tp => tp.tipo === tipo);
};
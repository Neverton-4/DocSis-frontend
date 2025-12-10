// Tipos para TipoServidor
export interface TipoServidor {
  id: number;
  nome: string;
  codigo: string;
  cod_drh: number | null;
  created_at: string;
  updated_at: string;
}

export interface TipoServidorSimples {
  id: number;
  nome: string;
  codigo: string;
}

export interface TipoServidorCreate {
  nome: string;
  codigo: string;
  cod_drh?: number | null;
}

export interface TipoServidorUpdate {
  nome?: string;
  codigo?: string;
  cod_drh?: number | null;
}

// Enum para compatibilidade com código existente
export enum TipoServidorEnum {
  EFETIVO = 'efetivo',
  COMISSIONADO = 'comissionado',
  TEMPORARIO = 'temporario',
  NAO_SERVIDOR = 'nao_servidor'
}

// Mapeamento entre enum e códigos
export const TIPO_SERVIDOR_MAPPING = {
  [TipoServidorEnum.EFETIVO]: 'efetivo',
  [TipoServidorEnum.COMISSIONADO]: 'comissionado',
  [TipoServidorEnum.TEMPORARIO]: 'temporario',
  [TipoServidorEnum.NAO_SERVIDOR]: 'nao_servidor'
} as const;

// Função para formatar tipo de servidor
export const formatTipoServidor = (tipo: string | null | undefined): string => {
  if (!tipo) return 'Não informado';
  
  switch (tipo.toLowerCase()) {
    case 'efetivo':
      return 'Efetivo';
    case 'comissionado':
      return 'Comissionado';
    case 'temporario':
      return 'Temporário';
    case 'nao_servidor':
      return 'Não Servidor';
    default:
      return tipo;
  }
};
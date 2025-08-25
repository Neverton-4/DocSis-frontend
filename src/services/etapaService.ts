import api from '@/config/api';

export interface Etapa {
  id: number;
  processo_id: number;
  usuario_id: number;
  departamento_id: number;
  etapa_status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  data_inicio: string;
  data_fim: string | null;
  observacao: string | null;
  etapa_final: boolean;
  ordem: number;
  created_at: string;
  // Campos relacionados
  departamento?: {
    id: number;
    nome: string;
  };
  usuario?: {
    id: number;
    nome: string;
  };
}

export const getEtapasByProcessoId = async (processoId: number): Promise<Etapa[]> => {
  const response = await api.get(`/processos/${processoId}/etapas`);
  return response.data;
};
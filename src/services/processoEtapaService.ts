import api from '@/config/api';

export enum EtapaStatus {
  PENDENTE = 'pendente',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada'
}

export interface ProcessoEtapa {
  id: number;
  processo_id: number;
  usuario_id: number;
  departamento_id: number;
  departamento_nome?: string; // Campo adicionado para dados consolidados
  etapa_status: EtapaStatus;
  observacao?: string;
  etapa_final: boolean;
  ordem: number;
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
}

export interface ProcessoEtapaCreate {
  processo_id: number;
  usuario_id: number;
  departamento_id: number;
  etapa_status: EtapaStatus;
  observacao?: string;
  etapa_final: boolean;
  ordem: number;
}

export interface ProcessoEtapaUpdate {
  etapa_status?: EtapaStatus;
  observacao?: string;
  etapa_final?: boolean;
  ordem?: number;
}

export const listarEtapas = async (processoId: number): Promise<ProcessoEtapa[]> => {
  const response = await api.get(`/processos/${processoId}/etapas`);
  return response.data;
};

export const criarEtapa = async (data: ProcessoEtapaCreate): Promise<ProcessoEtapa> => {
  const response = await api.post('/etapas', data);
  return response.data;
};

// Criação de etapa vinculada a um processo específico (rota correta do backend)
export const criarEtapaNoProcesso = async (
  processoId: number,
  data: ProcessoEtapaCreate
): Promise<ProcessoEtapa> => {
  const response = await api.post(`/processos/${processoId}/etapas`, data);
  return response.data;
};

export const obterUltimaEtapaDepartamento = async (processoId: number, departamentoId: number): Promise<ProcessoEtapa | null> => {
  try {
    const response = await api.get(`/processos/${processoId}/etapas`);
    const etapas: ProcessoEtapa[] = response.data;
    
    // Filtrar etapas do departamento específico e ordenar por ordem decrescente
    const etapasDepartamento = etapas
      .filter(etapa => etapa.departamento_id === departamentoId)
      .sort((a, b) => b.ordem - a.ordem);
    
    return etapasDepartamento.length > 0 ? etapasDepartamento[0] : null;
  } catch (error) {
    console.error('Erro ao buscar última etapa do departamento:', error);
    return null;
  }
};

export const obterEtapa = async (etapaId: number): Promise<ProcessoEtapa> => {
  const response = await api.get(`/etapas/${etapaId}`);
  return response.data;
};

export const atualizarEtapa = async (etapaId: number, data: ProcessoEtapaUpdate): Promise<ProcessoEtapa> => {
  const response = await api.put(`/etapas/${etapaId}`, data);
  return response.data;
};

export const deletarEtapa = async (etapaId: number): Promise<void> => {
  await api.delete(`/etapas/${etapaId}`);
};

export const iniciarEtapa = async (etapaId: number): Promise<ProcessoEtapa> => {
  const response = await api.post(`/etapas/${etapaId}/iniciar`);
  return response.data;
};

export const concluirEtapa = async (etapaId: number, observacao?: string): Promise<ProcessoEtapa> => {
  const response = await api.post(`/etapas/${etapaId}/concluir`, {
    observacao
  });
  return response.data;
};
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentoService as portariaService } from '@/services/documentoPortariaService';
import { Portaria } from '@/types';

export const useDocumentOperations = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portariaToDelete, setPortariaToDelete] = useState<Portaria | null>(null);
  const [tramitarDialogOpen, setTramitarDialogOpen] = useState(false);
  const [portariaToTramitar, setPortariaToTramitar] = useState<Portaria | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatStatus = (status: string) => {
    const statusMap = {
      'criado': 'Criado',
      'editado': 'Editado',
      'revisado': 'Revisado',
      'aguardando_assinatura': 'Aguardando Assinatura',
      'assinado': 'Assinado',
      'publicado': 'Publicado',
      'cancelado': 'Cancelado',
      'arquivado': 'Arquivado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'publicado': 'bg-green-500',
      'assinado': 'bg-blue-500',
      'aguardando_assinatura': 'bg-yellow-500',
      'revisado': 'bg-purple-500',
      'editado': 'bg-orange-500',
      'criado': 'bg-gray-500',
      'cancelado': 'bg-red-500',
      'arquivado': 'bg-red-600'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getTramitacaoOptions = (status: string) => {
    // Normalizar o status (remover espaços e converter para lowercase)
    const normalizedStatus = status?.toLowerCase().trim();
    
    // Determinar opções de tramitação conforme o status normalizado
    
    const optionsMap: Record<string, Array<{label: string, value: string}>> = {
      'criado': [
        { label: 'Enviar para Assinatura', value: 'aguardando_assinatura' },
        { label: 'Cancelar', value: 'cancelado' }
      ],
      'aguardando_assinatura': [
        { label: 'Cancelar', value: 'cancelado' }
      ],
      'assinado': [
        { label: 'Enviar para Assinatura (Correção)', value: 'aguardando_assinatura' },
        { label: 'Publicar', value: 'publicado' },
        { label: 'Cancelar', value: 'cancelado' }
      ],
      'publicado': [
        { label: 'Enviar para Assinatura (Correção)', value: 'aguardando_assinatura' },
        { label: 'Cancelar', value: 'cancelado' }
      ],
      'cancelado': [
        { label: 'Enviar para Assinatura', value: 'aguardando_assinatura' }
      ]
    };
    
    // Buscar opções pelo status normalizado
    const options = optionsMap[normalizedStatus];
    
    if (!options) {
      // Retornar opções padrão baseadas no status mais provável
      return [{ label: 'Cancelar', value: 'cancelado' }];
    }
    return options;
  };

  const handleVisualizarClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    navigate(`/portaria/${portaria.id}`);
  };

  const handleEditClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    navigate(`/portaria/${portaria.id}/edit`);
  };

  const handleTramitarClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    setPortariaToTramitar(portaria);
    setTramitarDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, portaria: Portaria) => {
    e.stopPropagation();
    setPortariaToDelete(portaria);
    setDeleteDialogOpen(true);
  };

  const handleConfirmTramitacao = async (novoStatus: string, onRefetch: () => void) => {
    if (!portariaToTramitar) return;

    setIsUpdating(true);
    try {
      // Preparar dados para atualização
      const updateData: any = { status: novoStatus };
      
      // Verificar se é uma transição que requer marcar como corrigido
      const statusAtual = portariaToTramitar.status;
      const isCorrecao = (statusAtual === 'assinado' || statusAtual === 'publicado') && novoStatus === 'aguardando_assinatura';
      
      if (isCorrecao) {
        updateData.corrigido = true;
      }
      
      // Atualizar no backend
      await portariaService.update(portariaToTramitar.id, updateData);
      
      // Recarregar dados
      onRefetch();
    } catch (error) {
      alert('Erro ao atualizar status da portaria');
    } finally {
      setIsUpdating(false);
      setTramitarDialogOpen(false);
      setPortariaToTramitar(null);
    }
  };

  const handleConfirmDelete = async (onRefetch: () => void) => {
    if (!portariaToDelete) return;

    try {
      await portariaService.delete(portariaToDelete.id);
      onRefetch();
    } catch (error) {
      alert('Erro ao deletar portaria');
    } finally {
      setDeleteDialogOpen(false);
      setPortariaToDelete(null);
    }
  };

  return {
    // States
    deleteDialogOpen,
    setDeleteDialogOpen,
    portariaToDelete,
    setPortariaToDelete,
    tramitarDialogOpen,
    setTramitarDialogOpen,
    portariaToTramitar,
    setPortariaToTramitar,
    isUpdating,

    // Functions
    formatStatus,
    getStatusColor,
    getTramitacaoOptions,
    handleVisualizarClick,
    handleEditClick,
    handleTramitarClick,
    handleDeleteClick,
    handleConfirmTramitacao,
    handleConfirmDelete
  };
};

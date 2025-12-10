import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decretoService } from '@/services/documentoDecretoService';
import { Portaria } from '@/types';

export const useDecretoOperations = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [decretoToDelete, setDecretoToDelete] = useState<Portaria | null>(null);
  const [tramitarDialogOpen, setTramitarDialogOpen] = useState(false);
  const [decretoToTramitar, setDecretoToTramitar] = useState<Portaria | null>(null);
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
    const normalizedStatus = status?.toLowerCase().trim();
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
    return optionsMap[normalizedStatus] || [{ label: 'Cancelar', value: 'cancelado' }];
  };

  const handleTramitarClick = (e: React.MouseEvent, decreto: Portaria) => {
    e.stopPropagation();
    setDecretoToTramitar(decreto);
    setTramitarDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, decreto: Portaria) => {
    e.stopPropagation();
    setDecretoToDelete(decreto);
    setDeleteDialogOpen(true);
  };

  const handleConfirmTramitacao = async (novoStatus: string, onRefetch: () => void) => {
    if (!decretoToTramitar) return;
    setIsUpdating(true);
    try {
      const updateData: any = { status: novoStatus };
      await decretoService.update(decretoToTramitar.id!, updateData);
      onRefetch();
    } finally {
      setIsUpdating(false);
      setTramitarDialogOpen(false);
      setDecretoToTramitar(null);
    }
  };

  const handleConfirmDelete = async (onRefetch: () => void) => {
    if (!decretoToDelete) return;
    try {
      await decretoService.delete(decretoToDelete.id!);
      onRefetch();
    } finally {
      setDeleteDialogOpen(false);
      setDecretoToDelete(null);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    decretoToDelete,
    tramitarDialogOpen,
    setTramitarDialogOpen,
    decretoToTramitar,
    isUpdating,
    formatStatus,
    getStatusColor,
    getTramitacaoOptions,
    handleTramitarClick,
    handleDeleteClick,
    handleConfirmTramitacao,
    handleConfirmDelete,
  };
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diariaService } from '@/services/diariaService';
import { Diaria } from '@/services/diariaService';

export const useDiariaOperations = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diariaToDelete, setDiariaToDelete] = useState<Diaria | null>(null);
  const [tramitarDialogOpen, setTramitarDialogOpen] = useState(false);
  const [diariaToTramitar, setDiariaToTramitar] = useState<Diaria | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      criada: 'Criada',
      aguardando_assinatura: 'Aguardando Assinatura',
      assinada: 'Assinada',
      publicado: 'Publicada',
      publicada: 'Publicada',
      assinado: 'Assinada',
      cancelada: 'Cancelada',
      cancelado: 'Cancelada',
      arquivado: 'Arquivado',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      criada: 'bg-gray-500',
      aguardando_assinatura: 'bg-yellow-500',
      assinada: 'bg-blue-500',
      assinado: 'bg-blue-500',
      publicada: 'bg-green-500',
      publicado: 'bg-green-500',
      cancelada: 'bg-red-500',
      cancelado: 'bg-red-500',
      arquivado: 'bg-red-600',
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getTramitacaoOptions = (status: string) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    const optionsPadrao = {
      criado: [
        { label: 'Enviar para Assinatura', value: 'aguardando_assinatura' },
        { label: 'Cancelar', value: 'cancelada' },
      ],
      aguardando_assinatura: [{ label: 'Cancelar', value: 'cancelada' }],
      assinado: [
        { label: 'Enviar para Assinatura (Correção)', value: 'aguardando_assinatura' },
        { label: 'Publicar', value: 'publicada' },
        { label: 'Cancelar', value: 'cancelada' },
      ],
      publicado: [
        { label: 'Enviar para Assinatura (Correção)', value: 'aguardando_assinatura' },
        { label: 'Cancelar', value: 'cancelada' },
      ],
      cancelado: [{ label: 'Enviar para Assinatura', value: 'aguardando_assinatura' }],
    } as { [key: string]: { label: string; value: string }[] };

    const mapAliases: { [key: string]: string } = {
      criada: 'criado',
      assinado: 'assinado',
      assinada: 'assinado',
      publicada: 'publicado',
      publicado: 'publicado',
      cancelada: 'cancelado',
      cancelado: 'cancelado',
    };

    const key = mapAliases[normalizedStatus] || normalizedStatus;
    return optionsPadrao[key] || [{ label: 'Cancelar', value: 'cancelada' }];
  };

  const handleTramitarClick = (e: React.MouseEvent, diaria: Diaria) => {
    e.stopPropagation();
    setDiariaToTramitar(diaria);
    setTramitarDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, diaria: Diaria) => {
    e.stopPropagation();
    setDiariaToDelete(diaria);
    setDeleteDialogOpen(true);
  };

  const handleConfirmTramitacao = async (novoStatus: string, onRefetch: () => void) => {
    if (!diariaToTramitar) return;
    setIsUpdating(true);
    try {
      const updateData: any = { status: novoStatus };
      await diariaService.update(diariaToTramitar.id!, updateData);
      onRefetch();
    } finally {
      setIsUpdating(false);
      setTramitarDialogOpen(false);
      setDiariaToTramitar(null);
    }
  };

  const handleConfirmDelete = async (onRefetch: () => void) => {
    if (!diariaToDelete) return;
    try {
      await diariaService.delete(diariaToDelete.id!);
      onRefetch();
    } finally {
      setDeleteDialogOpen(false);
      setDiariaToDelete(null);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    diariaToDelete,
    tramitarDialogOpen,
    setTramitarDialogOpen,
    diariaToTramitar,
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
import { useState } from 'react';
import { uploadAnexo } from '@/services/processoAnexoService';
import { AnexoProcesso } from '@/types/protocolo';

export const useDocumentAttachment = (processoId?: number) => {
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Função para abrir o modal de anexo
  const handleAttachDocument = () => {
    setShowAttachmentModal(true);
  };

  // Função para confirmar o anexo
  const handleConfirmAttachment = async () => {
    if (!attachmentFile || !attachmentTitle.trim() || !processoId) {
      return;
    }

    try {
      setIsUploading(true);
      
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('arquivo', attachmentFile);
      formData.append('titulo', attachmentTitle.trim());
      formData.append('processo_id', processoId.toString());

      // Fazer upload do anexo
      await uploadAnexo(processoId, 1, attachmentFile); // TODO: usar usuário logado
      
      // Resetar estado do modal
      setAttachmentFile(null);
      setAttachmentTitle('');
      setShowAttachmentModal(false);
      
      // Mostrar mensagem de sucesso
      alert('Anexo adicionado com sucesso!');
      
      // Recarregar a página para mostrar o novo anexo
      window.location.reload();
      
    } catch (err: any) {
      console.error('Erro ao anexar documento:', err);
      alert(err.response?.data?.detail || 'Erro ao anexar documento');
    } finally {
      setIsUploading(false);
    }
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    if (!isUploading) {
      setAttachmentFile(null);
      setAttachmentTitle('');
      setShowAttachmentModal(false);
    }
  };

  return {
    showAttachmentModal,
    setShowAttachmentModal,
    attachmentFile,
    setAttachmentFile,
    attachmentTitle,
    setAttachmentTitle,
    isUploading,
    handleAttachDocument,
    handleConfirmAttachment,
    handleCloseModal
  };
};
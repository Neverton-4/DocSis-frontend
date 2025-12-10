import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachmentFile: File | null;
  setAttachmentFile: (file: File | null) => void;
  attachmentTitle: string;
  setAttachmentTitle: (title: string) => void;
  isUploading: boolean;
  onConfirm: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  attachmentFile,
  setAttachmentFile,
  attachmentTitle,
  setAttachmentTitle,
  isUploading,
  onConfirm
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setAttachmentFile(file);
        if (!attachmentTitle) {
          // Sugerir título baseado no nome do arquivo
          const fileName = file.name.replace('.pdf', '');
          setAttachmentTitle(fileName);
        }
      } else {
        alert('Por favor, selecione apenas arquivos PDF.');
        event.target.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setAttachmentFile(null);
      setAttachmentTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const canConfirm = attachmentFile && attachmentTitle.trim() && !isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Anexar Documento
          </DialogTitle>
          <DialogDescription>
            Selecione um arquivo PDF e insira um título para o anexo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seleção de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo PDF</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={isUploading}
                className="flex-1"
              />
            </div>
            
            {/* Arquivo selecionado */}
            {attachmentFile && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 flex-1">
                  {attachmentFile.name}
                </span>
                <span className="text-xs text-green-600">
                  {(attachmentFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Título do anexo */}
          <div className="space-y-2">
            <Label htmlFor="attachment-title">Título do Anexo</Label>
            <Input
              id="attachment-title"
              type="text"
              placeholder="Digite um título para o anexo"
              value={attachmentTitle}
              onChange={(e) => setAttachmentTitle(e.target.value)}
              disabled={isUploading}
              maxLength={255}
            />
            <p className="text-xs text-gray-500">
              {attachmentTitle.length}/255 caracteres
            </p>
          </div>

          {/* Validação */}
          {!attachmentFile && (
            <Alert>
              <AlertDescription>
                Selecione um arquivo PDF para continuar.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anexando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Anexar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
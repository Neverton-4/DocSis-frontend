import React, { useState, useEffect } from 'react';
import { Download, FileText, File, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Portaria } from '@/types';
import { documentoService as documentoPortariaService } from '@/services/documentoPortariaService';
import { toast } from 'sonner';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  portaria: Portaria | null;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  portaria
}) => {
  const [availability, setAvailability] = useState({
    docx_gerado: false,
    docx_enviado: false,
    pdf_gerado: false,
    pdf_assinado: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  // Buscar documentos disponíveis quando o diálogo abrir
  useEffect(() => {
    if (isOpen && portaria) {
      fetchDocumentAvailability();
    }
  }, [isOpen, portaria]);

  const fetchDocumentAvailability = async () => {
    if (!portaria) return;

    setLoading(true);
    setError(null);

    try {
      const documentosDisponiveis = await documentoPortariaService.verificarDocumentosDisponiveis(portaria.id);
      setAvailability(documentosDisponiveis);
    } catch (error) {
      setError('Erro ao carregar documentos disponíveis');
      toast.error('Erro ao carregar documentos disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado' | 'pdf_assinado') => {
    if (!portaria) return;

    setDownloadingType(type);

    try {
      let blob: Blob;
      let filename = '';
      
      switch (type) {
        case 'docx_gerado':
          blob = await documentoPortariaService.downloadArquivo(portaria.id, 'docx_gerado');
          filename = `portaria-${portaria.numero}-${portaria.ano}-gerado.docx`;
          break;
        case 'docx_enviado':
          blob = await documentoPortariaService.downloadArquivo(portaria.id, 'docx_enviado');
          filename = `portaria-${portaria.numero}-${portaria.ano}-enviado.docx`;
          break;
        case 'pdf_gerado':
          blob = await documentoPortariaService.downloadArquivo(portaria.id, 'pdf_gerado');
          filename = `portaria-${portaria.numero}-${portaria.ano}-gerado.pdf`;
          break;
        case 'pdf_assinado':
          blob = await documentoPortariaService.downloadArquivo(portaria.id, 'pdf_assinado');
          filename = `portaria-${portaria.numero}-${portaria.ano}-assinado.pdf`;
          break;
      }

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download realizado com sucesso!');
    } catch (error) {
      toast.error(`Erro ao baixar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download de Documentos
          </DialogTitle>
          <DialogDescription>
            Portaria {portaria?.numero}/{portaria?.ano} - {portaria?.servidor?.nome_completo}
          </DialogDescription>
        </DialogHeader>
        
        {/* Estado de Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando documentos disponíveis...</span>
          </div>
        )}

        {/* Estado de Erro */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Botões de Download */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* DOCX Gerado */}
            <Button
              variant={availability.docx_gerado ? "default" : "secondary"}
              disabled={!availability.docx_gerado || downloadingType !== null}
              onClick={() => handleDownload('docx_gerado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'docx_gerado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">
                Baixar DOCX<br />Gerado
              </span>
            </Button>

            {/* DOCX Enviado */}
            <Button
              variant={availability.docx_enviado ? "default" : "secondary"}
              disabled={!availability.docx_enviado || downloadingType !== null}
              onClick={() => handleDownload('docx_enviado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'docx_enviado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">
                Baixar DOCX<br />Enviado
              </span>
            </Button>

            {/* PDF Gerado */}
            <Button
              variant={availability.pdf_gerado ? "default" : "secondary"}
              disabled={!availability.pdf_gerado || downloadingType !== null}
              onClick={() => handleDownload('pdf_gerado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'pdf_gerado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <File className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">
                Baixar PDF<br />Gerado
              </span>
            </Button>

            {/* PDF Assinado */}
            <Button
              variant={availability.pdf_assinado ? "default" : "secondary"}
              disabled={!availability.pdf_assinado || downloadingType !== null}
              onClick={() => handleDownload('pdf_assinado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'pdf_assinado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <File className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">
                Baixar PDF<br />Assinado
              </span>
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
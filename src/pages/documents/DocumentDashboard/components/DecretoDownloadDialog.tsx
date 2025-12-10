import React, { useState, useEffect } from 'react';
import { Download, FileText, File, Loader2, AlertCircle } from 'lucide-react';
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
import { documentoDecretoService } from '@/services/documentoDecretoService';
import { toast } from 'sonner';

interface DecretoDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  decreto: Portaria | null;
}

export const DecretoDownloadDialog: React.FC<DecretoDownloadDialogProps> = ({
  isOpen,
  onClose,
  decreto
}) => {
  const [availability, setAvailability] = useState({
    docx_gerado: false,
    docx_enviado: false,
    pdf_gerado: false,
    pdf_assinado: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && decreto) {
      fetchDocumentAvailability();
    }
  }, [isOpen, decreto]);

  const fetchDocumentAvailability = async () => {
    if (!decreto) return;
    setLoading(true);
    setError(null);
    try {
      const documentosDisponiveis = await documentoDecretoService.verificarDocumentosDisponiveis(decreto.id);
      setAvailability(documentosDisponiveis);
    } catch (err) {
      setError('Erro ao carregar documentos disponíveis');
      toast.error('Erro ao carregar documentos disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type: 'docx_gerado' | 'docx_enviado' | 'pdf_gerado' | 'pdf_assinado') => {
    if (!decreto) return;
    setDownloadingType(type);
    try {
      let blob: Blob;
      let filename = '';

      switch (type) {
        case 'docx_gerado': {
          const documentos = await documentoDecretoService.obterDocumentosPorDecreto(decreto.id);
          const doc = documentos.find(d => d.docx_gerado);
          if (!doc) throw new Error('Documento DOCX gerado não encontrado');
          blob = await documentoDecretoService.downloadArquivo(doc.id, 'docx_gerado');
          filename = `decreto-${decreto.numero}-${decreto.ano}-gerado.docx`;
          break;
        }
        case 'docx_enviado': {
          const documentos = await documentoDecretoService.obterDocumentosPorDecreto(decreto.id);
          const doc = documentos.find(d => d.docx_enviado);
          if (!doc) throw new Error('Documento DOCX enviado não encontrado');
          blob = await documentoDecretoService.downloadArquivo(doc.id, 'docx_enviado');
          filename = `decreto-${decreto.numero}-${decreto.ano}-enviado.docx`;
          break;
        }
        case 'pdf_gerado': {
          const documentos = await documentoDecretoService.obterDocumentosPorDecreto(decreto.id);
          const doc = documentos.find(d => d.pdf_gerado);
          if (!doc) throw new Error('Documento PDF gerado não encontrado');
          blob = await documentoDecretoService.downloadArquivo(doc.id, 'pdf_gerado');
          filename = `decreto-${decreto.numero}-${decreto.ano}-gerado.pdf`;
          break;
        }
        case 'pdf_assinado': {
          blob = await documentoDecretoService.downloadPdfAssinado(decreto.id);
          filename = `decreto-${decreto.numero}-${decreto.ano}-assinado.pdf`;
          break;
        }
      }

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
            Decreto {decreto?.numero}/{decreto?.ano} - {decreto?.servidor?.nome_completo || decreto?.servidor_nome}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando documentos disponíveis...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant={availability.docx_gerado ? 'default' : 'secondary'}
              disabled={!availability.docx_gerado || downloadingType !== null}
              onClick={() => handleDownload('docx_gerado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'docx_gerado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">Baixar DOCX<br />Gerado</span>
            </Button>

            <Button
              variant={availability.docx_enviado ? 'default' : 'secondary'}
              disabled={!availability.docx_enviado || downloadingType !== null}
              onClick={() => handleDownload('docx_enviado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'docx_enviado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">Baixar DOCX<br />Enviado</span>
            </Button>

            <Button
              variant={availability.pdf_gerado ? 'default' : 'secondary'}
              disabled={!availability.pdf_gerado || downloadingType !== null}
              onClick={() => handleDownload('pdf_gerado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'pdf_gerado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <File className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">Baixar PDF<br />Gerado</span>
            </Button>

            <Button
              variant={availability.pdf_assinado ? 'default' : 'secondary'}
              disabled={!availability.pdf_assinado || downloadingType !== null}
              onClick={() => handleDownload('pdf_assinado')}
              className="h-20 flex flex-col items-center justify-center gap-2 text-sm"
            >
              {downloadingType === 'pdf_assinado' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <File className="h-6 w-6" />
              )}
              <span className="text-center leading-tight">Baixar PDF<br />Assinado</span>
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
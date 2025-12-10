import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PDFViewerProps {
  pdfUrl?: string;
  loading: boolean;
  error?: string | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  loading,
  error
}) => {
  if (loading) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Carregando documento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar o documento: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!pdfUrl) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
            <FileText className="h-12 w-12" />
            <p>Nenhum documento disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardContent className="p-0">
        <div className="w-full h-[800px] rounded-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Visualizador de PDF"
          />
        </div>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  loading: boolean;
  error: string | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  loading,
  error
}) => {
  return (
    <Card className="h-[800px]">
      <CardContent className="h-full p-0">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Carregando documento...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Visualizador de PDF"
          />
        )}
      </CardContent>
    </Card>
  );
};
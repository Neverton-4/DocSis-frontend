import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Paperclip } from 'lucide-react';

interface AnexoData {
  id: number;
  nome_arquivo: string;
  titulo?: string;
  thumbnail?: string;
}

interface DocumentThumbnailsProps {
  documentoPrincipal: boolean;
  documentoThumbnailBase64?: string;
  anexosData: AnexoData[];
  onDocumentoPrincipalClick: () => void;
  onAnexoClick: (anexo: AnexoData) => void;
}

export const DocumentThumbnails: React.FC<DocumentThumbnailsProps> = ({
  documentoPrincipal,
  documentoThumbnailBase64,
  anexosData = [],
  onDocumentoPrincipalClick,
  onAnexoClick
}) => {
  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <FileText className="h-5 w-5 text-blue-600" />
          Arquivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Documento Principal */}
        {documentoPrincipal && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Documento Principal</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-auto p-3 flex flex-col items-center gap-2 hover:bg-blue-50 border-blue-200"
                onClick={onDocumentoPrincipalClick}
              >
                {documentoThumbnailBase64 ? (
                  <img
                    src={`data:image/png;base64,${documentoThumbnailBase64}`}
                    alt="Thumbnail do documento principal"
                    className="w-16 h-20 object-cover rounded border"
                  />
                ) : (
                  <FileText className="h-16 w-16 text-blue-600" />
                )}
                <span className="text-xs text-center line-clamp-2">
                  Documento Principal
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Anexos */}
        {anexosData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              Anexos ({anexosData.length})
            </h4>
            <div className="space-y-2">
              {anexosData.map((anexo) => (
                <Button
                  key={anexo.id}
                  variant="outline"
                  className="w-full h-auto p-3 flex flex-col items-center gap-2 hover:bg-green-50 border-green-200"
                  onClick={() => onAnexoClick(anexo)}
                >
                  {anexo.thumbnail ? (
                    <img
                      src={`data:image/png;base64,${anexo.thumbnail}`}
                      alt={`Thumbnail do anexo ${anexo.titulo || anexo.nome_arquivo}`}
                      className="w-16 h-20 object-cover rounded border"
                    />
                  ) : (
                    <FileText className="h-16 w-16 text-green-600" />
                  )}
                  <span className="text-xs text-center line-clamp-2">
                    {anexo.titulo || anexo.nome_arquivo}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!documentoPrincipal && anexosData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum arquivo disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
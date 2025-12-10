import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Paperclip } from 'lucide-react';
import { AnexoPortaria } from '@/types/portaria';

interface DocumentTabsProps {
  activeTab: 'documento' | 'anexos';
  onTabChange: (tab: 'documento' | 'anexos') => void;
  documentoPrincipal?: boolean;
  documentoThumbnailBase64?: string;
  anexosData: AnexoPortaria[];
  onDocumentoPrincipalClick: () => void;
  onAnexoClick: (anexo: AnexoPortaria) => void;
}

interface ImageState {
  [key: string]: 'loading' | 'loaded' | 'error';
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  activeTab,
  onTabChange,
  documentoPrincipal,
  documentoThumbnailBase64,
  anexosData,
  onDocumentoPrincipalClick,
  onAnexoClick
}) => {
  const [imageStates, setImageStates] = React.useState<ImageState>({});

  const handleImageLoad = (key: string) => {
    setImageStates(prev => ({ ...prev, [key]: 'loaded' }));
  };

  const handleImageError = (key: string) => {
    console.error('🖼️ Erro ao carregar thumbnail:', key);
    setImageStates(prev => ({ ...prev, [key]: 'error' }));
  };

  const renderThumbnail = (src: string, alt: string, key: string) => {
    const state = imageStates[key] || 'loading';
    
    if (!src || state === 'error') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
          <FileText className="w-8 h-8 mb-1" />
          <span className="text-xs">Sem preview</span>
        </div>
      );
    }

    return (
      <>
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse text-gray-400">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-contain bg-gray-100 transition-opacity duration-200 ${
            state === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => handleImageLoad(key)}
          onError={() => handleImageError(key)}
        />
      </>
    );
  };
  
  if (!documentoPrincipal && anexosData.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs Navigation */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => onTabChange('documento')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documento'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documento Principal
          </button>
          <button
            onClick={() => onTabChange('anexos')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'anexos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Anexos ({anexosData.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-4">
          {/* Documento Principal Tab */}
          {activeTab === 'documento' && documentoPrincipal && (
            <div className="group cursor-pointer text-center">
              <div
                className="relative w-full h-64 md:h-72 overflow-hidden rounded-lg border hover:shadow-lg transition-shadow"
                onClick={onDocumentoPrincipalClick}
              >
                {documentoThumbnailBase64 ? (
                  renderThumbnail(
                    `data:image/png;base64,${documentoThumbnailBase64}`,
                    'Portaria',
                    'documento-principal'
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                    <FileText className="w-8 h-8 mb-1" />
                    <span className="text-xs">Documento</span>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-700 truncate">Portaria</p>
            </div>
          )}

          {/* Anexos Tab */}
          {activeTab === 'anexos' && anexosData.map((anexo) => {
            // Verificar se o thumbnail já contém o prefixo data:image
            const thumbSrc = anexo.thumbnail
              ? (anexo.thumbnail.startsWith('data:') 
                  ? anexo.thumbnail 
                  : `data:image/png;base64,${anexo.thumbnail}`)
              : null;

            return (
              <div key={anexo.id} className="group cursor-pointer text-center">
                <div
                  className="relative w-full h-64 md:h-72 overflow-hidden rounded-lg border hover:shadow-lg transition-shadow"
                  onClick={() => onAnexoClick(anexo)}
                >
                  {thumbSrc ? (
                    renderThumbnail(
                      thumbSrc,
                      anexo.nome_arquivo,
                      `anexo-${anexo.id}`
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                      <FileText className="w-8 h-8 mb-1" />
                      <span className="text-xs">Anexo</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-700 truncate" title={anexo.descricao}>
                  {anexo.descricao || anexo.nome_arquivo}
                </p>
              </div>
            );
          })}

          {/* Empty state for anexos */}
          {activeTab === 'anexos' && anexosData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum anexo encontrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
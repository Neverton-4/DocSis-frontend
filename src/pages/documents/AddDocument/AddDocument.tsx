import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import AssinaturasModal, { AssinaturasState } from '@/components/signatures/AssinaturasModal';
import { DocumentForm } from './components/PortariaForm';
import DecretoForm from './components/DecretoForm';
import DiariaForm from './components/DiariaForm';
import LeiForm from './components/LeiForm';
import EditalForm from './components/EditalForm';
import OutroForm from './components/OutroForm';

// Tipos de documentos suportados
const DOCUMENT_TYPES = {
  'portarias': { name: 'Portaria', plural: 'Portarias' },
  'decretos': { name: 'Decreto', plural: 'Decretos' },
  'diarias': { name: 'Diária', plural: 'Diárias' },
  'leis': { name: 'Lei', plural: 'Leis' },
  'editais': { name: 'Edital', plural: 'Editais' },
  'outros': { name: 'Documento', plural: 'Outros Documentos' }
};

export const AddDocument = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [documentType, setDocumentType] = useState<string>('portarias');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assinaturasState, setAssinaturasState] = useState<AssinaturasState | null>(null);
  const [assinaturasValid, setAssinaturasValid] = useState<boolean>(true);
  const [isAssinaturasOpen, setIsAssinaturasOpen] = useState<boolean>(false);

  // Obter o tipo de documento da URL ou usar 'portarias' como padrão
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    const tabFromUrl = searchParams.get('tab');

    // Priorizar 'type', mas aceitar 'tab' para compatibilidade com navegações existentes
    const desiredType = typeFromUrl || tabFromUrl;
    if (desiredType && DOCUMENT_TYPES[desiredType]) {
      setDocumentType(desiredType);
    }
  }, [searchParams]);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const currentDocType = DOCUMENT_TYPES[documentType] || DOCUMENT_TYPES['portarias'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb={`${currentDocType.plural} / Criar Nova ${currentDocType.name}`}
      />
      
      {/* Barra de ações superior: Voltar, Assinaturas, Cancelar, Criar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            aria-label="Voltar"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAssinaturasOpen(true)} aria-label="Abrir diálogo de assinaturas">Assinaturas</Button>
            <Button type="submit" form="document-form" aria-label={`Criar ${currentDocType.name}`}>Criar {currentDocType.name}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {documentType === 'decretos' ? (
          <DecretoForm 
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            assinaturasState={assinaturasState}
            assinaturasValid={assinaturasValid}
          />
        ) : documentType === 'diarias' ? (
          <DiariaForm 
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            assinaturasState={assinaturasState}
            assinaturasValid={assinaturasValid}
          />
        ) : documentType === 'leis' ? (
          <LeiForm 
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
          />
        ) : documentType === 'editais' ? (
          <EditalForm 
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
          />
        ) : documentType === 'outros' ? (
          <OutroForm 
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
          />
        ) : (
          <DocumentForm 
            documentType={documentType}
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            assinaturasState={assinaturasState}
            assinaturasValid={assinaturasValid}
          />
        )}
      </div>

      {/* Modal de Assinaturas */}
      <AssinaturasModal
        open={isAssinaturasOpen}
        documentTypeKey={documentType as any}
        initialState={assinaturasState || undefined}
        onOpenChange={setIsAssinaturasOpen}
        onSave={(st, valid) => { setAssinaturasState(st); setAssinaturasValid(valid); }}
      />
    </div>
  );
};

// Manter compatibilidade com o nome antigo
export const NewPortaria = AddDocument;

export default AddDocument;
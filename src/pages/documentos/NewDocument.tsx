
import React, { useState } from 'react';
import { DocumentGrid } from '@/components/DocumentGrid';
import { CreateDocumentForm } from '@/components/CreateDocumentForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

export const CreateDocument = () => {
  const [documentType] = useState('portarias'); // Fixo como portarias
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        userName="Usuário" 
        userRole="Administrador" 
        breadcrumb="Documentos / Criar Nova Portaria" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <div className="mb-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            ← Voltar
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CreateDocumentForm 
              showAsPage={true}
            />
          </div>
          
          <div className="lg:col-span-2">
            <DocumentGrid type={documentType} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDocument;

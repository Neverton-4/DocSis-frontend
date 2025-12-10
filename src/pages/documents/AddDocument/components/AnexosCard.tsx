import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Plus } from 'lucide-react';

interface Anexo {
  id: string;
  file: File;
  name: string;
  size: number;
}

export const AnexosCard = () => {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    // Filtrar apenas arquivos PDF
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Apenas arquivos PDF são permitidos nos anexos.');
    }
    
    const newAnexos: Anexo[] = pdfFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size
    }));
    
    setAnexos(prev => [...prev, ...newAnexos]);
  };

  const removeAnexo = (id: string) => {
    setAnexos(prev => prev.filter(anexo => anexo.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Arraste arquivos PDF aqui ou
            </p>
            <Label htmlFor="anexos-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </span>
              </Button>
            </Label>
            <Input
              id="anexos-upload"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Lista de Anexos */}
        {anexos.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Arquivos Anexados:</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {anexos.map((anexo) => (
                <div
                  key={anexo.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {anexo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(anexo.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnexo(anexo.id)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {anexos.length === 0 && (
          <p className="text-xs text-gray-500 text-center">
            Nenhum anexo adicionado
          </p>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTiposPortaria } from '@/hooks/useTiposPortaria';

interface CreateDocumentFormProps {
  onClose?: () => void;
  type?: string;
  onDocumentTypeChange?: (type: string) => void;
  showAsPage?: boolean;
}

export const CreateDocumentForm: React.FC<CreateDocumentFormProps> = ({ 
  onClose, 
  type, 
  onDocumentTypeChange,
  showAsPage = false 
}) => {
  const [formData, setFormData] = useState({
    tipoPortariaId: '',
    subtipoPortariaId: '',
    coletiva: 'nao',
    server: ''
  });
  const navigate = useNavigate();
  const { 
    tiposPortaria, 
    subtiposPortaria, 
    loading: loadingTipos, 
    loadingSubtipos,
    error: errorTipos,
    errorSubtipos,
    fetchSubtiposByTipo 
  } = useTiposPortaria();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tratar "none" como valor vazio para subtipo
    const formDataToSubmit = {
      ...formData,
      subtipoPortariaId: formData.subtipoPortariaId === 'none' ? '' : formData.subtipoPortariaId
    };
    
    console.log('Portaria criada:', formDataToSubmit);
    if (showAsPage) {
      navigate('/');
    } else if (onClose) {
      onClose();
    }
  };

  const handleTipoPortariaChange = (value: string) => {
    setFormData({
      ...formData, 
      tipoPortariaId: value,
      subtipoPortariaId: '' // Reset subtipo quando tipo muda
    });
    
    // Carregar subtipos para o tipo selecionado
    if (value) {
      fetchSubtiposByTipo(parseInt(value));
    }
  };

  const handleColetivaChange = (value: string) => {
    setFormData({...formData, coletiva: value, server: value === 'nao' ? '' : formData.server});
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoPortaria">Tipo de Portaria</Label>
              <Select 
                value={formData.tipoPortariaId} 
                onValueChange={handleTipoPortariaChange}
                disabled={loadingTipos}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTipos ? "Carregando..." : "Selecione o tipo de portaria"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingTipos ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Carregando tipos...
                      </div>
                    </SelectItem>
                  ) : errorTipos ? (
                    <SelectItem value="error" disabled>
                      Erro ao carregar tipos
                    </SelectItem>
                  ) : tiposPortaria.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum tipo encontrado
                    </SelectItem>
                  ) : (
                    tiposPortaria.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errorTipos && (
                <p className="text-sm text-red-600 mt-1">{errorTipos}</p>
              )}
            </div>

            <div>
              <Label htmlFor="coletiva">Coletiva</Label>
              <Select value={formData.coletiva} onValueChange={handleColetivaChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campo Subtipo de Portaria - aparece apenas quando um tipo é selecionado E há subtipos disponíveis */}
          {formData.tipoPortariaId && !loadingSubtipos && !errorSubtipos && Array.isArray(subtiposPortaria) && subtiposPortaria.length > 0 && (
            <div>
              <Label htmlFor="subtipoPortaria">Subtipo de Portaria</Label>
              <Select 
                value={formData.subtipoPortariaId} 
                onValueChange={(value) => setFormData({...formData, subtipoPortariaId: value})}
                disabled={loadingSubtipos}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o subtipo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum subtipo</SelectItem>
                  {subtiposPortaria.map((subtipo) => (
                    <SelectItem key={subtipo.id} value={subtipo.id.toString()}>
                      {subtipo.nome_subtipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.coletiva === 'nao' && (
            <div>
              <Label htmlFor="server">Servidor</Label>
              <Input
                id="server"
                value={formData.server}
                onChange={(e) => setFormData({...formData, server: e.target.value})}
                placeholder="Digite o nome do servidor"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={showAsPage ? () => navigate('/') : onClose}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4 mr-2" />
          Criar Portaria
        </Button>
      </div>
    </form>
  );

  if (showAsPage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Informações da Portaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Criar Nova Portaria
          </DialogTitle>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

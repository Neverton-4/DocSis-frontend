import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import Header from '@/components/Header';
import { Edit, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tipoProcessoService, TipoProcesso } from '@/services/tipoProcessoService';
import { useToast } from '@/hooks/use-toast';

interface ProcessoSection {
  title: string;
  items: TipoProcesso[];
  tipo: 'licenca' | 'gratificacao' | 'declaracao' | 'outro';
}

const TiposProcessos: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tiposProcessos, setTiposProcessos] = useState<TipoProcesso[]>([]);
  const [editingProcess, setEditingProcess] = useState<TipoProcesso | null>(null);
  const [newProcess, setNewProcess] = useState<{ 
    type: string; 
    name: string; 
    description: string 
  }>({
    type: '',
    name: '',
    description: ''
  });
  
  const sectionTitles = {
    licenca: 'Licenças',
    declaracao: 'Declarações',
    gratificacao: 'Gratificações',
    outro: 'Outros'
  };

  const processTypes = [
    { value: 'licenca', label: 'Licenças' },
    { value: 'declaracao', label: 'Declarações' },
    { value: 'gratificacao', label: 'Gratificações' },
    { value: 'outro', label: 'Outros' }
  ];

  useEffect(() => {
    loadTiposProcessos();
  }, []);

  const loadTiposProcessos = async () => {
    try {
      setLoading(true);
      const data = await tipoProcessoService.getAll();
      setTiposProcessos(data);
    } catch (error) {
      console.error('Erro ao carregar tipos de processos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de processos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeProcessosByType = (): ProcessoSection[] => {
    const sections: ProcessoSection[] = [];
    
    (['licenca', 'declaracao', 'gratificacao', 'outro'] as const).forEach(tipo => {
      const items = tiposProcessos.filter(tp => tp.tipo === tipo);
      if (items.length > 0) {
        sections.push({
          title: sectionTitles[tipo],
          items,
          tipo
        });
      }
    });
    
    return sections;
  };

  const handleEdit = (processo: TipoProcesso) => {
    setEditingProcess(processo);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de processo?')) {
      return;
    }

    try {
      await tipoProcessoService.delete(id);
      toast({
        title: "Sucesso",
        description: "Tipo de processo excluído com sucesso.",
      });
      loadTiposProcessos();
    } catch (error) {
      console.error('Erro ao excluir tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tipo de processo.",
        variant: "destructive",
      });
    }
  };

  const handleAddProcess = async () => {
    if (!newProcess.type || !newProcess.name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      await tipoProcessoService.create({
        nome: newProcess.name.trim(),
        descricao: newProcess.description.trim(),
        tipo: newProcess.type as 'licenca' | 'gratificacao' | 'declaracao' | 'outro',
        campos_extras: {}
      });
      
      toast({
        title: "Sucesso",
        description: "Tipo de processo criado com sucesso.",
      });
      
      setNewProcess({ type: '', name: '', description: '' });
      setIsAddDialogOpen(false);
      loadTiposProcessos();
    } catch (error) {
      console.error('Erro ao criar tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o tipo de processo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProcess = async () => {
    if (!editingProcess || !editingProcess.nome.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome do processo.",
        variant: "destructive",
      });
      return;
    }

    try {
      await tipoProcessoService.update(editingProcess.id, {
        nome: editingProcess.nome.trim(),
        descricao: editingProcess.descricao?.trim() || '',
        tipo: editingProcess.tipo,
        campos_extras: editingProcess.campos_extras || {}
      });
      
      toast({
        title: "Sucesso",
        description: "Tipo de processo atualizado com sucesso.",
      });
      
      setIsEditDialogOpen(false);
      setEditingProcess(null);
      loadTiposProcessos();
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingProcess(null);
  };

  const handleCancelAdd = () => {
    setNewProcess({ type: '', name: '', description: '' });
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header 
          userName="João Silva" 
          userRole="Administrador" 
          breadcrumb="Tipos de Processos" 
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tipos de processos...</p>
          </div>
        </div>
      </div>
    );
  }

  const sections = organizeProcessosByType();

  return (
    <div className="h-full flex flex-col">
      <Header 
        userName="João Silva" 
        userRole="Administrador" 
        breadcrumb="Tipos de Processos" 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex gap-4 mb-8">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  ADICIONAR PROCESSO
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Tipo de Processo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Categoria *</Label>
                    <Select
                      value={newProcess.type}
                      onValueChange={(value) => setNewProcess({ ...newProcess, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {processTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Processo *</Label>
                    <Input
                      id="name"
                      placeholder="Digite o nome do processo"
                      value={newProcess.name}
                      onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Digite a descrição (opcional)"
                      value={newProcess.description}
                      onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancelAdd}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddProcess} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dialog de Edição */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Tipo de Processo</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Categoria *</Label>
                  <Select
                    value={editingProcess?.tipo || ''}
                    onValueChange={(value) => 
                      setEditingProcess(prev => prev ? { 
                        ...prev, 
                        tipo: value as 'licenca' | 'gratificacao' | 'declaracao' | 'outro' 
                      } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {processTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome do Processo *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Digite o nome do processo"
                    value={editingProcess?.nome || ''}
                    onChange={(e) => 
                      setEditingProcess(prev => prev ? { ...prev, nome: e.target.value } : null)
                    }
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Input
                    id="edit-description"
                    placeholder="Digite a descrição (opcional)"
                    value={editingProcess?.descricao || ''}
                    onChange={(e) => 
                      setEditingProcess(prev => prev ? { ...prev, descricao: e.target.value } : null)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateProcess} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Nenhum tipo de processo encontrado</p>
              <p className="text-gray-400">Clique em "ADICIONAR PROCESSO" para criar o primeiro tipo de processo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.map((section) => (
                <div key={section.tipo}>
                  <Card className="overflow-hidden">
                    <div className="bg-[#1E293B] text-white p-4">
                      <h2 className="text-lg font-semibold">{section.title}</h2>
                      <p className="text-sm text-gray-300 mt-1">{section.items.length} processo(s)</p>
                    </div>
                    <div className="p-4 space-y-2 bg-white">
                      {section.items.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">{item.nome}</span>
                            {item.descricao && (
                              <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              title="Editar processo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              title="Excluir processo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TiposProcessos;
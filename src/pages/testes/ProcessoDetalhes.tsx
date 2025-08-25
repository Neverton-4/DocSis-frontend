import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from 'react-router-dom';

interface ProcessStep {
  id: string;
  department: string;
  function: string;
  date: string;
  timeframe: string;
  isEndStep: boolean;
  order: number;
}

const ProcessoDetalhes: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<ProcessStep[]>([
    {
      id: '1',
      department: 'Protocolo',
      function: 'Requerimento',
      date: '10/03/2025',
      timeframe: '1h',
      isEndStep: false,
      order: 1
    },
    {
      id: '2',
      department: 'Departamento de Recursos Humanos',
      function: 'Vida Funcional',
      date: '11/03/2025',
      timeframe: '1 dia',
      isEndStep: false,
      order: 2
    },
    {
      id: '3',
      department: 'Assessoria Jurídica',
      function: 'Análise e Parecer',
      date: '12/03/2025',
      timeframe: '5h',
      isEndStep: false,
      order: 3
    },
    {
      id: '4',
      department: 'Secretaria de Lotação do Servidor',
      function: 'Análise e Resposta',
      date: '16/03/2025',
      timeframe: '1 dia',
      isEndStep: true,
      order: 4
    },
    {
      id: '5',
      department: 'Gabinete',
      function: 'Assinatura do Prefeito',
      date: '17/03/2025',
      timeframe: '1 dia',
      isEndStep: false,
      order: 5
    },
    {
      id: '6',
      department: 'Administração',
      function: 'Publicação',
      date: '18/03/2025',
      timeframe: '1 dia',
      isEndStep: false,
      order: 6
    }
  ]);

  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [deletingStep, setDeletingStep] = useState<ProcessStep | null>(null);
  const [newStep, setNewStep] = useState<Partial<ProcessStep>>({
    isEndStep: false
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const departments = [
    'Protocolo',
    'Departamento de Recursos Humanos',
    'Assessoria Jurídica',
    'Secretaria de Lotação do Servidor',
    'Gabinete',
    'Administração'
  ];

  const handleAddStep = () => {
    if (newStep.department && newStep.function) {
      const step: ProcessStep = {
        id: String(steps.length + 1),
        department: newStep.department,
        function: newStep.function,
        date: new Date().toLocaleDateString(),
        timeframe: newStep.timeframe || '',
        isEndStep: newStep.isEndStep || false,
        order: 0 // Será atualizado abaixo
      };

      // Reordena todos os passos existentes
      const updatedSteps = steps.map(s => ({
        ...s,
        order: s.order + 1
      }));

      // Adiciona o novo passo no início
      setSteps([{ ...step, order: 1 }, ...updatedSteps]);
      setNewStep({});
      setIsAddDialogOpen(false);
    }
  };

  const handleEditStep = () => {
    if (editingStep && editingStep.department && editingStep.function) {
      setSteps(steps.map(step => 
        step.id === editingStep.id ? editingStep : step
      ));
      setEditingStep(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteStep = () => {
    if (deletingStep) {
      const deletedOrder = deletingStep.order;
      setSteps(steps
        .filter(step => step.id !== deletingStep.id)
        .map(step => ({
          ...step,
          order: step.order > deletedOrder ? step.order - 1 : step.order
        }))
      );
      setDeletingStep(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Header 
        userName="João Silva" 
        userRole="Administrador" 
        breadcrumb="Processos > Detalhes do Processo" 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
            <h1 className="text-2xl font-bold mb-2">Licença Especial</h1>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  ADICIONAR ETAPA DO PROCESSO
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Etapa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Select
                      value={newStep.department}
                      onValueChange={(value) => setNewStep({ ...newStep, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="function">Função do Departamento</Label>
                    <Input
                      id="function"
                      placeholder="Digite a função"
                      value={newStep.function || ''}
                      onChange={(e) => setNewStep({ ...newStep, function: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isEndStep"
                      checked={newStep.isEndStep}
                      onCheckedChange={(checked: boolean) => setNewStep({ ...newStep, isEndStep: checked })}
                    />
                    <Label htmlFor="isEndStep">Etapa Final</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Etapa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-department">Departamento</Label>
                    <Select
                      value={editingStep?.department}
                      onValueChange={(value) => setEditingStep(prev => prev ? { ...prev, department: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-function">Função do Departamento</Label>
                    <Input
                      id="edit-function"
                      placeholder="Digite a função"
                      value={editingStep?.function || ''}
                      onChange={(e) => setEditingStep(prev => prev ? { ...prev, function: e.target.value } : null)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEditStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog de Exclusão */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir esta etapa do processo?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteStep}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Excluir
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-w-2xl mx-auto">
            {steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <div key={step.id} className="mb-4 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium z-10">
                      {step.order}
                    </div>
                    <div className="flex-1 bg-white rounded-lg border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{step.department}</h3>
                          <p className="text-sm text-gray-600">{step.function}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingStep(step);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setDeletingStep(step);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 -z-10" style={{ height: 'calc(100% + 1rem)' }} />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessoDetalhes; 
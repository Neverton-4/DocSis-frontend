import React, { useState } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import DepartamentoDialog from '@/components/DepartamentoDialog';
import ServidorDialog from '@/components/ServidorDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Servidor {
  nome: string;
  cargo: string;
  dataCadastro: string;
}

interface Departamento {
  nome: string;
  servidores: Servidor[];
}

const Departamentos: React.FC = () => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([
    {
      nome: 'ADMINISTRAÇÃO',
      servidores: [
        { nome: 'Letícia Rodrigues', cargo: 'Diretora Geral', dataCadastro: '10/04/2025' },
        { nome: 'Patricia Prata', cargo: 'Chefe de Setor', dataCadastro: '20/04/2025' },
        { nome: 'Neverton Sousa', cargo: 'Chefe de Setor', dataCadastro: '30/03/2025' },
      ]
    },
    {
      nome: 'ASSESSORIA JURÍDICA',
      servidores: [
        { nome: 'Carlos Patriachar', cargo: 'Procurador Geral', dataCadastro: '10/04/2025' },
        { nome: 'Leonardo Sousa', cargo: 'Advogado', dataCadastro: '20/04/2025' },
      ]
    },
    {
      nome: 'Recursos Humano',
      servidores: [
        { nome: 'Rafael Barbosa', cargo: 'Chefe de Setor', dataCadastro: '30/03/2025' },
        { nome: 'João Paulo', cargo: 'Chefe de Setor', dataCadastro: '30/03/2025' },
      ]
    },
    {
      nome: 'Protocolo',
      servidores: [
        { nome: 'keila Albuquerque', cargo: 'Chefe de Setor', dataCadastro: '30/03/2025' },
      ]
    }
  ]);

  const [departamentoDialogOpen, setDepartamentoDialogOpen] = useState(false);
  const [servidorDialogOpen, setServidorDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servidorParaExcluir, setServidorParaExcluir] = useState<{
    nome: string;
    departamento: string;
  } | null>(null);
  const [editingDepartamento, setEditingDepartamento] = useState<string | null>(null);
  const [editingServidor, setEditingServidor] = useState<{
    nome: string;
    cargo: string;
    departamento: string;
  } | null>(null);

  const handleAddDepartamento = (data: { nome: string }) => {
    setDepartamentos(prev => [...prev, { nome: data.nome, servidores: [] }]);
    toast({
      title: "Órgão adicionado",
      description: `O órgão ${data.nome} foi adicionado com sucesso.`
    });
  };

  const handleAddServidor = (data: { nome: string; cargo: string; departamento: string }) => {
    setDepartamentos(prev => prev.map(dep => {
      if (dep.nome === data.departamento) {
        return {
          ...dep,
          servidores: [...dep.servidores, {
            nome: data.nome,
            cargo: data.cargo,
            dataCadastro: new Date().toLocaleDateString('pt-BR')
          }]
        };
      }
      return dep;
    }));
    toast({
      title: "Servidor adicionado",
      description: `O servidor ${data.nome} foi adicionado ao órgão ${data.departamento}.`
    });
  };

  const handleEditServidor = (
    departamentoNome: string,
    servidorNome: string,
    novosDados: { nome: string; cargo: string; departamento: string }
  ) => {
    setDepartamentos(prev => prev.map(dep => {
      if (dep.nome === departamentoNome) {
        return {
          ...dep,
          servidores: dep.servidores.map(serv => 
            serv.nome === servidorNome
              ? { ...serv, nome: novosDados.nome, cargo: novosDados.cargo }
              : serv
          )
        };
      }
      return dep;
    }));
    toast({
      title: "Servidor atualizado",
      description: `Os dados do servidor foram atualizados com sucesso.`
    });
  };

  const handleDeleteServidor = (departamentoNome: string, servidorNome: string) => {
    setServidorParaExcluir({ nome: servidorNome, departamento: departamentoNome });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (servidorParaExcluir) {
      setDepartamentos(prev => prev.map(dep => {
        if (dep.nome === servidorParaExcluir.departamento) {
          return {
            ...dep,
            servidores: dep.servidores.filter(serv => serv.nome !== servidorParaExcluir.nome)
          };
        }
        return dep;
      }));
      toast({
        title: "Servidor removido",
        description: `O servidor ${servidorParaExcluir.nome} foi removido do órgão ${servidorParaExcluir.departamento}.`
      });
      setServidorParaExcluir(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header 
        userName="João Silva" 
        userRole="Administrador" 
        breadcrumb="Departamentos"
      />
      
      <div className="flex-1 p-8">
        <div className="flex gap-4 mb-6">
          <Button 
            className="bg-primary text-white"
            onClick={() => setDepartamentoDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADICIONAR ÓRGÃO
          </Button>
          <Button 
            className="bg-primary text-white"
            onClick={() => setServidorDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADICIONAR SERVIDOR
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sidebar border-b">
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">ÓRGÃOS</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">SERVIDORES</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">CARGO/FUNÇÃO</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">DATA DE CADASTRO</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {departamentos.map((departamento) => (
                  departamento.servidores.map((servidor, index) => (
                    <tr 
                      key={`${departamento.nome}-${servidor.nome}`}
                      className={`border-b ${
                        departamento.nome === 'ADMINISTRAÇÃO' ? 'bg-orange-100' :
                        departamento.nome === 'ASSESSORIA JURÍDICA' ? 'bg-green-100' :
                        departamento.nome === 'Recursos Humano' ? 'bg-blue-100' :
                        'bg-white'
                      }`}
                    >
                      {index === 0 && (
                        <td 
                          className="px-4 py-3 text-sm font-medium"
                          rowSpan={departamento.servidores.length}
                        >
                          {departamento.nome}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-center">{servidor.nome}</td>
                      <td className="px-4 py-3 text-sm text-center">{servidor.cargo}</td>
                      <td className="px-4 py-3 text-sm text-center">{servidor.dataCadastro}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                className="p-1 rounded hover:bg-gray-100"
                                onClick={() => {
                                  setEditingServidor({
                                    nome: servidor.nome,
                                    cargo: servidor.cargo,
                                    departamento: departamento.nome
                                  });
                                  setServidorDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                className="p-1 rounded hover:bg-gray-100"
                                onClick={() => handleDeleteServidor(departamento.nome, servidor.nome)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DepartamentoDialog
        open={departamentoDialogOpen}
        onOpenChange={setDepartamentoDialogOpen}
        onSubmit={handleAddDepartamento}
        mode="create"
      />

      <ServidorDialog
        open={servidorDialogOpen}
        onOpenChange={setServidorDialogOpen}
        onSubmit={editingServidor 
          ? (data) => {
              handleEditServidor(editingServidor.departamento, editingServidor.nome, data);
              setEditingServidor(null);
            }
          : handleAddServidor
        }
        departamentos={departamentos.map(d => d.nome)}
        defaultValues={editingServidor}
        mode={editingServidor ? 'edit' : 'create'}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        description={
          servidorParaExcluir
            ? `Tem certeza que deseja excluir o servidor "${servidorParaExcluir.nome}" do órgão "${servidorParaExcluir.departamento}"?`
            : "Tem certeza que deseja excluir este servidor?"
        }
      />
    </div>
  );
};

export default Departamentos; 
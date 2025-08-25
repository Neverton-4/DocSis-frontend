import React, { useState } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import ServidorFormDialog from '@/components/ServidorFormDialog';
import ServidorBatchDialog from '@/components/ServidorBatchDialog';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Servidor {
  nome: string;
  cargo: string;
  matricula: string;
  cpf: string;
  rg: string;
  lotacao: string;
}

const Servidores: React.FC = () => {
  const [servidores, setServidores] = useState<Servidor[]>([
    {
      nome: 'Letícia Rodrigues',
      cargo: 'Diretora Geral',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SECAD'
    },
    {
      nome: 'Patricia Prata',
      cargo: 'Chefe de Setor',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SEMED'
    },
    {
      nome: 'Neverton Sousa',
      cargo: 'Chefe de Setor',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SEMAS'
    },
    {
      nome: 'Carlos Patriachar',
      cargo: 'Procurador Geral',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SUOV'
    },
    {
      nome: 'Leonardo Sousa',
      cargo: 'Advogado',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SEMMA'
    },
    {
      nome: 'Rafael Barbosa',
      cargo: 'Chefe de Setor',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'GABINETE'
    },
    {
      nome: 'João Paulo',
      cargo: 'Chefe de Setor',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SEFIN'
    },
    {
      nome: 'keila Albuquerque',
      cargo: 'Chefe de Setor',
      matricula: '1234567',
      cpf: '123.456.789-32',
      rg: '1234567',
      lotacao: 'SEMAGRI'
    }
  ]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servidorParaExcluir, setServidorParaExcluir] = useState<Servidor | null>(null);
  const [servidorParaEditar, setServidorParaEditar] = useState<Servidor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  const handleAddServidor = (data: Servidor) => {
    setServidores(prev => [...prev, data]);
    toast({
      title: "Servidor adicionado",
      description: `O servidor ${data.nome} foi adicionado com sucesso.`
    });
  };

  const handleEditServidor = (data: Servidor) => {
    setServidores(prev => prev.map(servidor => 
      servidor.cpf === servidorParaEditar?.cpf ? data : servidor
    ));
    setServidorParaEditar(null);
    toast({
      title: "Servidor atualizado",
      description: `Os dados do servidor ${data.nome} foram atualizados com sucesso.`
    });
  };

  const handleDeleteServidor = (servidor: Servidor) => {
    setServidorParaExcluir(servidor);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (servidorParaExcluir) {
      setServidores(prev => prev.filter(s => s.cpf !== servidorParaExcluir.cpf));
      toast({
        title: "Servidor removido",
        description: `O servidor ${servidorParaExcluir.nome} foi removido com sucesso.`
      });
      setServidorParaExcluir(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleBatchImport = async (file: File) => {
    try {
      // Aqui você implementaria a lógica para ler o arquivo CSV
      // Por enquanto, apenas mostraremos uma mensagem de sucesso
      toast({
        title: "Arquivo recebido",
        description: `O arquivo ${file.name} foi recebido e será processado.`
      });
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: "Ocorreu um erro ao processar o arquivo.",
        variant: "destructive"
      });
    }
  };

  // Paginação
  const totalPages = Math.ceil(servidores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServidores = servidores.slice(startIndex, endIndex);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header 
        userName="João Silva" 
        userRole="Administrador" 
        breadcrumb="Servidores"
      />
      
      <div className="flex-1 p-8">
        <div className="flex gap-4 mb-6">
          <Button 
            className="bg-primary text-white"
            onClick={() => {
              setServidorParaEditar(null);
              setFormDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADICIONAR SERVIDOR
          </Button>
          <Button 
            className="bg-primary text-white"
            onClick={() => setBatchDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            ADICIONAR SERVIDOR EM LOTE
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sidebar border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Cargo/Função</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Matrícula</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">CPF</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">RG</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white">Lotação</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentServidores.map((servidor, index) => (
                  <tr 
                    key={`${servidor.cpf}-${index}`}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 text-sm">{servidor.nome}</td>
                    <td className="px-4 py-3 text-sm">{servidor.cargo}</td>
                    <td className="px-4 py-3 text-sm">{servidor.matricula}</td>
                    <td className="px-4 py-3 text-sm">{servidor.cpf}</td>
                    <td className="px-4 py-3 text-sm">{servidor.rg}</td>
                    <td className="px-4 py-3 text-sm">{servidor.lotacao}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={() => {
                                setServidorParaEditar(servidor);
                                setFormDialogOpen(true);
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
                              onClick={() => handleDeleteServidor(servidor)}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex justify-end items-center gap-2 p-4 border-t">
            <button
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              {'<<'}
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              {'>>'}
            </button>
          </div>
        </div>
      </div>

      <ServidorFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={servidorParaEditar ? handleEditServidor : handleAddServidor}
        defaultValues={servidorParaEditar || undefined}
        mode={servidorParaEditar ? 'edit' : 'create'}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        description={
          servidorParaExcluir
            ? `Tem certeza que deseja excluir o servidor "${servidorParaExcluir.nome}"?`
            : "Tem certeza que deseja excluir este servidor?"
        }
      />

      <ServidorBatchDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        onSubmit={handleBatchImport}
      />
    </div>
  );
};

export default Servidores; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout';
import { buscarServidorPorId, excluirServidor } from '@/services/servidorService';
import DadosPessoaisCard from './components/DadosPessoaisCard';
import DadosFuncionaisCard from './components/DadosFuncionaisCard';
import DadosComplementaresCard from './components/DadosComplementaresCard';

const ServidorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servidor, setServidor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadServidor = async () => {
      if (!id) {
        toast.error('ID do servidor não fornecido');
        navigate('/cadastros/servidores');
        return;
      }

      try {
        setLoading(true);
        const data = await buscarServidorPorId(parseInt(id));
        setServidor(data);
      } catch (error) {
        console.error('Erro ao carregar servidor:', error);
        toast.error('Erro ao carregar dados do servidor');
        navigate('/cadastros/servidores');
      } finally {
        setLoading(false);
      }
    };

    loadServidor();
  }, [id, navigate]);

  const handleUpdate = () => {
    // Navegar para a página de cadastro com os dados do servidor para edição
    navigate('/servidores/cadastrar', { 
      state: { 
        servidorData: servidor,
        isEditing: true 
      } 
    });
  };

  const handleDelete = async () => {
    if (!servidor?.id) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o servidor "${servidor.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await excluirServidor(servidor.id);
      toast.success('Servidor excluído com sucesso');
      navigate('/cadastros/servidores');
    } catch (error) {
      console.error('Erro ao excluir servidor:', error);
      toast.error('Erro ao excluir servidor. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate('/cadastros/servidores');
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header breadcrumb="Cadastros > Servidores > Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg text-gray-600">Carregando dados do servidor...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!servidor) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <Header breadcrumb="Cadastros > Servidores > Erro" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Servidor não encontrado</h2>
            <p className="text-gray-600 mb-4">Não foi possível carregar os detalhes do servidor.</p>
            <Button onClick={handleBack} variant="outline">
              Voltar para Lista de Servidores
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header 
        breadcrumb={`Cadastros > Servidores > ${servidor.nome}`} 
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1280px] mx-auto">
          {/* Header com botão Voltar, título e botões de ação */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                ← Voltar
              </button>
              <span className="text-lg font-semibold text-gray-700">
                {servidor.nome}
              </span>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleUpdate}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Atualizar</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleting ? 'Excluindo...' : 'Excluir'}</span>
              </Button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-6">
            <DadosPessoaisCard servidor={servidor} />
            <DadosFuncionaisCard servidor={servidor} />
            <DadosComplementaresCard servidor={servidor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServidorDetails;
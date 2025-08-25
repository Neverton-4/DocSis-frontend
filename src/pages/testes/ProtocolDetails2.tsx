import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import Header from '@/components/Header';
import { Paperclip, FileText, ChevronRight } from 'lucide-react';
import { getProcessoById, Processo } from '@/services/processoService';
import { getEtapasByProcessoId, Etapa } from '@/services/etapaService';
import { useQuery } from '@tanstack/react-query';
import DocumentosDialog from '@/components/DocumentosDialog';

const ProtocolDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const processoId = id ? parseInt(id) : 0;
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | null>(null);

  const { data: processo, isLoading: isLoadingProcesso, error: errorProcesso } = useQuery({
    queryKey: ['processo', processoId],
    queryFn: () => getProcessoById(processoId),
    enabled: !!processoId
  });

  const { data: etapas, isLoading: isLoadingEtapas, error: errorEtapas } = useQuery({
    queryKey: ['etapas', processoId],
    queryFn: () => getEtapasByProcessoId(processoId),
    enabled: !!processoId
  });

  // Dados mockados para exemplo
  const documentosPorDepartamento = {
    'Protocolo': [
      { id: 1, nome: 'Documento 1.pdf', url: '/docs/doc1.pdf', tipo: 'application/pdf' },
      { id: 2, nome: 'Imagem 1.jpg', url: '/docs/img1.jpg', tipo: 'image/jpeg' }
    ],
    'Departamento de Recursos Humanos': [
      { id: 3, nome: 'Documento RH 1.pdf', url: '/docs/rh1.pdf', tipo: 'application/pdf' }
    ],
    'Assessoria Jurídica': [
      { id: 4, nome: 'Documento Jurídico 1.pdf', url: '/docs/jur1.pdf', tipo: 'application/pdf' }
    ]
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleEncaminhar = () => {
    // Implementar lógica de encaminhamento
    console.log('Encaminhar processo');
  };

  const handleVerDocumentos = (departamento: string) => {
    setSelectedDepartamento(departamento);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500';
      case 'em_andamento':
        return 'bg-blue-500';
      case 'pendente':
        return 'bg-gray-300';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'em_andamento':
        return 'Em andamento';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (isLoadingProcesso) {
    return <div>Carregando...</div>;
  }

  if (errorProcesso) {
    return <div>Erro ao carregar processo</div>;
  }

  if (!processo) {
    return <div>Processo não encontrado</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header 
        breadcrumb={`Painel > Detalhes do Processo #${processo.id}`} 
      />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Card de Informações */}
          <Card className="col-span-8 p-6 bg-white">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {/* Dados do Servidor */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-3">Dados do Servidor</h3>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Nome do Servidor</h3>
                <p className="text-gray-600">{processo.servidor.nome_completo}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">CPF</h3>
                <p className="text-gray-600">{processo.servidor.cpf}</p>
              </div>
              
              <div className="col-span-2">
                <h3 className="font-medium mb-1">Endereço</h3>
                <p className="text-gray-600">
                  {processo.servidor.logradouro}, {processo.servidor.numero} - {processo.servidor.bairro} - {processo.servidor.cidade}/{processo.servidor.uf}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Contato</h3>
                <p className="text-gray-600">{processo.servidor.contato}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <p className="text-gray-600">{processo.servidor.email}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Matrícula</h3>
                <p className="text-gray-600">{processo.servidor.matricula || 'Não informada'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Lotação</h3>
                <p className="text-gray-600">{processo.servidor.lotacao}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Sexo</h3>
                <p className="text-gray-600">{processo.servidor.sexo === 'M' ? 'Masculino' : processo.servidor.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Data de Nascimento</h3>
                <p className="text-gray-600">{new Date(processo.servidor.data_nascimento).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Data de Admissão</h3>
                <p className="text-gray-600">{processo.servidor.data_admissao ? new Date(processo.servidor.data_admissao).toLocaleDateString() : 'Não informado'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Tipo de Servidor</h3>
                <p className="text-gray-600">{processo.servidor.tipo_servidor}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Cargo</h3>
                <p className="text-gray-600">{processo.servidor.cargo}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Status</h3>
                <p className="text-gray-600">{processo.servidor.status}</p>
              </div>
              
              {processo.servidor.observacoes && (
                <div className="col-span-2">
                  <h3 className="font-medium mb-1">Observações</h3>
                  <p className="text-gray-600">{processo.servidor.observacoes}</p>
                </div>
              )}

              {/* Linha divisória */}
              <div className="col-span-2 my-4 border-t border-gray-200"></div>

              {/* Dados do Processo */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold mb-2">Dados do Processo</h3>
              </div>

              <div>
                <h3 className="font-medium mb-0.5">Tipo de Processo</h3>
                <p className="text-gray-600">{processo.tipo_processo}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-0.5">Descrição</h3>
                <p className="text-gray-600">{processo.descricao}</p>
              </div>

              <div>
                <h3 className="font-medium mb-0.5">Data de Entrada</h3>
                <p className="text-gray-600">{new Date(processo.created_at).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-0.5">Status</h3>
                <p className="text-gray-600">{processo.status}</p>
              </div>

              {processo.detalhes && (
                <div className="col-span-2">
                  <h3 className="font-medium mb-0.5">Detalhes</h3>
                  <p className="text-gray-600">{processo.detalhes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button variant="outline" onClick={handleVoltar}>
                Voltar
              </Button>
              <Button onClick={handleEncaminhar}>
                Encaminhar
              </Button>
            </div>
          </Card>

          {/* Cards de Anexos e Etapas */}
          <div className="col-span-4 space-y-6">
            {/* Card de Documentos */}
            <Card className="p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Documentos em Anexos</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Anexar
                </Button>
              </div>
              
              <div className="space-y-4">
                {Object.keys(documentosPorDepartamento).map((departamento) => (
                  <div 
                    key={departamento}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleVerDocumentos(departamento)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{departamento}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Card de Etapas */}
            <Card className="p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Etapas do Processo</h2>
              <div className="space-y-4">
                {isLoadingEtapas ? (
                  <div className="text-center py-4">Carregando etapas...</div>
                ) : errorEtapas ? (
                  <div className="text-center py-4 text-red-500">Erro ao carregar etapas</div>
                ) : etapas && etapas.length > 0 ? (
                  etapas.sort((a, b) => a.ordem - b.ordem).map((etapa) => (
                    <div key={etapa.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(etapa.etapa_status)} mt-2`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{etapa.departamento?.nome || 'Departamento não definido'}</p>
                          {etapa.etapa_final && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Final
                            </span>
                          )}
                        </div>
                        {etapa.observacao && (
                          <p className="text-sm text-gray-500">{etapa.observacao}</p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400">
                            {getStatusText(etapa.etapa_status)}
                          </span>
                          <div className="flex gap-2">
                            <span className="text-xs text-gray-400">
                              Início: {formatDate(etapa.data_inicio)}
                            </span>
                            {etapa.data_fim && (
                              <span className="text-xs text-gray-400">
                                Fim: {formatDate(etapa.data_fim)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">Nenhuma etapa registrada</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <DocumentosDialog
        departamento={selectedDepartamento || ''}
        documentos={selectedDepartamento ? documentosPorDepartamento[selectedDepartamento] : []}
        isOpen={!!selectedDepartamento}
        onClose={() => setSelectedDepartamento(null)}
      />
    </div>
  );
};

export default ProtocolDetails; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface RegistroServidor {
  id: string;
  protocolo: string;
  nome: string;
  tipo: 'processos' | 'diarias' | 'suprimento';
  data: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
  valor?: number;
  destino?: string;
  periodo?: string;
  descricao: string;
  departamento: string;
  observacoes?: string;
}

interface ServidorTableProps {
  registros: RegistroServidor[];
  activeTab: string;
  searchTerm: string;
  selectedYear: number;
  onRefetch: () => void;
}

export const ServidorTable: React.FC<ServidorTableProps> = ({
  registros,
  activeTab,
  searchTerm,
  selectedYear,
  onRefetch
}) => {
  const navigate = useNavigate();
  
  // Filtrar registros baseado na aba ativa
  const filteredRegistros = registros
    .filter(registro => registro.tipo === activeTab)
    .filter(registro => {
      const registroYear = new Date(registro.data).getFullYear();
      return registroYear === selectedYear;
    })
    .filter(registro => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        registro.nome.toLowerCase().includes(searchLower) ||
        registro.protocolo.toLowerCase().includes(searchLower) ||
        registro.descricao.toLowerCase().includes(searchLower) ||
        registro.departamento.toLowerCase().includes(searchLower)
      );
    });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'em_analise':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      case 'em_analise':
        return 'Em Análise';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const handleViewDetails = (registro: RegistroServidor) => {
    if (registro.tipo === 'processos') {
      // Para processos, navegar para a página de detalhes do processo
      navigate(`/processo/${registro.id}`);
    } else {
      // Para outros tipos, implementar lógica específica
      console.log('Visualizar detalhes:', registro);
    }
  };

  const handleDownload = (registro: RegistroServidor) => {
    console.log('Download documento:', registro);
    // Implementar download do documento
  };

  if (filteredRegistros.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">
            {activeTab === 'processos' 
              ? 'Nenhum processo encontrado' 
              : 'Nenhum registro encontrado'
            }
          </p>
          <p className="text-sm text-gray-400">
            {searchTerm 
              ? 'Tente ajustar os filtros de busca' 
              : activeTab === 'processos'
                ? 'Este servidor não possui processos vinculados no ano selecionado'
                : 'Não há registros para o ano selecionado'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Protocolo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Data</TableHead>
                {activeTab === 'diarias' && (
                  <>
                    <TableHead>Destino</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor</TableHead>
                  </>
                )}
                {activeTab === 'suprimento' && (
                  <TableHead>Valor</TableHead>
                )}
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistros.map((registro) => (
                <TableRow key={registro.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{registro.protocolo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {registro.nome}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={registro.descricao}>
                    {registro.descricao}
                  </TableCell>
                  <TableCell>{registro.departamento}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(registro.data)}
                    </div>
                  </TableCell>
                  {activeTab === 'diarias' && (
                    <>
                      <TableCell>{registro.destino || '-'}</TableCell>
                      <TableCell>{registro.periodo || '-'}</TableCell>
                      <TableCell>
                        {registro.valor ? formatCurrency(registro.valor) : '-'}
                      </TableCell>
                    </>
                  )}
                  {activeTab === 'suprimento' && (
                    <TableCell>
                      {registro.valor ? formatCurrency(registro.valor) : '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge className={getStatusColor(registro.status)}>
                      {getStatusLabel(registro.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(registro)}
                        className="p-2"
                        title="Visualizar detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(registro)}
                        className="p-2"
                        title="Download documento"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Informações adicionais */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Exibindo {filteredRegistros.length} registros de {activeTab}
            </span>
            <span>
              Ano: {selectedYear}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServidorTable;
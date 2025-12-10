import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Calendar } from 'lucide-react';
import { numeracaoService, NumeracaoDocumento } from '@/services/numeracaoService';
import { toast } from 'sonner';

interface NumeracaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (numeracao: NumeracaoDocumento) => void;
  ano?: number;
  mode?: 'select' | 'reserve'; // 'select' para AddDocument, 'reserve' para outros contextos
  documentType?: string; // 'portarias' | 'decretos'
}

export const NumeracaoDialog: React.FC<NumeracaoDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  ano = new Date().getFullYear(),
  mode = 'reserve', // Padrão é 'reserve' para manter compatibilidade
  documentType = 'portarias'
}) => {
  const [numeracoes, setNumeracoes] = useState<NumeracaoDocumento[]>([]);
  const [selectedNumeracao, setSelectedNumeracao] = useState<NumeracaoDocumento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(ano);
  
  // Garantir consistência: limpar seleção ao mudar o ano
  useEffect(() => {
    setSelectedNumeracao(null);
  }, [selectedYear]);
  
  // Estados para o diálogo de reserva
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [reserveDate, setReserveDate] = useState('');

  // Carregar numerações quando o diálogo abrir e quando o ano mudar
  useEffect(() => {
    if (open) {
      carregarNumeracoes();
    }
  }, [open, selectedYear]);

  const carregarNumeracoes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Carregar numerações do ano selecionado
      const data = await numeracaoService.listar(selectedYear, undefined, documentType);
      setNumeracoes(data);
    } catch (err) {
      setError('Erro ao carregar numerações');
      toast.error('Erro ao carregar numerações');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNumeracao = (numeracao: NumeracaoDocumento) => {
    // Só permite selecionar numerações disponíveis
    if (numeracao.status === 'disponivel') {
      setSelectedNumeracao(numeracao);
    }
  };

  const handleConfirmarReserva = async () => {
    if (selectedNumeracao && reserveDate) {
      try {
        // Primeiro, atualizar a numeração com a nova data de referência
        const updatedNumeracao = await numeracaoService.atualizar(selectedNumeracao.id, {
          ...selectedNumeracao,
          data_referencia: reserveDate
        }, documentType);

        // Depois, reservar a numeração
        const reservedNumeracao = await numeracaoService.reservar(selectedNumeracao.id, undefined, documentType);

        // Atualizar a lista local com os dados retornados da API
        setNumeracoes(prev => prev.map(num => 
          num.id === selectedNumeracao.id ? reservedNumeracao : num
        ));

        // Fechar o diálogo de reserva
        setIsReserveDialogOpen(false);
        setReserveDate('');
        setSelectedNumeracao(null);
      } catch (error) {
        console.error('Erro ao reservar numeração:', error);
        // Aqui você pode adicionar uma notificação de erro para o usuário
      }
    }
  };

  const handleReservarNumeracao = async () => {
    if (selectedNumeracao) {
      setIsReserveDialogOpen(true);
    }
  };

  const handleCancelarReserva = () => {
    setIsReserveDialogOpen(false);
    setReserveDate('');
  };

  const handleCancelar = () => {
    onOpenChange(false);
    setSelectedNumeracao(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'disponivel': 'bg-green-200 border-green-300',
      'reservado': 'bg-yellow-200 border-yellow-300',
      'criado': 'bg-blue-200 border-blue-300',
      'aguardando_assinatura': 'bg-orange-200 border-orange-300',
      'assinado': 'bg-purple-200 border-purple-300',
      'publicado': 'bg-gray-300 border-gray-400'
    };
    return colors[status] || 'bg-gray-200 border-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'disponivel': 'Disponível',
      'reservado': 'Reservado',
      'criado': 'Criado',
      'aguardando_assinatura': 'Aguardando',
      'assinado': 'Assinado',
      'publicado': 'Publicado'
    };
    return texts[status] || status;
  };

  // Ordenar numerações por número
  const numeracoesOrdenadas = numeracoes.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Selecionar Numeração
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Carregando numerações...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={carregarNumeracoes} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-15 gap-2 p-4">
                {numeracoesOrdenadas.map((numeracao) => {
                  const isDisponivel = numeracao.status === 'disponivel';
                  const isSelected = selectedNumeracao?.id === numeracao.id;
                  
                  return (
                    <Card
                      key={numeracao.id}
                      className={`
                        relative p-2 cursor-pointer transition-all duration-200 min-h-[60px] flex flex-col items-center justify-center
                        ${getStatusColor(numeracao.status)}
                        ${
                          isSelected
                            ? 'ring-2 ring-blue-500 shadow-md'
                            : isDisponivel
                            ? 'hover:shadow-sm'
                            : 'cursor-not-allowed opacity-75'
                        }
                      `}
                      onClick={() => handleSelectNumeracao(numeracao)}
                    >
                      {/* Número da portaria */}
                      <div className="text-sm font-bold text-gray-900 text-center">
                        {numeracao.status === 'disponivel' ? (
                          numeracao.numero
                        ) : (
                          <div className="flex flex-col items-center">
                            <div>{numeracao.numero}</div>
                            {numeracao.data_referencia && (
                              <div className="text-xs text-gray-700 mt-1">
                                {(() => {
                                  // Extrair dia/mês da data no formato YYYY-MM-DD
                                  const dataMatch = numeracao.data_referencia.match(/\d{4}-(\d{2})-(\d{2})/);
                                  if (dataMatch) {
                                    return `${dataMatch[2]}/${dataMatch[1]}`; // dia/mês
                                  }
                                  return numeracao.data_referencia;
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Indicador de seleção */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
                <span>Reservado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
                <span>Criado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
                <span>Aguardando Assinatura</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-200 border border-purple-300 rounded"></div>
                <span>Assinado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 border border-gray-400 rounded"></div>
                <span>Publicado</span>
              </div>
              {selectedNumeracao && (
                <div className="flex items-center gap-2 font-medium ml-4">
                  <span>Selecionado: {selectedNumeracao.numero}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
              {/* Seletor de Ano alinhado no rodapé com os botões */}
              <div className="flex items-center gap-3">
                <Label htmlFor="year-select">Ano</Label>
                <select
                  id="year-select"
                  className="border rounded px-2 py-1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const baseYear = new Date().getFullYear();
                    const year = baseYear + 1 - idx; // próximo ano até 5 anos atrás
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
                <Button 
                  variant="outline" 
                  onClick={carregarNumeracoes} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
              {mode === 'select' ? (
                <Button 
                  onClick={() => selectedNumeracao && onSelect(selectedNumeracao)}
                  disabled={!selectedNumeracao}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Selecionar
                </Button>
              ) : (
                <Button 
                  onClick={handleReservarNumeracao}
                  disabled={!selectedNumeracao}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reservar
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Reserva */}
      <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Reservar número {selectedNumeracao?.numero}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reserve-date">Data de referência</Label>
              <Input
                id="reserve-date"
                type="date"
                value={reserveDate}
                onChange={(e) => setReserveDate(e.target.value)}
                placeholder="Selecione a data"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelarReserva}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarReserva}
              disabled={!reserveDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reservar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NumeracaoDialog;
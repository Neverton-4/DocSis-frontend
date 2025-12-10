import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Assessor {
  id: string;
  nome: string;
  numeroDecreto: string;
  dataNomeacao: string;
  dedicacao: string;
  indicacao: string;
  categoria: 'I' | 'II' | 'III';
  ativo: boolean;
  tipoDecreto?: string;
  dataDocumento?: string;
}

interface AssessorTableProps {
  assessores: Assessor[];
  activeTab: string;
  viewMode: 'ativos' | 'historico';
  limit?: number;
  onRefetch: () => void;
}

export const AssessorTable: React.FC<AssessorTableProps> = ({
  assessores,
  activeTab,
  viewMode,
  limit,
  onRefetch
}) => {
  const [editingIndicacao, setEditingIndicacao] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Filtrar assessores baseado na aba ativa
  const getTabCategory = (tab: string) => {
    switch (tab) {
      case 'assessores1':
        return 'I';
      case 'assessores2':
        return 'II';
      case 'assessores3':
        return 'III';
      default:
        return 'I';
    }
  };

  const filteredAssessores = assessores
    .filter(assessor => assessor.categoria === getTabCategory(activeTab))
    .filter(assessor => viewMode === 'ativos' ? assessor.ativo : true)
    .slice(0, limit);

  const handleEditIndicacao = (assessorId: string, currentValue: string) => {
    setEditingIndicacao(assessorId);
    setEditValue(currentValue);
  };

  const handleSaveIndicacao = async (assessorId: string) => {
    try {
      // Aqui você implementaria a chamada para a API para salvar a indicação
      console.log(`Salvando indicação para assessor ${assessorId}: ${editValue}`);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEditingIndicacao(null);
      setEditValue('');
      onRefetch();
    } catch (error) {
      console.error('Erro ao salvar indicação:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndicacao(null);
    setEditValue('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  if (filteredAssessores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-500">Nenhum assessor encontrado para esta categoria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-sidebar border-b">
              <th className="px-4 py-3 text-center text-sm font-medium text-white w-16">#</th>
              {viewMode === 'ativos' ? (
                <>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">Nome do Assessor</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Número do Decreto</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white w-36">Data da Nomeação</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white w-28">Dedicação</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">Indicação</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white">Nome</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white w-36">Tipo de Decreto</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white w-32">Número do Decreto</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-white w-36">Data do Documento</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredAssessores.map((assessor, index) => (
              <tr key={assessor.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-center text-gray-500 font-medium">{index + 1}</td>
                {viewMode === 'ativos' ? (
                  <>
                    <td className="px-4 py-3 text-sm text-center">{assessor.nome}</td>
                    <td className="px-4 py-3 text-sm text-center">{assessor.numeroDecreto}</td>
                    <td className="px-4 py-3 text-sm text-center">{formatDate(assessor.dataNomeacao)}</td>
                    <td className="px-4 py-3 text-sm text-center">{assessor.dedicacao}</td>
                    <td className="px-4 py-3 text-sm">
                      {editingIndicacao === assessor.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1"
                            placeholder="Digite a indicação..."
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveIndicacao(assessor.id)}
                            className="p-2"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="p-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-center">{assessor.indicacao || '-'}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditIndicacao(assessor.id, assessor.indicacao || '')}
                            className="p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-center">{assessor.nome}</td>
                    <td className="px-4 py-3 text-sm text-center">{assessor.tipoDecreto || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center">{assessor.numeroDecreto}</td>
                    <td className="px-4 py-3 text-sm text-center">{formatDate(assessor.dataDocumento || assessor.dataNomeacao)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Informações adicionais */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Exibindo {filteredAssessores.length} de {assessores.filter(a => a.categoria === getTabCategory(activeTab)).length} assessores
          </span>
          {viewMode === 'ativos' && limit && (
            <span>
              Limite: {limit} assessores
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
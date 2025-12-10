import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import { UserCheck } from 'lucide-react';

interface DadosRepresentanteCardProps {
  processo: Processo;
}

const DadosRepresentanteCard: React.FC<DadosRepresentanteCardProps> = ({ processo }) => {
  const interessado = processo?.interessado;

  if (!interessado || processo?.iniciador_tipo !== 'juridico') {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Dados do Representante</h3>
        </div>
        <p className="text-gray-500">Dados do representante não disponíveis</p>
      </Card>
    );
  }

  // Função para formatar CPF no padrão XXX.XXX.XXX-XX
  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return cpf;
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Dados do Representante</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <h4 className="font-medium mb-1">Nome</h4>
          <p className="text-gray-600">{interessado?.representante_nome || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">CPF</h4>
          <p className="text-gray-600">{formatCPF(interessado?.representante_cpf || '') || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">RG</h4>
          <p className="text-gray-600">{interessado?.representante_rg || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Cargo</h4>
          <p className="text-gray-600">{interessado?.representante_cargo || 'N/A'}</p>
        </div>
      </div>
    </Card>
  );
};

export default DadosRepresentanteCard;
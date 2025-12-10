import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import { Building2 } from 'lucide-react';

interface DadosJuridicosCardProps {
  processo: Processo;
}

const DadosJuridicosCard: React.FC<DadosJuridicosCardProps> = ({ processo }) => {
  const interessado = processo?.interessado;

  if (!interessado || processo?.iniciador_tipo !== 'juridico') {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Dados Jurídicos</h3>
        </div>
        <p className="text-gray-500">Dados da pessoa jurídica não disponíveis</p>
      </Card>
    );
  }

  // Função para formatar CNPJ no padrão XX.XXX.XXX/XXXX-XX
  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return cnpj;
    return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Função para formatar telefone no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Dados Jurídicos</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <h4 className="font-medium mb-1">Razão Social</h4>
          <p className="text-gray-600">{interessado?.razao_social || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Nome Fantasia</h4>
          <p className="text-gray-600">{interessado?.nome_fantasia || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">CNPJ</h4>
          <p className="text-gray-600">{formatCNPJ(interessado?.cnpj || '') || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Inscrição Estadual</h4>
          <p className="text-gray-600">{interessado?.inscricao_estadual || 'N/A'}</p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Telefone</h4>
          <p className="text-gray-600">
            {formatPhone(interessado?.contato || '') || 'N/A'}
            {interessado?.is_whatsapp && interessado?.contato && (
              <span className="ml-2 text-green-600 text-sm">(WhatsApp)</span>
            )}
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">E-mail</h4>
          <p className="text-gray-600">{interessado?.email || 'N/A'}</p>
        </div>
      </div>

      {interessado?.observacoes && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-1">Observações</h4>
          <p className="text-gray-600">{interessado.observacoes}</p>
        </div>
      )}
    </Card>
  );
};

export default DadosJuridicosCard;
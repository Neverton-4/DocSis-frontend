import React, { useState } from 'react';
import { Processo } from '@/services/processoService';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServerInfoProps {
  processo: Processo;
}

const ServerInfo: React.FC<ServerInfoProps> = ({ processo }) => {
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  // Função para formatar CPF no padrão XXX.XXX.XXX-XX
  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return cpf;
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
    <>
      {/* Dados Pessoais */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-3">Dados Pessoais</h3>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Nome do Servidor</h3>
        <p className="text-gray-600">{processo.servidor.nome_completo}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">CPF</h3>
        <p className="text-gray-600">{formatCPF(processo.servidor.cpf)}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Contato</h3>
        <p className="text-gray-600">{formatPhone(processo.servidor.contato)}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Email</h3>
        <p className="text-gray-600">{processo.servidor.email}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Sexo</h3>
        <p className="text-gray-600">{processo.servidor.sexo === 'M' ? 'Masculino' : processo.servidor.sexo === 'F' ? 'Feminino' : 'Outro'}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Data de Nascimento</h3>
        <p className="text-gray-600">{new Date(processo.servidor.data_nascimento).toLocaleDateString()}</p>
      </div>

      {/* Seção de Endereço Expansível */}
      <div className="col-span-2 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Endereço</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddressExpanded(!isAddressExpanded)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            {isAddressExpanded ? (
              <>
                Ocultar
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Expandir
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        
        {isAddressExpanded && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium mb-1">Logradouro</h3>
              <p className="text-gray-600">{processo.servidor.logradouro || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Número</h3>
              <p className="text-gray-600">{processo.servidor.numero || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Bairro</h3>
              <p className="text-gray-600">{processo.servidor.bairro || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Cidade</h3>
              <p className="text-gray-600">{processo.servidor.cidade || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">UF</h3>
              <p className="text-gray-600">{processo.servidor.uf || 'Não informado'}</p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Endereço Completo</h3>
              <p className="text-gray-600">
                {processo.servidor.logradouro}, {processo.servidor.numero} - {processo.servidor.bairro} - {processo.servidor.cidade}/{processo.servidor.uf}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dados Funcionais */}
      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-semibold mb-3">Dados Funcionais</h3>
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
    </>
  );
};

export default ServerInfo;
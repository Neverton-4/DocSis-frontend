import React from 'react';
import { Card } from '@/components/ui/card-component';
import { Processo } from '@/services/processoService';
import { User } from 'lucide-react';

interface DadosPessoaisCardProps {
  processo: Processo;
}

const DadosPessoaisCard: React.FC<DadosPessoaisCardProps> = ({ processo }) => {
  const isServidor = processo?.iniciador_tipo === 'servidor';
  const isCidadao = processo?.iniciador_tipo === 'cidadao';
  const interessado = processo?.interessado;

  if (!interessado) {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Dados Pessoais</h3>
        </div>
        <p className="text-gray-500">Dados do interessado não disponíveis</p>
      </Card>
    );
  }

  // Função para formatar CPF no padrão XXX.XXX.XXX-XX
  const formatCPF = (cpf: string) => {
    if (!cpf) return 'N/A';
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return cpf;
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para formatar telefone no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  // Função para concatenar RG com UF e Órgão Expedidor
  const formatRGCompleto = () => {
    const rg = interessado?.rg;
    const uf = interessado?.rg_uf;
    const orgao = interessado?.orgao_expe;
    
    if (!rg) return 'N/A';
    
    let rgCompleto = rg;
    if (orgao && uf) {
      rgCompleto += ` (${orgao}/${uf})`;
    } else if (uf) {
      rgCompleto += ` (${uf})`;
    } else if (orgao) {
      rgCompleto += ` (${orgao})`;
    }
    
    return rgCompleto;
  };

  // Função para formatar data de nascimento
  const formatDataNascimento = (data: string) => {
    if (!data) return 'N/A';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  // Função para formatar sexo
  const formatSexo = (sexo: string) => {
    if (!sexo) return 'N/A';
    switch (sexo.toUpperCase()) {
      case 'M': return 'Masculino';
      case 'F': return 'Feminino';
      case 'O': return 'Outro';
      default: return sexo;
    }
  };

  // Função para formatar WhatsApp
  const formatIsWhatsApp = (isWhatsapp: boolean | string) => {
    if (isWhatsapp === true || isWhatsapp === 'true' || isWhatsapp === '1') {
      return 'Sim';
    } else if (isWhatsapp === false || isWhatsapp === 'false' || isWhatsapp === '0') {
      return 'Não';
    }
    return 'N/A';
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Dados Pessoais</h3>
      </div>
      
      {/* Layout específico para servidor conforme especificação */}
      {isServidor && (
        <div className="space-y-4">
          {/* Linha 1: nome_completo e cpf */}
          <div className="flex gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <span className="text-sm font-medium text-gray-700">Nome Completo:</span>
              <span className="ml-2 text-gray-600">{interessado?.nome_completo || 'N/A'}</span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <span className="text-sm font-medium text-gray-700">CPF:</span>
              <span className="ml-2 text-gray-600">{formatCPF(interessado?.cpf || '')}</span>
            </div>
          </div>

          {/* Linha 2: rg, (orgao_exp/rg_uf), data_nascimento e sexo */}
          <div className="flex gap-6 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <span className="text-sm font-medium text-gray-700">RG:</span>
              <span className="ml-2 text-gray-600">{formatRGCompleto()}</span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <span className="text-sm font-medium text-gray-700">Data de Nascimento:</span>
              <span className="ml-2 text-gray-600">{formatDataNascimento(interessado?.data_nascimento || '')}</span>
            </div>
            <div className="flex-1 min-w-[100px]">
              <span className="text-sm font-medium text-gray-700">Sexo:</span>
              <span className="ml-2 text-gray-600">{formatSexo(interessado?.sexo || '')}</span>
            </div>
          </div>

          {/* Linha 3: email, contato e is_whatsapp */}
          <div className="flex gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-600">{interessado?.email || 'N/A'}</span>
            </div>
            <div className="flex-1 min-w-[150px]">
              <span className="text-sm font-medium text-gray-700">Contato:</span>
              <span className="ml-2 text-gray-600">{formatPhone(interessado?.contato || '')}</span>
            </div>
            <div className="flex-1 min-w-[100px]">
              <span className="text-sm font-medium text-gray-700">WhatsApp:</span>
              <span className="ml-2 text-gray-600">{formatIsWhatsApp(interessado?.is_whatsapp)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Layout para cidadão (mantém o layout original expandido) */}
      {isCidadao && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <h4 className="font-medium mb-1">Nome Completo</h4>
            <p className="text-gray-600">{interessado?.nome_completo || 'N/A'}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">CPF</h4>
            <p className="text-gray-600">{formatCPF(interessado?.cpf || '')}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">RG</h4>
            <p className="text-gray-600">{formatRGCompleto()}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Contato</h4>
            <p className="text-gray-600">{formatPhone(interessado?.contato || '')}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Email</h4>
            <p className="text-gray-600">{interessado?.email || 'N/A'}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Sexo</h4>
            <p className="text-gray-600">{formatSexo(interessado?.sexo || '')}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Data de Nascimento</h4>
            <p className="text-gray-600">{formatDataNascimento(interessado?.data_nascimento || '')}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Estado Civil</h4>
            <p className="text-gray-600">{interessado?.estado_civil || 'N/A'}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Profissão</h4>
            <p className="text-gray-600">{interessado?.profissao || 'N/A'}</p>
          </div>

          {/* Endereço completo para cidadãos */}
          {interessado?.endereco && (
            <>
              <div>
                <h4 className="font-medium mb-1">CEP</h4>
                <p className="text-gray-600">{interessado.endereco.cep || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Logradouro</h4>
                <p className="text-gray-600">{interessado.endereco.logradouro || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Número</h4>
                <p className="text-gray-600">{interessado.endereco.numero || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Complemento</h4>
                <p className="text-gray-600">{interessado.endereco.complemento || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Bairro</h4>
                <p className="text-gray-600">{interessado.endereco.bairro || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Cidade</h4>
                <p className="text-gray-600">{interessado.endereco.cidade || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">UF</h4>
                <p className="text-gray-600">{interessado.endereco.uf || 'N/A'}</p>
              </div>
            </>
          )}

          {/* Observações para cidadãos */}
          {interessado?.observacoes && (
            <div className="col-span-2">
              <h4 className="font-medium mb-1">Observações</h4>
              <p className="text-gray-600">{interessado.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DadosPessoaisCard;
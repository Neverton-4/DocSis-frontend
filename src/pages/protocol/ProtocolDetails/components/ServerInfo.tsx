import React from 'react';
import { Processo } from '@/services/processoService';

interface ServerInfoProps {
  processo: Processo;
}

const ServerInfo: React.FC<ServerInfoProps> = ({ processo }) => {
  // Determinar se é servidor ou cidadão e obter os dados apropriados
  const isServidor = processo?.interessado_tipo === 'servidor';
  const interessado = processo?.interessado || processo?.servidor;
  
  if (!interessado) {
    return (
      <div className="col-span-2">
        <p className="text-gray-500">Dados do interessado não disponíveis</p>
      </div>
    );
  }

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
        <h3 className="font-medium mb-1">Nome {isServidor ? 'do Servidor' : 'do Cidadão'}</h3>
        <p className="text-gray-600">{interessado?.nome_completo || 'Não informado'}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">CPF</h3>
        <p className="text-gray-600">{formatCPF(interessado?.cpf || '')}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Contato</h3>
        <p className="text-gray-600">{formatPhone(interessado?.contato || '')}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Email</h3>
        <p className="text-gray-600">{interessado?.email || 'Não informado'}</p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Sexo</h3>
        <p className="text-gray-600">
          {interessado?.sexo === 'M' ? 'Masculino' : 
           interessado?.sexo === 'F' ? 'Feminino' : 
           interessado?.sexo === 'O' ? 'Outro' : 'Não informado'}
        </p>
      </div>
      
      <div>
        <h3 className="font-medium mb-1">Data de Nascimento</h3>
        <p className="text-gray-600">
          {interessado?.data_nascimento ? 
            new Date(interessado.data_nascimento).toLocaleDateString() : 
            'Não informado'}
        </p>
      </div>

      {/* Campos específicos do cidadão */}
      {!isServidor && (
        <>
          <div>
            <h3 className="font-medium mb-1">RG</h3>
            <p className="text-gray-600">{interessado?.rg || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">UF do RG</h3>
            <p className="text-gray-600">{interessado?.rg_uf || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Estado Civil</h3>
            <p className="text-gray-600">{interessado?.estado_civil || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Profissão</h3>
            <p className="text-gray-600">{interessado?.profissao || 'Não informado'}</p>
          </div>
        </>
      )}



      {/* Dados Funcionais - apenas para servidores */}
      {isServidor && (
        <>
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Dados Funcionais</h3>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Matrícula</h3>
            <p className="text-gray-600">{interessado?.matricula || 'Não informada'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">RG</h3>
            <p className="text-gray-600">{interessado?.rg || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">UF do RG</h3>
            <p className="text-gray-600">{interessado?.rg_uf || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Órgão Expedidor</h3>
            <p className="text-gray-600">{interessado?.orgao_exp || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Lotação</h3>
            <p className="text-gray-600">{interessado?.lotacao || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Data de Admissão</h3>
            <p className="text-gray-600">
              {interessado?.data_admissao ? 
                new Date(interessado.data_admissao).toLocaleDateString() : 
                'Não informado'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Tipo de Servidor</h3>
            <p className="text-gray-600">{interessado?.tipo_servidor || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Cargo</h3>
            <p className="text-gray-600">{interessado?.cargo || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Status</h3>
            <p className="text-gray-600">{interessado?.status || 'Não informado'}</p>
          </div>

          {/* Novos campos de expediente */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Dados de Expediente</h3>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Tipo de Expediente</h3>
            <p className="text-gray-600">
              {interessado?.expediente_tipo === 'INTEGRAL' ? 'Integral' :
               interessado?.expediente_tipo === 'PARCIAL' ? 'Parcial' :
               interessado?.expediente_tipo === 'FLEXIVEL' ? 'Flexível' : 'Não informado'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Horário de Início</h3>
            <p className="text-gray-600">{interessado?.expediente_inicio || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Horário de Fim</h3>
            <p className="text-gray-600">{interessado?.expediente_fim || 'Não informado'}</p>
          </div>

          {/* Novos campos de amparo */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-3">Dados de Amparo Legal</h3>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Tipo de Amparo</h3>
            <p className="text-gray-600">
              {interessado?.amparo_tipo === 'CONCURSO_PUBLICO' ? 'Concurso Público' :
               interessado?.amparo_tipo === 'PROCESSO_SELETIVO' ? 'Processo Seletivo' :
               interessado?.amparo_tipo === 'NOMEACAO' ? 'Nomeação' :
               interessado?.amparo_tipo === 'CONTRATO_TEMPORARIO' ? 'Contrato Temporário' :
               interessado?.amparo_tipo === 'OUTROS' ? 'Outros' : 'Não informado'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Número do Amparo</h3>
            <p className="text-gray-600">{interessado?.amparo_numero || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Ano do Amparo</h3>
            <p className="text-gray-600">{interessado?.amparo_ano || 'Não informado'}</p>
          </div>
        </>
      )}
      
      {interessado?.observacoes && (
        <div className="col-span-2">
          <h3 className="font-medium mb-1">Observações</h3>
          <p className="text-gray-600">{interessado.observacoes}</p>
        </div>
      )}
    </>
  );
};

export default ServerInfo;
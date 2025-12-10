import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DadosPessoaisCardProps {
  servidor: any;
}

const DadosPessoaisCard: React.FC<DadosPessoaisCardProps> = ({ servidor }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return 'N/A';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatSexo = (sexo: string | null) => {
    if (!sexo) return 'N/A';
    switch (sexo.toLowerCase()) {
      case 'm':
      case 'masculino':
        return 'Masculino';
      case 'f':
      case 'feminino':
        return 'Feminino';
      default:
        return sexo;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Dados Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Nome e CPF (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome Completo</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.nome_completo || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">CPF</label>
              <p className="text-sm text-gray-900 mt-1">{formatCPF(servidor.cpf)}</p>
            </div>
          </div>

          {/* RG, UF do RG, Órgão Expedidor, Data de Nascimento e Sexo (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">RG</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.rg || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">UF do RG</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.rg_uf || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Órgão Expedidor</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.orgao_exp || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(servidor.data_nascimento)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Sexo</label>
              <p className="text-sm text-gray-900 mt-1">{formatSexo(servidor.sexo)}</p>
            </div>
          </div>

          {/* E-mail e Contato WhatsApp (mesma linha) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">E-mail</label>
              <p className="text-sm text-gray-900 mt-1">{servidor.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Contato WhatsApp</label>
              <p className="text-sm text-gray-900 mt-1">
                {servidor.is_whatsapp && servidor.contato ? formatPhone(servidor.contato) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosPessoaisCard;
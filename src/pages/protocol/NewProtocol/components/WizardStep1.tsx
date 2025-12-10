import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card-component';
import { Search, User, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { 
  buscarServidoresPorNome, 
  buscarServidoresPorCPF,
  buscarServidoresPorNomeECPF,
  buscarServidorPorId 
} from '@/services/servidorService';
import {
  buscarCidadaosPorNome,
  buscarCidadaosPorCPF,
  buscarCidadaosPorNomeECPF,
  buscarCidadaoPorId,
  cidadaoToCustomer
} from '@/services/cidadaoService';
import {
  buscarJuridicosPorRazaoSocial,
  buscarJuridicosPorCNPJ,
  buscarJuridicoPorId,
  juridicoToCustomer
} from '@/services/juridicoService';
import { Customer } from '@/types';

interface WizardStep1Props {
  onServidorSelect: (servidor: Customer) => void;
  tipoPessoa: 'servidor' | 'cidadao' | 'juridico';
}

const WizardStep1: React.FC<WizardStep1Props> = ({ onServidorSelect, tipoPessoa }) => {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const [searchCPF, setSearchCPF] = useState('');
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 14) {
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = tipoPessoa === 'juridico' ? formatCNPJ(e.target.value) : formatCPF(e.target.value);
    setSearchCPF(formattedValue);
  };

  const buscarPessoas = async () => {
    if (!searchName.trim() && !searchCPF.trim()) {
      const documento = tipoPessoa === 'juridico' ? 'CNPJ' : 'CPF';
      toast.error(`Digite pelo menos o nome ou ${documento} para buscar`);
      return;
    }

    if (searchName.trim().length < 3 && searchCPF.replace(/\D/g, '').length < 3) {
      toast.error('Digite pelo menos 3 caracteres para buscar');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let data = [];
      const cleanCPF = searchCPF.replace(/\D/g, '');
      
      if (tipoPessoa === 'servidor') {
        if (searchName.trim().length >= 3 && cleanCPF.length >= 3) {
          data = await buscarServidoresPorNomeECPF(searchName.trim(), cleanCPF);
        } else if (searchName.trim().length >= 3) {
          data = await buscarServidoresPorNome(searchName.trim());
        } else if (cleanCPF.length >= 3) {
          data = await buscarServidoresPorCPF(cleanCPF);
        }
      } else if (tipoPessoa === 'cidadao') {
        if (searchName.trim().length >= 3 && cleanCPF.length >= 3) {
          data = await buscarCidadaosPorNomeECPF(searchName.trim(), cleanCPF);
        } else if (searchName.trim().length >= 3) {
          data = await buscarCidadaosPorNome(searchName.trim());
        } else if (cleanCPF.length >= 3) {
          data = await buscarCidadaosPorCPF(cleanCPF);
        }
      } else if (tipoPessoa === 'juridico') {
        if (searchName.trim().length >= 3 && cleanCPF.length >= 3) {
          // Buscar por razão social e CNPJ (implementar função combinada se necessário)
          const dataRazao = await buscarJuridicosPorRazaoSocial(searchName.trim());
          const dataCNPJ = await buscarJuridicosPorCNPJ(cleanCPF);
          // Combinar resultados e remover duplicatas
          const combined = [...dataRazao, ...dataCNPJ];
          data = combined.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
        } else if (searchName.trim().length >= 3) {
          data = await buscarJuridicosPorRazaoSocial(searchName.trim());
        } else if (cleanCPF.length >= 3) {
          data = await buscarJuridicosPorCNPJ(cleanCPF);
        }
      }
      
      setPessoas(data);
      
      if (data.length === 0) {
        const tipoPessoaTexto = tipoPessoa === 'servidor' ? 'servidor' : tipoPessoa === 'cidadao' ? 'cidadão' : 'jurídico';
        toast.info(`Nenhum ${tipoPessoaTexto} encontrado com os critérios informados`);
      }
    } catch (error) {
      const tipoPessoaTexto = tipoPessoa === 'servidor' ? 'servidores' : tipoPessoa === 'cidadao' ? 'cidadãos' : 'jurídicos';
      toast.error(`Erro ao buscar ${tipoPessoaTexto}`);
      setPessoas([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePessoaClick = async (pessoa: any) => {
    try {
      let customerData: Customer;
      
      if (tipoPessoa === 'servidor') {
        // Buscar dados completos do servidor
        const servidorCompleto = await buscarServidorPorId(parseInt(pessoa.id));
        
        // Converter para o formato Customer
        customerData = {
          id: servidorCompleto?.id?.toString() || '',
          fullName: servidorCompleto?.nome_completo || '',
          cpf: servidorCompleto?.cpf || '',
          rg: servidorCompleto?.rg || '',
          contato: servidorCompleto?.contato || '',
          email: servidorCompleto?.email || '',
          data_nascimento: servidorCompleto?.data_nascimento || '',
          sexo: servidorCompleto?.sexo || 'M',
          tipoServidor: servidorCompleto?.tipo_servidor || 'efetivo',
          cargo: servidorCompleto?.cargo?.nome || servidorCompleto?.cargo_2?.nome || '',
          lotacao: servidorCompleto?.lotacao?.nome || '',
          secretaria_id: servidorCompleto?.secretaria_id || 0,
          secretaria: servidorCompleto?.lotacao?.nome || '',
          is_whatsapp: servidorCompleto?.is_whatsapp || false,
          // Dados de endereço (primeiro endereço se existir)
          logradouro: servidorCompleto?.enderecos?.[0]?.logradouro || '',
          bairro: servidorCompleto?.enderecos?.[0]?.bairro || '',
          numero: servidorCompleto?.enderecos?.[0]?.numero || '',
          complemento: servidorCompleto?.enderecos?.[0]?.complemento || '',
          cidade: servidorCompleto?.enderecos?.[0]?.cidade || '',
          uf: servidorCompleto?.enderecos?.[0]?.uf || '',
          cep: servidorCompleto?.enderecos?.[0]?.cep || '',
          // Campos de processo
          tipoProcesso: '',
          tipoProcesso_escolhido: '',
          tipoProcessoOutro: '',
          camposExtras: {},
          // Campos de controle
          status: 'pendente',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (tipoPessoa === 'cidadao') {
        // Buscar dados completos do cidadão
        const cidadaoCompleto = await buscarCidadaoPorId(parseInt(pessoa.id));
        
        // Converter para o formato Customer
        customerData = cidadaoToCustomer(cidadaoCompleto);
        
        // Adicionar campos de processo
        customerData.tipoProcesso = '';
        customerData.tipoProcesso_escolhido = '';
        customerData.tipoProcessoOutro = '';
        customerData.camposExtras = {};
        customerData.status = 'pendente';
        customerData.createdAt = new Date().toISOString();
        customerData.updatedAt = new Date().toISOString();
      } else if (tipoPessoa === 'juridico') {
        // Buscar dados completos do jurídico
        const juridicoCompleto = await buscarJuridicoPorId(parseInt(pessoa.id));
        
        // Converter para o formato Customer
        customerData = juridicoToCustomer(juridicoCompleto);
        
        // Adicionar campos de processo
        customerData.tipoProcesso = '';
        customerData.tipoProcesso_escolhido = '';
        customerData.tipoProcessoOutro = '';
        customerData.camposExtras = {};
        customerData.status = 'pendente';
        customerData.createdAt = new Date().toISOString();
        customerData.updatedAt = new Date().toISOString();
      }
      
      onServidorSelect(customerData);
    } catch (error) {
      const tipoPessoaTexto = tipoPessoa === 'servidor' ? 'servidor' : tipoPessoa === 'cidadao' ? 'cidadão' : 'jurídico';
      toast.error(`Erro ao carregar dados do ${tipoPessoaTexto}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarPessoas();
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <div className="mb-4">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          ← Voltar
        </button>
      </div>

      {/* Card de Busca */}
      <Card className="p-6 bg-white">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Buscar {tipoPessoa === 'servidor' ? 'Servidor' : tipoPessoa === 'cidadao' ? 'Cidadão' : 'Jurídico'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="searchName">{tipoPessoa === 'juridico' ? 'Razão Social' : 'Nome'}</Label>
            <Input
              id="searchName"
              placeholder={tipoPessoa === 'juridico' ? 'Digite a razão social' : `Digite o nome do ${tipoPessoa === 'servidor' ? 'servidor' : 'cidadão'}`}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="searchCPF">{tipoPessoa === 'juridico' ? 'CNPJ' : 'CPF'}</Label>
            <Input
              id="searchCPF"
              placeholder={tipoPessoa === 'juridico' ? '00.000.000/0000-00' : '000.000.000-00'}
              value={searchCPF}
              onChange={handleCPFChange}
              onKeyPress={handleKeyPress}
              maxLength={tipoPessoa === 'juridico' ? 18 : 14}
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <Button 
              onClick={buscarPessoas}
              disabled={isSearching}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate(
                tipoPessoa === 'servidor' ? '/servidores/cadastrar' : 
                tipoPessoa === 'cidadao' ? '/cidadaos/cadastrar' : 
                '/juridicos/cadastrar'
              )}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados da Busca */}
      {hasSearched && (
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4">
            Resultados da Busca ({pessoas.length} encontrado{pessoas.length !== 1 ? 's' : ''})
          </h3>
          
          {pessoas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum {tipoPessoa === 'servidor' ? 'servidor' : tipoPessoa === 'cidadao' ? 'cidadão' : 'jurídico'} encontrado</p>
              <p className="text-sm">Tente ajustar os critérios de busca ou cadastre um novo {tipoPessoa === 'servidor' ? 'servidor' : tipoPessoa === 'cidadao' ? 'cidadão' : 'jurídico'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pessoas.map((pessoa) => (
                <div
                  key={pessoa.id}
                  onClick={() => handlePessoaClick(pessoa)}
                  className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{pessoa?.nome_completo || pessoa?.razao_social || 'Nome não informado'}</h4>
                      <p className="text-sm text-gray-600">
                        {tipoPessoa === 'juridico' ? 'CNPJ' : 'CPF'}: {pessoa?.cnpj || pessoa?.cpf || 'Documento não informado'}
                      </p>
                      {tipoPessoa === 'servidor' && pessoa?.matricula && (
                        <p className="text-sm text-gray-600">Matrícula: {pessoa.matricula}</p>
                      )}
                      {tipoPessoa === 'juridico' && pessoa?.nome_fantasia && (
                        <p className="text-sm text-gray-600">Nome Fantasia: {pessoa.nome_fantasia}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Clique para selecionar</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default WizardStep1;
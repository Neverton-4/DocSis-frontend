// NovoProtocoloFormWrapper.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { tipoProcessoService } from '@/services/tipoProcessoService';
import { secretariaService } from '@/services/secretariaService';
import { createProcesso, getComprovanteHTML } from '@/services/processoService';
import { salvarServidor, buscarServidoresPorNome, buscarServidorPorCPF } from '@/services/servidorService';
import { Customer, TipoServidor, TipoProcesso, Secretaria } from '@/types';
import DadosPessoaisForm from './DadosPessoaisForm';
import ProcessoForm from './ProcessoForm';
import { Button } from '@/components/ui/button';
import AnexarDialog from './AnexarDialog';
import { Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import * as Dialog from '@radix-ui/react-dialog';

const NovoProtocoloFormWrapper = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Customer>({
    id: '', 
    fullName: '', 
    cpf: '',
    logradouro: '',
    bairro: '',
    numero: '',
    cidade: '',
    uf: '',
    tipoServidor: 'efetivo', lotacao: '', cargo: '', sexo: 'M', secretaria: '', isWhatsapp: false,
    status: 'Pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    contato: '', email: '', dateOfBirth: '', tipoProcesso2: '', tipoProcessoOutro: ''
  });
  const [tiposProcesso, setTiposProcesso] = useState<TipoProcesso[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [servidores, setServidores] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [showAnexarDialog, setShowAnexarDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [protocoloId, setProtocoloId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tipos, secretarias] = await Promise.all([
          tipoProcessoService.getAll(), secretariaService.getAll()
        ]);
        setTiposProcesso(tipos);
        setSecretarias(secretarias);
      } catch (e) {
        toast.error("Erro ao carregar dados necessários");
      }
    };
    fetchData();
  }, []);

  const formatarCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone: string) => {
    return telefone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === 'checkbox' ? checked : value;

    if (["cpf", "contato"].includes(name)) {
      fieldValue = value.replace(/\D/g, '');
    }

    if (name === 'cpf' && fieldValue.length <= 11) {
      fieldValue = formatarCPF(fieldValue);
    }

    if (name === 'contato' && fieldValue.length <= 11) {
      fieldValue = formatarTelefone(fieldValue);
    }

    if (typeof fieldValue === 'string') {
  if (name === 'email') {
    fieldValue = fieldValue.toLowerCase();
  } else if (name === 'fullName') {
    fieldValue = fieldValue.toUpperCase();
  } else {
    fieldValue = fieldValue.toUpperCase();
  }
}

    setFormData(prev => ({ ...prev, [name]: fieldValue }));

    // aplica classe visual
    const input = document.querySelector(`input[name='${name}']`);
    if (input && name !== 'email') input.classList.add('uppercase');
    if (input && name === 'email') input.classList.remove('uppercase');
  };



  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, fullName: value }));

    if (value.length < 3) {
      setServidores([]);
      setShowAutocomplete(false);
      return;
    }

    try {
      const data = await buscarServidoresPorNome(value);
      setServidores(data);
      setShowAutocomplete(true);
    } catch (error) {
      console.error('Erro ao buscar servidores:', error);
      toast.error('Erro ao buscar servidores');
    }
  };

  const handleServidorSelect = (servidor: any) => {
    // Obter primeiro endereço se existir
    const primeiroEndereco = servidor.enderecos?.[0];
    
    setFormData(prev => ({
      ...prev,
      id: servidor.id,
      fullName: servidor.nome_completo,
      cpf: servidor.cpf,
      rg: servidor.rg || '',
      // Mapear endereço do array enderecos
      logradouro: primeiroEndereco?.logradouro || '',
      bairro: primeiroEndereco?.bairro || '',
      numero: primeiroEndereco?.numero || '',
      complemento: primeiroEndereco?.complemento || '',
      cidade: primeiroEndereco?.cidade || '',
      uf: primeiroEndereco?.uf || '',
      cep: primeiroEndereco?.cep || '',
      tipoServidor: servidor.tipo_servidor,
      // Mapear lotação e cargo dos objetos aninhados
      lotacao: servidor.lotacao?.abrev || '',
      secretaria_id: servidor.secretaria_id || 0,
      cargo: servidor.cargo?.nome || servidor.cargo_2?.nome || '',
      sexo: servidor.sexo,
      secretaria: servidor.secretaria,
      contato: servidor.contato,
      is_whatsapp: servidor.is_whatsapp || false,
      email: servidor.email,
      dateOfBirth: servidor.data_nascimento
    }));
    setShowAutocomplete(false);
  };

  
  const handleProcessoSelect = (processo: { nome: string; tipo: string }) => {
    setFormData(prev => ({
      ...prev,
      tipoProcesso: processo.nome,
      tipoProcesso2: processo.tipo,
      tipoProcessoOutro: '',
    }));
    setCategoriaSelecionada(processo.tipo);
    console.log('Categoria selecionada:', processo.tipo);
  };


  const getTipoCategoria = (tipo: string): string | null => {
    const match = tiposProcesso.find(tp => tp.nome === tipo);
    return match?.tipo ?? 'outro';
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let servidorId = formData.id;

      const servidorPayload = {
        nome_completo: formData.fullName,
        cpf: formData.cpf,
        rg: formData.rg || null,
        data_nascimento: formData.dateOfBirth,
        sexo: formData.sexo,
        contato: formData.contato,
        is_whatsapp: formData.isWhatsapp,
        email: formData.email,
        tipo_servidor: formData.tipoServidor,
        // TODO: Implementar associação de cargo após criação do servidor
        secretaria_id: formData.secretaria_id || null,
        data_admissao: null,
        status: 'ativo',
        observacoes: '',
        // Criar endereço se houver dados
        enderecos: formData.logradouro ? [{
          cep: formData.cep || '',
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento || null,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf
        }] : []
      };

      if (!servidorId) {
        try {
          const servidorExistente = await buscarServidorPorCPF(formData.cpf);
          servidorId = servidorExistente.id;
          await salvarServidor({ id: servidorId, ...servidorPayload });
        } catch (err: any) {
          if (err.response?.status === 404) {
            const novoServidor = await salvarServidor(servidorPayload);
            servidorId = novoServidor.id;
          } else {
            throw err;
          }
        }
      } else {
        await salvarServidor({ id: servidorId, ...servidorPayload });
      }

      const processoPayload = {
        servidor_id: servidorId,
        usuario_id: user?.id,
        tipo_processo: formData.tipoProcesso2.toLowerCase(),
        nome: formData.tipoProcesso,
        detalhes: formData.tipoProcessoOutro || '',
        status: 'pendente'
      };

      const response = await createProcesso(processoPayload);
      console.log('Protocolo criado:', response);
      setProtocoloId(response.id?.toString()); // id do processo

      setShowDialog(true);
    } catch (error) {
      toast.error('Erro ao criar protocolo.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleVisualizar = async () => {
    console.log('protocoloId atual:', protocoloId);
    if (!protocoloId) {
      toast.error('ID do processo não encontrado.');
      return;
    }
  
    try {
      const html = await getComprovanteHTML(protocoloId);
      const win = window.open();
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch (err) {
      toast.error('Erro ao carregar comprovante');
      console.error(err);
    }
  };
  
  

  const handleImprimir = async () => {
    const win = window.open();
    if (win) {
      win.document.write('<html><head><title>Imprimir</title></head><body>');
      win.document.write(`<pre>${JSON.stringify(formData, null, 2)}</pre>`);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  const handleEnviarEmail = async () => {
    console.log('Enviar comprovante por e-mail:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 p-8 overflow-auto">
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-10 p-4 bg-white">
          <DadosPessoaisForm
            formData={formData}
            handleChange={handleChange}
            handleNameChange={handleNameChange}
            servidores={servidores}
            showAutocomplete={showAutocomplete}
            handleServidorSelect={handleServidorSelect}
            secretarias={secretarias}
          />
          <ProcessoForm
            formData={formData}
            tiposProcesso={tiposProcesso}
            categoriaSelecionada={categoriaSelecionada}
            handleProcessoSelect={handleProcessoSelect}
            handleChange={handleChange}
            processoCriado={!!protocoloId}
          />
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowAnexarDialog(true)}
            >
              <Paperclip className="h-4 w-4" />
              Anexar
            </Button>
            {showAnexarDialog && (
              <AnexarDialog
                onClose={() => setShowAnexarDialog(false)}
                onSelecionarArquivo={(file) => toast.success(`Arquivo selecionado: ${file.name}`)}
              />
            )}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md bg-white p-6 rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2">
            <Dialog.Title className="text-lg font-semibold mb-4">Deseja gerar um comprovante?</Dialog.Title>
            <div className="space-y-4">
              <Button onClick={handleVisualizar} className="w-full">Visualizar</Button>
              <Button onClick={handleImprimir} className="w-full">Imprimir</Button>
              <Button onClick={handleEnviarEmail} className="w-full">Enviar por e-mail</Button>
              <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full">Cancelar</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </form>
  );
};

export default NovoProtocoloFormWrapper;

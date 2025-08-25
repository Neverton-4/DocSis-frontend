import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, TipoServidor, Secretaria, TipoProcesso } from '@/types';
import { useForm } from 'react-hook-form';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: Customer;
  mode?: 'create' | 'edit';
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode = 'create'
}) => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    cpf: '',
    endereco: {
      logradouro: '',
      bairro: '',
      numero: '',
      cidade: '',
      uf: '',
    },
    tipoServidor: 'efetivo' as TipoServidor,
    secretaria: 'Gabinete' as Secretaria,
    contato: '',
    email: '',
    dateOfBirth: '',
    tipoProcesso: 'outro' as TipoProcesso,
    tipoProcessoOutro: '',
    status: 'Approved' as const,
    cargo: 'assistente_administrativo' as const,
  });

  const form = useForm({
    defaultValues: defaultValues || formData,
  });

  useEffect(() => {
    if (defaultValues && open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, open, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoProcessoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipoProcesso: value as TipoProcesso,
      tipoProcessoOutro: value === 'outro' ? prev.tipoProcessoOutro : ''
    }));
  };

  const isLicenca = (tipo: string) => tipo.startsWith('licenca_');
  const isDeclaracao = (tipo: string) => tipo.startsWith('declaracao_');
  const isGratificacao = (tipo: string) => tipo.startsWith('gratificacao_');
  const isOutro = (tipo: string) => !isLicenca(tipo) && !isDeclaracao(tipo) && !isGratificacao(tipo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      fullName: '',
      cpf: '',
      endereco: {
        logradouro: '',
        bairro: '',
        numero: '',
        cidade: '',
        uf: '',
      },
      tipoServidor: 'efetivo',
      secretaria: 'Gabinete',
      contato: '',
      email: '',
      dateOfBirth: '',
      tipoProcesso: 'outro',
      tipoProcessoOutro: '',
      status: 'Approved',
      cargo: 'assistente_administrativo',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Protocolo' : 'Editar Protocolo'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha os dados para criar um novo protocolo.' 
              : 'Edite os dados do protocolo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2 col-span-2">
              <Label>Logradouro</Label>
              <Input
                name="endereco.logradouro"
                placeholder="Logradouro"
                value={formData.endereco.logradouro}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Bairro</Label>
              <Input
                name="endereco.bairro"
                placeholder="Bairro"
                value={formData.endereco.bairro}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <Input
                name="endereco.cidade"
                placeholder="Cidade"
                value={formData.endereco.cidade}
                onChange={handleChange}
                required
              />
              <Input
                name="endereco.numero"
                placeholder="Número"
                value={formData.endereco.numero}
                onChange={handleChange}
                required
              />
              <Input
                name="endereco.uf"
                placeholder="UF"
                value={formData.endereco.uf}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4 col-span-3">
              <div className="grid gap-2">
                <Label htmlFor="tipoServidor">Tipo de Servidor</Label>
                <Select
                  value={formData.tipoServidor}
                  onValueChange={(value) => handleSelectChange('tipoServidor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de servidor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efetivo">Efetivo</SelectItem>
                    <SelectItem value="temporario">Temporário</SelectItem>
                    <SelectItem value="comissionado">Comissionado</SelectItem>
                    <SelectItem value="nao_servidor">Não é servidor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="secretaria">Secretaria de Lotação</Label>
                <Select
                  value={formData.secretaria}
                  onValueChange={(value) => handleSelectChange('secretaria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a secretaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gabinete">Gabinete</SelectItem>
                    <SelectItem value="SECAD">SECAD</SelectItem>
                    <SelectItem value="SECOM">SECOM</SelectItem>
                    <SelectItem value="SECULT">SECULT</SelectItem>
                    <SelectItem value="SEFIN">SEFIN</SelectItem>
                    <SelectItem value="SEICOMTUR">SEICOMTUR</SelectItem>
                    <SelectItem value="SEMAGRI">SEMAGRI</SelectItem>
                    <SelectItem value="SEMAS">SEMAS</SelectItem>
                    <SelectItem value="SEMDEL">SEMDEL</SelectItem>
                    <SelectItem value="SEMED">SEMED</SelectItem>
                    <SelectItem value="SEMUTRAN">SEMUTRAN</SelectItem>
                    <SelectItem value="SEPLAN">SEPLAN</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="SUOV">SUOV</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cargo">Cargo do Servidor</Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) => handleSelectChange('cargo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistente_administrativo">Assistente Administrativo</SelectItem>
                    <SelectItem value="auxiliar_servicos_gerais">Auxiliar de Serviços Gerais</SelectItem>
                    <SelectItem value="tecnico_computacao">Técnico em Computação</SelectItem>
                    <SelectItem value="assessor_especial_1">Assessor Especial I</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 col-span-3">
              <div className="grid gap-2">
                <Label htmlFor="contato">Contato</Label>
                <Input
                  id="contato"
                  name="contato"
                  placeholder="(99)99999-9999"
                  value={formData.contato}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="secad@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Data de Criação</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tipoProcesso">Tipo de Processo</Label>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Licenças</h4>
                  <Select
                    value={isLicenca(formData.tipoProcesso) ? formData.tipoProcesso : undefined}
                    onValueChange={handleTipoProcessoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de licença" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="licenca_especial">Especial</SelectItem>
                      <SelectItem value="licenca_sem_vencimento">Sem Vencimento</SelectItem>
                      <SelectItem value="licenca_paternidade">Paternidade</SelectItem>
                      <SelectItem value="licenca_maternidade">Maternidade</SelectItem>
                      <SelectItem value="licenca_doenca_familia">Doença em Pessoa da Familia</SelectItem>
                      <SelectItem value="licenca_saude">Saúde</SelectItem>
                      <SelectItem value="licenca_eletiva">Eletiva</SelectItem>
                      <SelectItem value="licenca_casamento">Casamento</SelectItem>
                      <SelectItem value="licenca_afastamento_conjuge">Afastamento de Cônjugue</SelectItem>
                      <SelectItem value="licenca_obrigacoes_leis">Obrigações Estabelecidas em Lei</SelectItem>
                      <SelectItem value="licenca_nojo">Nojo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Declarações</h4>
                  <Select
                    value={isDeclaracao(formData.tipoProcesso) ? formData.tipoProcesso : undefined}
                    onValueChange={handleTipoProcessoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de declaração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="declaracao_tempo_servico">Tempo de Serviços</SelectItem>
                      <SelectItem value="declaracao_tempo_servico_ipmc">Tempo de Serviço - IPMC</SelectItem>
                      <SelectItem value="declaracao_tempo_servico_inss">Tempo de Serviço - INSS</SelectItem>
                      <SelectItem value="declaracao_tempo_processo_seletivo">Tempo para Processo Seletivo</SelectItem>
                      <SelectItem value="declaracao_nao_exerce_funcoes">Não Exerce Funções</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Gratificações</h4>
                  <Select
                    value={isGratificacao(formData.tipoProcesso) ? formData.tipoProcesso : undefined}
                    onValueChange={handleTipoProcessoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de gratificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gratificacao_nivel_superior">Nível Superior</SelectItem>
                      <SelectItem value="gratificacao_pos_graduacao">Titularidade Pós-Graduação</SelectItem>
                      <SelectItem value="gratificacao_mestrado">Titularidade Mestrado</SelectItem>
                      <SelectItem value="gratificacao_doutorado">Titularidade Doutorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Outros</h4>
                  <Select
                    value={isOutro(formData.tipoProcesso) ? formData.tipoProcesso : undefined}
                    onValueChange={handleTipoProcessoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione outro tipo de processo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permissao_uso">Permissão de Uso</SelectItem>
                      <SelectItem value="renovacao_permissao_uso">Renovação de Permissão de Uso</SelectItem>
                      <SelectItem value="titulo_perpetuidade">Titulo de Perpetuidade</SelectItem>
                      <SelectItem value="retificacao_nome">Retificação de Nome</SelectItem>
                      <SelectItem value="reducao_carga_horaria">Redução de Carga horária</SelectItem>
                      <SelectItem value="exoneracao">Exoneração</SelectItem>
                      <SelectItem value="desligamento">Desligamento</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.tipoProcesso === 'outro' && (
                <div className="mt-6">
                  <Label htmlFor="tipoProcessoOutro">Especificar o tipo de processo</Label>
                  <textarea
                    id="tipoProcessoOutro"
                    name="tipoProcessoOutro"
                    value={formData.tipoProcessoOutro}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              {mode === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;

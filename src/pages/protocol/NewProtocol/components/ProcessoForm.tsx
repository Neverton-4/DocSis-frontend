import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TipoCategoria } from '@/types';
import { tipoProcessoService } from '@/services/tipoProcessoService';
import { subtipoProcessoService, SubtipoProcesso } from '@/services/subtipoProcessoService';

const ProcessoForm = ({ formData, tiposProcesso, categoriaSelecionada, handleProcessoSelect, handleChange, tipoPessoa }) => {
  const [tiposProcessoServidor, setTiposProcessoServidor] = useState([]);
  const [subtipos, setSubtipos] = useState<SubtipoProcesso[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [loadingSubtipos, setLoadingSubtipos] = useState(false);

  // Carregar tipos de processo para servidor
  useEffect(() => {
    if (tipoPessoa === 'servidor') {
      const carregarTiposServidor = async () => {
        try {
          const tipos = await tipoProcessoService.getAll({ iniciador_tipo: 'servidor' });
          setTiposProcessoServidor(tipos);
        } catch (error) {
          console.error('Erro ao carregar tipos de processo para servidor:', error);
        }
      };
      carregarTiposServidor();
    }
  }, [tipoPessoa]);

  // Carregar subtipos quando um tipo é selecionado
  const handleTipoSelect = async (tipoId: string) => {
    const tipo = tiposProcessoServidor.find(t => t.id.toString() === tipoId);
    if (tipo) {
      setTipoSelecionado(tipo);
      setLoadingSubtipos(true);
      
      try {
        const subtiposData = await subtipoProcessoService.getByTipoId(tipo.id);
        setSubtipos(subtiposData);
      } catch (error) {
        console.error('Erro ao carregar subtipos:', error);
        setSubtipos([]);
      } finally {
        setLoadingSubtipos(false);
      }
      
      // Atualizar o formulário com o tipo selecionado
      handleProcessoSelect(tipo);
    }
  };

  const handleSubtipoSelect = (subtipoId: string) => {
    const subtipo = subtipos.find(s => s.id.toString() === subtipoId);
    if (subtipo) {
      // Atualizar o formulário com o subtipo selecionado
      handleChange({
        target: {
          name: 'subtipo_id',
          value: subtipo.id
        }
      });
    }
  };

  const getSubtipoLabel = () => {
    if (tipoSelecionado?.nome === 'Licença') {
      return 'Licença';
    }
    return 'Subtipo';
  };
  const getTipoCategoria = (tipo: string): TipoCategoria | null => {
    const match = tiposProcesso.find(tp => tp.nome === tipo);
    return match?.tipo ?? 'outro';
  };

  const getTiposPorCategoria = (categoria) => tiposProcesso.filter(tp => tp.tipo === categoria);

  const getValorCategoria = (categoria) => {
    const tipo = tiposProcesso.find(tp => tp.nome === formData.tipoProcesso);
    return tipo?.tipo === categoria ? formData.tipoProcesso : '';
  };

  const getCamposExtras = () => {
    const tipo = tiposProcesso.find(tp => tp.nome === formData.tipoProcesso);
    return tipo?.campos_extras || [];
  };

  const handleCategoriaSelect = (categoria: string, value: string) => {
    const tipoSelecionado = tiposProcesso.find(tp => tp.nome === value);
    if (tipoSelecionado) {
      handleProcessoSelect(tipoSelecionado);
    }
  };

  // Para cidadãos, mostrar apenas um seletor simples com todos os tipos disponíveis
  if (tipoPessoa === 'cidadao') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tipoProcesso">Selecione o processo</Label>
          <Select
            value={formData.tipoProcesso}
            onValueChange={(value) => {
              const tipoSelecionado = tiposProcesso.find(tp => tp.nome === value);
              if (tipoSelecionado) {
                handleProcessoSelect(tipoSelecionado);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo de processo" />
            </SelectTrigger>
            <SelectContent>
              {tiposProcesso.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.nome}>{tipo.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoProcessoOutro">Detalhar o processo</Label>
          <textarea
            id="tipoProcessoOutro"
            name="tipoProcessoOutro"
            value={formData.tipoProcessoOutro}
            onChange={handleChange}
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Descreva os detalhes do processo..."
          />
        </div>
      </div>
    );
  }

  // Para servidores, usar a nova estrutura com um único select de tipo e subtipos dinâmicos
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tipoProcesso">Tipo de Processo</Label>
        <Select
          value={tipoSelecionado?.id?.toString() || ''}
          onValueChange={handleTipoSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tipo de processo" />
          </SelectTrigger>
          <SelectContent>
            {tiposProcessoServidor.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id.toString()}>{tipo.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tipoSelecionado && (
        <div className="space-y-2">
          <Label htmlFor="subtipoProcesso">{getSubtipoLabel()}</Label>
          <Select
            value={formData.subtipo_id?.toString() || ''}
            onValueChange={handleSubtipoSelect}
            disabled={loadingSubtipos}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loadingSubtipos 
                    ? "Carregando..." 
                    : subtipos.length === 0 
                      ? "Nenhum subtipo disponível" 
                      : `Selecione ${getSubtipoLabel().toLowerCase()}`
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {subtipos.map((subtipo) => (
                <SelectItem key={subtipo.id} value={subtipo.id.toString()}>{subtipo.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tipoProcessoOutro">Detalhar o processo</Label>
        <textarea
          id="tipoProcessoOutro"
          name="tipoProcessoOutro"
          value={formData.tipoProcessoOutro}
          onChange={handleChange}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Descreva os detalhes do processo..."
        />
      </div>
    </div>
  );
};

export default ProcessoForm;

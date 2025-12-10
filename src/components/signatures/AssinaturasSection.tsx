import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { tipoDocumentoService, TiposDocumentosAssinantesDetalhado, TipoAssinante, AssinanteMinimo } from '@/services/tipoDocumentoService';

interface AssinanteItem { id: number; nome: string; cpf: string; }

type DocumentTypeKey = 'portarias' | 'decretos' | 'diarias';

interface AssinaturaStateItem {
  enabled: boolean;
  assinante?: AssinanteItem | null;
}

export type AssinaturasState = Record<TipoAssinante, AssinaturaStateItem>;

interface AssinaturasSectionProps {
  documentTypeKey: DocumentTypeKey;
  initialValue?: AssinaturasState;
  onChange?: (state: AssinaturasState, isValid: boolean) => void;
}

const cargoLabels: Record<TipoAssinante, string> = {
  prefeito: 'Prefeito Municipal',
  secretario: 'Secretário Municipal',
  procurador: 'Procurador Municipal',
  controlador: 'Controlador Interno',
};

const toUpper = (s?: string) => (s || '').toLocaleUpperCase('pt-BR');

export const AssinaturasSection: React.FC<AssinaturasSectionProps> = ({ documentTypeKey, initialValue, onChange }) => {
  const [mappings, setMappings] = useState<TiposDocumentosAssinantesDetalhado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogRole, setDialogRole] = useState<TipoAssinante | null>(null);

  const [state, setState] = useState<AssinaturasState>(() => {
    const base: AssinaturasState = {
      prefeito: { enabled: false, servidor: null },
      secretario: { enabled: false, servidor: null },
      procurador: { enabled: false, servidor: null },
      controlador: { enabled: false, servidor: null },
    };
    if (initialValue) {
      return { ...base, ...initialValue };
    }
    return base;
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await tipoDocumentoService.listarAssinantesPorTipo(documentTypeKey);
        setMappings(data);
        // Inicializar obrigatórios como enabled
        setState((prev) => {
          const next = { ...prev };
          for (const m of data) {
            if (m.obrigatorio) {
              next[m.tipo_assinante] = { ...next[m.tipo_assinante], enabled: true };
            }
          }
          return next;
        });
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar assinaturas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [documentTypeKey]);

  const isValid = useMemo(() => {
    // Válido quando todos obrigatórios possuem servidor selecionado
    return mappings.every((m) => {
      const st = state[m.tipo_assinante];
      if (!m.obrigatorio) {
        return true; // opcionais não invalidam
      }
      return st?.enabled && !!st?.assinante;
    });
  }, [mappings, state]);

  useEffect(() => {
    onChange?.(state, isValid);
  }, [state, isValid, onChange]);

  const toggleOptional = (role: TipoAssinante, checked: boolean) => {
    setState((prev) => ({
      ...prev,
      [role]: { ...prev[role], enabled: checked, assinante: checked ? prev[role].assinante : null },
    }));
  };

  const openDialog = (role: TipoAssinante) => setDialogRole(role);
  const closeDialog = () => setDialogRole(null);
  
  const handleSelectAssinante = (role: TipoAssinante, assinante: AssinanteItem | null) => {
    setState((prev) => ({
      ...prev,
      [role]: { ...prev[role], assinante: assinante || null, enabled: prev[role].enabled || !!assinante },
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assinaturas</CardTitle>
          {loading && <Badge variant="secondary">Carregando...</Badge>}
          {!loading && error && <Badge variant="destructive">{error}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mappings.map((m) => {
            const role = m.tipo_assinante;
            const st = state[role];
            const cargo = cargoLabels[role];
            const enabled = m.obrigatorio ? true : st?.enabled;
            const hasSelected = !!st?.assinante;
            const showError = m.obrigatorio && enabled && !hasSelected;

            return (
              <div key={m.id} className={`border rounded-md p-3 flex flex-col gap-2 ${showError ? 'border-red-500' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={m.obrigatorio ? 'default' : 'secondary'}>
                      {m.obrigatorio ? 'Obrigatório' : 'Opcional'}
                    </Badge>
                    <span className="text-sm text-gray-700">{cargo}</span>
                  </div>
                  {!m.obrigatorio && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Habilitar</span>
                      <Switch checked={!!enabled} onCheckedChange={(v) => toggleOptional(role, v)} />
                    </div>
                  )}
                </div>

                {enabled ? (
                  <div className="space-y-2">
                    {/* Lista de assinantes por tipo (nome + CPF) com seleção por rádio */}
                    <div className="space-y-2">
                      {Array.isArray(m.assinantes) && m.assinantes.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {m.assinantes.map((a) => {
                            const checked = st?.assinante?.id === a.id;
                            return (
                              <label key={`${m.id}-${a.id}`} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`assinante-${role}`}
                                    checked={checked}
                                    onChange={() => handleSelectAssinante(role, { id: a.id, nome: a.nome, cpf: a.cpf })}
                                  />
                                  <div>
                                    <div className="font-semibold tracking-wide">{toUpper(a.nome)}</div>
                                    <div className="text-xs text-gray-600">CPF: {a.cpf}</div>
                                  </div>
                                </div>
                                {checked && (
                                  <Button type="button" variant="ghost" onClick={() => handleSelectAssinante(role, null)}>
                                    Remover
                                  </Button>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Nenhum assinante disponível para este cargo.</div>
                      )}
                    </div>

                    {showError && (
                      <div className="text-xs text-red-600">Assinatura obrigatória sem assinante selecionado.</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Assinatura desabilitada.</div>
                )}
              </div>
            );
          })}
          {mappings.length === 0 && !loading && !error && (
            <div className="text-sm text-gray-600">Nenhum cargo de assinatura configurado para este tipo.</div>
          )}
        </div>
      </CardContent>

    </Card>
  );
};

export default AssinaturasSection;
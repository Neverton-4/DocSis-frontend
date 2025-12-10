import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tipoDocumentoService, TiposDocumentosAssinantesDetalhado, TipoAssinante } from '@/services/tipoDocumentoService';
import api from '@/config/api';

export interface AssinanteItem { id: number; nome: string; cpf: string; cargo_assinante?: string | null }

export type DocumentTypeKey = 'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros';

interface AssinaturaStateItem {
  enabled: boolean;
  assinante?: AssinanteItem | null;
}

export type AssinaturasState = Record<TipoAssinante, AssinaturaStateItem>;

interface AssinaturasModalProps {
  open: boolean;
  documentTypeKey: DocumentTypeKey;
  initialState?: AssinaturasState | null;
  onOpenChange: (open: boolean) => void;
  onSave: (state: AssinaturasState, isValid: boolean) => void;
}

const cargoLabels: Record<TipoAssinante, string> = {
  prefeito: 'Prefeito Municipal',
  secretario: 'Secretário Municipal',
  procurador: 'Procurador Municipal',
  controlador: 'Controlador Interno',
};

const toUpper = (s?: string) => (s || '').toLocaleUpperCase('pt-BR');

export const AssinaturasModal: React.FC<AssinaturasModalProps> = ({ open, documentTypeKey, initialState, onOpenChange, onSave }) => {
  const [mappings, setMappings] = useState<TiposDocumentosAssinantesDetalhado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AssinaturasState>(() => ({
    prefeito: { enabled: false, assinante: null },
    secretario: { enabled: false, assinante: null },
    procurador: { enabled: false, assinante: null },
    controlador: { enabled: false, assinante: null },
  }));

  // Lazy loading ao abrir
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await tipoDocumentoService.listarAssinantesPorTipo(documentTypeKey);
        if (cancelled) return;
        setMappings(data);
        setState((prev) => {
          const base: AssinaturasState = initialState ? { ...prev, ...initialState } : { ...prev };
          for (const m of data) {
            const current = base[m.tipo_assinante] || { enabled: false, assinante: null };
            const enabled = m.obrigatorio ? true : true;
            let selected = current.assinante || null;
            if (!selected && Array.isArray(m.assinantes) && m.assinantes.length > 0) {
              selected = { id: m.assinantes[0].id, nome: m.assinantes[0].nome, cpf: m.assinantes[0].cpf, cargo_assinante: (m.assinantes[0] as any).cargo_assinante };
            }
            base[m.tipo_assinante] = { enabled, assinante: selected };
          }
          return base;
        });
      } catch (e: any) {
        if (cancelled) return;
        try {
          const authMe = await api.get('/auth/me');
          const usuarioAssinantes = Array.isArray(authMe.data?.usuario_assinantes) ? authMe.data.usuario_assinantes : [];
          const tipoKey = documentTypeKey;
          const agrupado: Record<string, { obrigatorio: boolean; assinantes: { id: number; nome: string; cpf: string }[]; ordem_assinatura: number } > = {};
          for (const ua of usuarioAssinantes) {
            const docs = Array.isArray(ua.documentos) ? ua.documentos : [];
            if (docs.includes(tipoKey)) {
              const tipo = (ua.assinante_tipo || ua.tipo || '').toLowerCase();
              if (!agrupado[tipo]) {
                agrupado[tipo] = { obrigatorio: true, assinantes: [], ordem_assinatura: 1 };
              }
              agrupado[tipo].assinantes.push({ id: ua.assinante_id || ua.id, nome: ua.assinante_nome || ua.nome, cpf: ua.assinante_cpf || ua.cpf || '' });
            }
          }
          const dataFallback: TiposDocumentosAssinantesDetalhado[] = Object.entries(agrupado).map(([tipo, info], idx) => ({
            id: idx + 1,
            tipo_documento_id: 0,
            tipo_assinante: tipo as TipoAssinante,
            obrigatorio: info.obrigatorio,
            ordem_assinatura: info.ordem_assinatura,
            assinantes: info.assinantes,
          }));
          setMappings(dataFallback);
          setState((prev) => {
            const base: AssinaturasState = initialState ? { ...prev, ...initialState } : { ...prev };
            for (const m of dataFallback) {
              const current = base[m.tipo_assinante] || { enabled: false, assinante: null };
              const enabled = m.obrigatorio ? true : true;
              let selected = current.assinante || null;
              if (!selected && Array.isArray(m.assinantes) && m.assinantes.length > 0) {
                selected = { id: m.assinantes[0].id, nome: m.assinantes[0].nome, cpf: m.assinantes[0].cpf, cargo_assinante: (m.assinantes[0] as any).cargo_assinante };
              }
              base[m.tipo_assinante] = { enabled, assinante: selected };
            }
            return base;
          });
          setError(null);
        } catch (err2: any) {
          setError(e?.message || err2?.message || 'Erro ao carregar assinaturas');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, documentTypeKey, initialState]);

  const isValid = useMemo(() => {
    return mappings.every((m) => {
      const st = state[m.tipo_assinante];
      if (!m.obrigatorio) return true;
      return st?.enabled && !!st?.assinante;
    });
  }, [mappings, state]);

  const toggleOptional = (role: TipoAssinante, checked: boolean) => {
    setState((prev) => ({
      ...prev,
      [role]: { ...prev[role], enabled: checked },
    }));
  };

  const handleSelectAssinante = (role: TipoAssinante, assinante: AssinanteItem | null) => {
    setState((prev) => ({
      ...prev,
      [role]: { ...prev[role], assinante: assinante || null, enabled: prev[role].enabled || !!assinante },
    }));
  };

  const handleClose = () => onOpenChange(false);
  const handleSave = () => {
    onSave(state, isValid);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Diálogo de Assinaturas" className="sm:max-w-5xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Assinaturas</DialogTitle>
          <DialogDescription>
            Configure as assinaturas do documento. Assinaturas obrigatórias são destacadas.
          </DialogDescription>
        </DialogHeader>

        {/* Estado de carregamento/erro */}
        <div className="flex items-center gap-2 mb-4" aria-live="polite">
          {loading && <Badge variant="secondary">Carregando...</Badge>}
          {!loading && error && <Badge variant="destructive">{error}</Badge>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mappings.map((m) => {
            const role = m.tipo_assinante;
            const st = state[role];
            const cargo = cargoLabels[role];
            const enabled = m.obrigatorio ? true : st?.enabled;
            const hasSelected = !!st?.assinante;
            const showError = m.obrigatorio && enabled && !hasSelected;

            const multipleOptions = Array.isArray(m.assinantes) && m.assinantes.length > 1;
            const singleOption = Array.isArray(m.assinantes) && m.assinantes.length === 1 ? m.assinantes[0] : null;

            return (
              <div key={m.id} className={`border rounded-lg p-4 flex flex-col gap-3 bg-white ${showError ? 'border-red-500' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{m.obrigatorio ? 'Obrigatório' : 'Opcional'}</span>
                  </div>
                  {!m.obrigatorio && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Habilitar</span>
                      <input aria-label={`Habilitar ${cargo}`} type="checkbox" checked={!!enabled} onChange={(e) => toggleOptional(role, e.target.checked)} />
                    </div>
                  )}
                </div>

                <div className="text-sm font-semibold">{toUpper(role)}</div>

                {enabled ? (
                  <div className="space-y-3">
                    {hasSelected && st?.assinante && (
                      <div className="text-sm font-semibold tracking-wide">{toUpper(st.assinante.nome)}</div>
                    )}
                    {st?.assinante?.cargo_assinante && (
                      <div className="text-sm">{st.assinante.cargo_assinante}</div>
                    )}
                    {multipleOptions && (
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
                                  onChange={() => handleSelectAssinante(role, { id: a.id, nome: a.nome, cpf: a.cpf, cargo_assinante: a.cargo_assinante })}
                                />
                                <div className="font-semibold tracking-wide">{toUpper(a.nome)}</div>
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
                    )}

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

        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose} aria-label="Cancelar alterações de assinaturas">Cancelar</Button>
            <Button type="button" onClick={handleSave} aria-label="Salvar assinaturas" disabled={loading || !!error}>Salvar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssinaturasModal;
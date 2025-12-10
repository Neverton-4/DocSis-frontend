import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileSignature, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TELAS } from '@/constants/telas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { documentoService as portariaService } from '@/services/documentoPortariaService';
import { decretoService } from '@/services/documentoDecretoService';
import { diariaService } from '@/services/diariaService';

interface SignatureButtonsProps {
  doc: any;
  activeTab: string;
  isSignatureCompleted: (portariaId: number, tipoAssinatura: string) => boolean;
  onViewDocument: (doc: any) => void;
  onSignDocument: (doc: any, tipoAssinatura?: string) => void;
  isSigningDocument: boolean;
  refreshData?: () => Promise<void>;
}

export const SignatureButtons: React.FC<SignatureButtonsProps> = ({
  doc,
  activeTab,
  isSignatureCompleted,
  onViewDocument,
  onSignDocument,
  isSigningDocument,
  refreshData
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função para capitalizar a primeira letra
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Função para verificar se a assinatura está completa usando o campo assinaturas_status da API
  const isSignatureCompletedByStatus = (tipoAssinatura: string): boolean => {
    if (!doc.assinaturasStatus) return false;
    
    const tipoNormalizado = tipoAssinatura.toLowerCase();
    return doc.assinaturasStatus[tipoNormalizado] === 'assinada';
  };

  const [isSelectSignerDialogOpen, setIsSelectSignerDialogOpen] = useState(false);
  const [signatureOptions, setSignatureOptions] = useState<{
    tipoLabel: string;
    tipoKey: 'prefeito' | 'secretario' | string;
    nome: string;
    cargo: string | null;
  }[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const getDocType = useMemo(() => {
    const t = String(doc?.type || doc?.originalData?.tipo_documento || '').toLowerCase();
    if (t === 'portaria') return 'portarias';
    if (t === 'decreto') return 'decretos';
    if (t === 'diaria') return 'diarias';
    return t || 'portarias';
  }, [doc]);

  const assinaturasStatus = useMemo(() => {
    const s = doc?.assinaturasStatus || doc?.originalData?.assinaturas_status || {};
    return s || {};
  }, [doc]);

  const pendingTypes = useMemo(() => {
    const keys = Object.keys(assinaturasStatus || {});
    return keys.filter((k) => String(assinaturasStatus[k]).toLowerCase() === 'pendente');
  }, [assinaturasStatus]);

  const allowedSignerOptions = useMemo(() => {
    const lista = Array.isArray(user?.usuario_assinantes) ? user!.usuario_assinantes : [];
    const tipoDoc = getDocType;
    const opts = lista
      .filter((ua: any) => Array.isArray(ua.documentos) && ua.documentos.map((d: any) => String(d).toLowerCase()).includes(tipoDoc))
      .filter((ua: any) => pendingTypes.includes(String(ua.assinante_tipo).toLowerCase()))
      .map((ua: any) => {
        const key = String(ua.assinante_tipo).toLowerCase();
        const label = key === 'prefeito' ? 'Prefeito' : key === 'secretario' ? 'Secretário' : ua.assinante_tipo;
        return {
          tipoLabel: label,
          tipoKey: key as any,
          nome: ua.assinante_nome,
          cargo: ua.assinante_cargo_nome || null,
        };
      });
    const seen = new Set<string>();
    const uniq = opts.filter(o => {
      const id = `${o.tipoKey}-${o.nome}-${o.cargo}-${tipoDoc}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return uniq.slice(0, 2);
  }, [user, getDocType, pendingTypes]);

  const handleClickAssinar = () => {
    if (!allowedSignerOptions || allowedSignerOptions.length === 0) {
      toast({ title: 'Sem opções de assinatura', description: 'Não há assinaturas pendentes compatíveis com seus perfis.', variant: 'default' });
      return;
    }
    setSignatureOptions(allowedSignerOptions);
    setSelectedOptionIndex(0);
    setIsSelectSignerDialogOpen(true);
  };

  const handleCancel = async () => {
    if (!doc?.id) return;
    setIsCancelling(true);
    try {
      let message = 'Documento cancelado com sucesso';
      if (activeTab === 'portarias') {
        await portariaService.update(doc.id, { status: 'cancelado' });
      } else if (activeTab === 'decretos') {
        await decretoService.update(doc.id, { status: 'cancelado' });
      } else if (activeTab === 'diarias') {
        await diariaService.updateStatus(doc.id, 'cancelado');
      }
      
      toast({ title: 'Cancelado', description: message, variant: 'default' });
      setCancelDialogOpen(false);
      
      // Atualizar dados automaticamente se a função estiver disponível
      if (refreshData) {
        await refreshData();
      } else {
        // Fallback para navegação se refreshData não estiver disponível
        navigate('/signatures');
      }
    } catch (err: any) {
      const docType = activeTab === 'portarias' ? 'portaria' : activeTab === 'decretos' ? 'decreto' : 'diária';
      toast({ title: 'Erro', description: err?.message || `Falha ao cancelar ${docType}.`, variant: 'destructive' });
    } finally {
      setIsCancelling(false);
    }
  };

  const renderSignatureButtons = () => {
    return (
      <>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleClickAssinar}
          disabled={isSigningDocument}
        >
          <FileSignature className="w-4 h-4 mr-1" />
          {isSigningDocument ? 'Assinando...' : 'Assinar'}
        </Button>

        <Dialog open={isSelectSignerDialogOpen} onOpenChange={setIsSelectSignerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecione a assinatura</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {signatureOptions.length === 1 ? (
                <p className="text-sm text-gray-700">Deseja realmente assinar como {signatureOptions[0]?.tipoLabel}?</p>
              ) : (
                <p className="text-sm text-gray-700">Selecione como deseja assinar este documento.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {signatureOptions.map((opt, idx) => {
                  const selected = idx === selectedOptionIndex;
                  return (
                    <div
                      key={`${opt.tipoKey}-${idx}`}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`border rounded-lg p-4 cursor-pointer transition ${selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold">{opt.tipoLabel}</div>
                        {selected && <span className="text-xs text-blue-600">Selecionado</span>}
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-900">{opt.nome}</div>
                        {opt.cargo && <div className="text-gray-600">{opt.cargo}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 text-white"
                  onClick={() => {
                    const opt = signatureOptions[selectedOptionIndex];
                    if (!opt) return;
                    onSignDocument(doc, opt.tipoLabel);
                    setIsSelectSignerDialogOpen(false);
                  }}
                >
                  Assinar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsSelectSignerDialogOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={() => setCancelDialogOpen(true)}
        disabled={!doc?.id}
      >
        <XCircle className="w-4 h-4 mr-1" />
        Cancelar
      </Button>
      <Button size="sm" variant="outline" onClick={() => onViewDocument(doc)}>
        <Eye className="w-4 h-4 mr-1" />
        Visualizar
      </Button>
      {renderSignatureButtons()}

      {/* Modal de confirmação de cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja realmente cancelar este documento?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>Voltar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
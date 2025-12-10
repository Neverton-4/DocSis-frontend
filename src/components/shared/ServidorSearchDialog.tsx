import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import api from '@/config/api';

interface ServidorItem {
  id: number | string;
  nome_completo: string;
  cpf: string;
}

interface ServidorSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (servidor: ServidorItem) => void;
}

const formatCPF = (cpf: string) => {
  const clean = (cpf || '').replace(/\D/g, '');
  if (clean.length !== 11) return cpf || '';
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const ServidorSearchDialog: React.FC<ServidorSearchDialogProps> = ({ open, onOpenChange, onSelect }) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [items, setItems] = useState<ServidorItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: Record<string, any> = { skip: (page - 1) * pageSize, limit: pageSize };
    if (nome && nome.trim().length > 0) p.nome = nome.trim();
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length === 11) p.cpf = cleanCpf;
    return p;
  }, [nome, cpf, page, pageSize]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/servidores', { params });
      setItems(resp.data || []);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar servidores');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce de filtros
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome, cpf, open]);

  // Carregar ao abrir e quando paginação muda
  useEffect(() => {
    if (open) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, open]);

  const handleCpfChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const masked = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    setCpf(masked);
  };

  const handleSelect = (item: ServidorItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Buscar Servidor
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[70%_30%] gap-3 mt-2 items-end w-full">
          <div className="space-y-2 w-full">
            <label className="text-sm text-gray-700">Nome</label>
            <Input className="w-full" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Digite o nome do servidor" />
          </div>
          <div className="space-y-2 w-full">
            <label className="text-sm text-gray-700">CPF</label>
            <Input className="w-full" value={cpf} onChange={(e) => handleCpfChange(e.target.value)} placeholder="Digite o CPF" maxLength={14} />
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...
            </div>
          ) : error ? (
            <div className="py-4 text-red-600">
              {error}
              <div className="mt-2">
                <Button variant="outline" onClick={load}>Tentar novamente</Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto divide-y" style={{ scrollBehavior: 'smooth' }}>
                {items.map((item) => (
                  <button
                    key={String(item.id)}
                    type="button"
                    className="w-full text-left p-2 hover:bg-gray-50"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="text-sm text-gray-900">
                      {item.nome_completo} - {formatCPF(item.cpf)}
                    </div>
                  </button>
                ))}
                {items.length === 0 && (
                  <div className="p-4 text-sm text-gray-600">Nenhum servidor encontrado.</div>
                )}
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50">
                <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                <div className="text-sm text-gray-700">Página {page}</div>
                <Button variant="ghost" disabled={items.length < pageSize} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServidorSearchDialog;
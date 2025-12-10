import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  RefreshCw, 
  FileText, 
  Gavel, 
  Car,
  Scale,
  Megaphone,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Portaria } from '@/types';
import { DocumentTable, DocumentUploadDialog } from '.';
import { tipoDocumentoService, TiposDocumentosAssinantes, TiposDocumentosAssinantesDetalhado, AssinanteMinimo, TipoAssinante, TipoDocumento } from '@/services/tipoDocumentoService';
import { PermissionService } from '@/lib/PermissionService';

interface DocumentTabsProps {
  activeTab: 'portarias' | 'decretos' | 'diarias' | 'leis' | 'editais' | 'outros';
  onTabChange: (value: string) => void;
  filteredPortarias: Portaria[];
  currentPortarias: Portaria[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onRefetch: () => void;
  
  // Upload dialog props
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
  documentType: string;
  setDocumentType: (type: string) => void;
  serverName: string;
  setServerName: (name: string) => void;
  documentNumber: string;
  setDocumentNumber: (number: string) => void;
  documentDate: string;
  setDocumentDate: (date: string) => void;
  onSubmitDocument: () => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  activeTab,
  onTabChange,
  filteredPortarias,
  currentPortarias,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefetch,
  isDialogOpen,
  setIsDialogOpen,
  documentFile,
  setDocumentFile,
  documentType,
  setDocumentType,
  serverName,
  setServerName,
  documentNumber,
  setDocumentNumber,
  documentDate,
  setDocumentDate,
  onSubmitDocument
}) => {
  const navigate = useNavigate();
  
  // Dados mock para outras abas
  const decretos = [];
  const diarias = [];
  const leis = [
    { id: 1, number: '001/2025', server: 'Carlos Ferreira', title: 'Lei Orçamentária Anual', date: '15/01/2025' },
    { id: 2, number: '002/2025', server: 'Lucia Mendes', title: 'Lei de Diretrizes Orçamentárias', date: '18/01/2025' },
    { id: 3, number: '003/2025', server: 'José Pereira', title: 'Lei Municipal de Tributos', date: '22/01/2025' }
  ];
  const editais = [
    { id: 1, number: '001/2025', server: 'Roberto Silva', title: 'Edital de Licitação - Obras Públicas', date: '12/01/2025' },
    { id: 2, number: '002/2025', server: 'Sandra Costa', title: 'Edital de Concurso Público', date: '16/01/2025' },
    { id: 3, number: '003/2025', server: 'Márcio Oliveira', title: 'Edital de Pregão Eletrônico', date: '19/01/2025' }
  ];
  const outros = [
    { id: 1, number: '001/2025', server: 'Fernando Alves', title: 'Protocolo de Intenções', date: '10/01/2025' },
    { id: 2, number: '002/2025', server: 'Patricia Lima', title: 'Termo de Cooperação', date: '14/01/2025' },
    { id: 3, number: '003/2025', server: 'Ricardo Santos', title: 'Acordo de Cooperação Técnica', date: '17/01/2025' },
    { id: 4, number: '004/2025', server: 'Carla Rodrigues', title: 'Termo de Parceria', date: '21/01/2025' }
  ];

  const tabConfigs = useMemo(() => ([
    { key: 'portarias', label: 'Portarias', icon: FileText, count: filteredPortarias.length, codes: ['portaria.visualizar', 'portarias.visualizar'] },
    { key: 'decretos', label: 'Decretos', icon: Gavel, count: decretos.length, codes: ['decreto.visualizar', 'decretos.visualizar'] },
    { key: 'diarias', label: 'Diárias', icon: Car, count: diarias.length, codes: ['diaria.visualizar', 'diarias.visualizar'] },
    { key: 'leis', label: 'Leis', icon: Scale, count: leis.length, codes: ['lei.visualizar', 'leis.visualizar'] },
    { key: 'editais', label: 'Editais', icon: Megaphone, count: editais.length, codes: ['edital.visualizar', 'editais.visualizar'] },
    { key: 'outros', label: 'Outros', icon: FolderOpen, count: outros.length, codes: ['documento.visualizar', 'outros.visualizar'] },
  ]), [filteredPortarias.length, decretos.length, diarias.length, leis.length, editais.length, outros.length]);

  const [tiposDisponiveis, setTiposDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    tipoDocumentoService.listarTiposDocumentos().then((lista: TipoDocumento[]) => {
      if (!mounted) return;
      const nomes = Array.isArray(lista) ? lista.map((t) => t.nome).filter((n) => typeof n === 'string') : [];
      setTiposDisponiveis(nomes);
      const permissoesAtivas = tabConfigs.flatMap((cfg) => cfg.codes.filter((code) => PermissionService.has(code)));
      console.debug('[DocTabs] tipos_documentos:', nomes);
      console.debug('[DocTabs] permissoes_ativas:', permissoesAtivas);
    }).catch(() => {
      if (!mounted) return;
      setTiposDisponiveis([]);
    });
    return () => { mounted = false };
  }, [tabConfigs]);

  const allowedTabs = useMemo(() => {
    return tabConfigs.filter((cfg) => {
      const hasPerm = cfg.codes.some((code) => PermissionService.has(code));
      const existsTipo = tiposDisponiveis.includes(cfg.label);
      const ok = hasPerm && existsTipo;
      if (!ok) {
        console.debug('[DocTabs] filtro_tab', { label: cfg.label, hasPerm, existsTipo });
      }
      return ok;
    });
  }, [tabConfigs, tiposDisponiveis]);

  useEffect(() => {
    const keys = allowedTabs.map(t => t.key);
    if (keys.length === 0) return;
    if (!keys.includes(activeTab)) {
      onTabChange(keys[0]);
    }
  }, [allowedTabs, activeTab, onTabChange]);

  const getButtonName = (type: string) => {
    const typeNames = {
      'portarias': 'Nova Portaria',
      'decretos': 'Novo Decreto',
      'diarias': 'Nova Diária',
      'leis': 'Nova Lei',
      'editais': 'Novo Edital',
      'outros': 'Novo Documento'
    };
    return typeNames[type] || 'Novo Documento';
  };

  const getSingularName = (type: string) => {
    const typeNames = {
      'portarias': 'Portaria',
      'decretos': 'Decreto',
      'diarias': 'Diária',
      'leis': 'Lei',
      'editais': 'Edital',
      'outros': 'Documento'
    };
    return typeNames[type] || 'Documento';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {allowedTabs.length === 0 && (
          <div className="text-sm text-gray-600">Nenhuma aba disponível para seu perfil.</div>
        )}
        {allowedTabs.map(({ key, label, icon: Icon, count }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <Badge variant="secondary" className="ml-1 bg-white text-blue-600">{count}</Badge>
            </button>
          );
        })}
      </div>

      {activeTab === 'portarias' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Portarias</h2>
            <div className="flex gap-2">
              <DocumentUploadDialog
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                documentFile={documentFile}
                setDocumentFile={setDocumentFile}
                documentType={documentType}
                setDocumentType={setDocumentType}
                serverName={serverName}
                setServerName={setServerName}
                documentNumber={documentNumber}
                setDocumentNumber={setDocumentNumber}
                documentDate={documentDate}
                setDocumentDate={setDocumentDate}
                onSubmit={onSubmitDocument}
                getSingularName={getSingularName}
              />
              
              <Button 
                onClick={() => navigate('/create-document')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {getButtonName('portarias')}
              </Button>
              
              <Button 
                onClick={onRefetch}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
          <DocumentTable 
            portarias={currentPortarias}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onRefetch={onRefetch}
          />
        </div>
      )}
      
      {activeTab === 'decretos' && (
        <DecretosAssinantesSection />
      )}
      
      {activeTab === 'diarias' && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Diárias</h2>
          <div className="text-sm text-gray-500">Em desenvolvimento...</div>
        </div>
      )}
      
      {activeTab === 'leis' && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leis</h2>
          <div className="text-sm text-gray-500">Em desenvolvimento...</div>
        </div>
      )}
      
      {activeTab === 'editais' && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Editais</h2>
          <div className="text-sm text-gray-500">Em desenvolvimento...</div>
        </div>
      )}
      
      {activeTab === 'outros' && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Outros Documentos</h2>
          <div className="text-sm text-gray-500">Em desenvolvimento...</div>
        </div>
      )}
    </div>
  );
};

// Seção de assinantes permitidos para Decretos
const DecretosAssinantesSection: React.FC = () => {
  const [tipos, setTipos] = useState<TiposDocumentosAssinantesDetalhado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [habilitados, setHabilitados] = useState<Record<TipoAssinante, boolean>>({
    prefeito: true,
    secretario: true,
    procurador: true,
    controlador: true,
  });
  const [selecionados, setSelecionados] = useState<Record<TipoAssinante, number | null>>({
    prefeito: null,
    secretario: null,
    procurador: null,
    controlador: null,
  });

  // Carregar tipos detalhados para Decretos
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tipoDocumentoService.listarAssinantesDetalhado('decretos');
        // Garantir ordenação por ordem_assinatura
        const ordered = [...data].sort((a, b) => (a.ordem_assinatura ?? 1) - (b.ordem_assinatura ?? 1));
        setTipos(ordered);
        // Inicializa habilitados/selecionados conforme obrigatoriedade
        const nextHabilitados = { ...habilitados };
        const nextSelecionados = { ...selecionados };
        ordered.forEach((t) => {
          const tipo = t.tipo_assinante as TipoAssinante;
          nextHabilitados[tipo] = !!t.obrigatorio; // obrigatórios sempre habilitados
          // se há um único assinante e habilitado, pré-seleciona
          if (t.assinantes?.length === 1 && nextHabilitados[tipo]) {
            nextSelecionados[tipo] = t.assinantes[0].id;
          }
        });
        setHabilitados(nextHabilitados);
        setSelecionados(nextSelecionados);
      } catch (e: any) {
        setError(e?.message || 'Erro ao buscar assinantes de Decretos');
        setTipos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCargo = (tipo: TiposDocumentosAssinantes['tipo_assinante']) => {
    const map: Record<string, string> = {
      prefeito: 'Prefeito Municipal',
      secretario: 'Secretário Municipal',
      procurador: 'Procurador Municipal',
      controlador: 'Controlador Interno',
    };
    return map[tipo] || tipo;
  };

  const handleToggle = (tipo: TipoAssinante, obrigatorio: boolean) => {
    if (obrigatorio) return; // obrigatórios não podem ser desativados
    setHabilitados((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
    // Ao desabilitar, limpa a seleção
    setSelecionados((prev) => ({ ...prev, [tipo]: !habilitados[tipo] ? null : prev[tipo] }));
  };

  const handleSelect = (tipo: TipoAssinante, assinanteId: number) => {
    setSelecionados((prev) => ({ ...prev, [tipo]: assinanteId }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Decretos</h2>
        <Badge variant="secondary">Seleção de assinantes por tipo</Badge>
      </div>

      {loading && <div className="p-4 text-sm">Carregando...</div>}
      {!loading && error && <div className="p-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-3">
          {tipos.length === 0 && (
            <div className="p-4 text-sm text-gray-600 bg-white rounded">Nenhum tipo configurado para Decretos.</div>
          )}

          {tipos.map((t) => {
            const tipo = t.tipo_assinante as TipoAssinante;
            const isObrigatorio = !!t.obrigatorio;
            const isHabilitado = !!habilitados[tipo];
            const selectedId = selecionados[tipo];
            const hasMultiple = (t.assinantes?.length || 0) > 1;
            return (
              <div key={t.id} className="bg-white rounded-lg shadow-sm border">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCargo(tipo)}</span>
                    <Badge variant={isObrigatorio ? 'default' : 'outline'}>{isObrigatorio ? 'Obrigatório' : 'Opcional'}</Badge>
                    <Badge variant="secondary">Ordem: {t.ordem_assinatura ?? 1}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isObrigatorio ? true : isHabilitado}
                        disabled={isObrigatorio}
                        onChange={() => handleToggle(tipo, isObrigatorio)}
                      />
                      {isObrigatorio ? 'Sempre habilitado' : 'Habilitar assinatura'}
                    </label>
                  </div>
                </div>
                <div className={`px-4 py-3 ${!isHabilitado && !isObrigatorio ? 'opacity-50 pointer-events-none' : ''}`}>
                  {t.assinantes.length === 0 && (
                    <div className="text-sm text-gray-600">Nenhum assinante cadastrado para este tipo.</div>
                  )}
                  {t.assinantes.length === 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{t.assinantes[0].nome}</span>
                        <span className="text-gray-600 ml-2">CPF: {t.assinantes[0].cpf}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/api/assinantes/${t.assinantes[0].id}/pdf`, '_blank')}>PDF</Button>
                        <Badge variant="secondary">Selecionado automaticamente</Badge>
                      </div>
                    </div>
                  )}
                  {hasMultiple && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700">Múltiplas opções disponíveis — selecione apenas uma:</div>
                      <div className="space-y-2">
                        {t.assinantes.map((a) => (
                          <label key={a.id} className="flex items-center justify-between gap-3 p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`sel-${tipo}`}
                                checked={selectedId === a.id}
                                onChange={() => handleSelect(tipo, a.id)}
                              />
                              <span className="font-medium text-sm">{a.nome}</span>
                              <span className="text-xs text-gray-600">CPF: {a.cpf}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.open(`/api/assinantes/${a.id}/pdf`, '_blank')}>PDF</Button>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
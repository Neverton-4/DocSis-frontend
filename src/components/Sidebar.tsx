import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  Home, 
  LogOut, 
  Settings, 
  Users, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  UserCheck,
  FolderOpen,
  Send,
  Eye,
  BookOpen,
  Shield,
  // Adicionar novos ícones
  Plus,
  FileSignature,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active?: boolean;
  minimized?: boolean;
  isSubItem?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, href, active, minimized, isSubItem }) => {
  return (
    <Link
      to={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
        minimized ? 'justify-center' : '',
        isSubItem ? 'ml-6 text-sm' : ''
      )}
    >
      <Icon className={cn('h-5 w-5', isSubItem ? 'h-4 w-4' : '')} />
      {!minimized && <span>{label}</span>}
    </Link>
  );
};

interface SidebarGroupProps {
  icon: React.ComponentType<any>;
  label: string;
  children: React.ReactNode;
  minimized: boolean;
  defaultExpanded?: boolean;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({ icon: Icon, label, children, minimized, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (minimized) {
    return (
      <div className="space-y-1">
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  activePath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePath }) => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className={cn(
      "bg-sidebar h-screen flex flex-col transition-all duration-300",
      minimized ? "w-16" : "w-60"
    )}>
      <div className="p-4 border-b border-sidebar-border relative">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          {!minimized && <span className="font-bold text-lg">COINSPACE</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMinimized(!minimized)}
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-sidebar-accent/50"
        >
          {minimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 p-3 space-y-3 overflow-auto">
        {/* Grupo Protocolo */}
        <SidebarGroup 
          icon={FileText} 
          label="Protocolo" 
          minimized={minimized}
          defaultExpanded={true}
        >
          <SidebarItem 
            icon={Home} 
            label="Dashboard" 
            href="/" 
            active={activePath === '/'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Tipos de Processos" 
            href="/tipos-processos" 
            active={activePath === '/tipos-processos'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
        </SidebarGroup>

        {/* Grupo Documentos - Atualizado */}
        <SidebarGroup 
          icon={FolderOpen} 
          label="Documentos" 
          minimized={minimized}
          defaultExpanded={false}
        >
          <SidebarItem 
            icon={FileText} 
            label="Criação" 
            href="/documentos/criacao" 
            active={activePath === '/documentos/criacao'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={Plus} 
            label="Criar Documento" 
            href="/documentos/createDocument" 
            active={activePath === '/documentos/createDocument'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={FileSignature} 
            label="Assinaturas" 
            href="/documentos/signatures" 
            active={activePath === '/documentos/signatures'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={Globe} 
            label="Publicações" 
            href="/documentos/publications" 
            active={activePath === '/documentos/publications'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={Send} 
            label="Tramitação" 
            href="/documentos/tramitacao" 
            active={activePath === '/documentos/tramitacao'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={Eye} 
            label="Publicação" 
            href="/documentos/publicacao" 
            active={activePath === '/documentos/publicacao'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
        </SidebarGroup>

        {/* Grupo Cadastro */}
        <SidebarGroup 
          icon={Settings} 
          label="Cadastro" 
          minimized={minimized}
          defaultExpanded={false}
        >
          <SidebarItem 
            icon={Building2} 
            label="Departamentos" 
            href="/departamentos" 
            active={activePath === '/departamentos'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={Shield} 
            label="Secretarias" 
            href="/secretarias" 
            active={activePath === '/secretarias'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={Users} 
            label="Servidores" 
            href="/servidores" 
            active={activePath === '/servidores'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={UserCheck} 
            label="Usuários" 
            href="/usuarios" 
            active={activePath === '/usuarios'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
          <SidebarItem 
            icon={FileText} 
            label="Modelos" 
            href="/modelos" 
            active={activePath === '/modelos'} 
            minimized={minimized}
            isSubItem={!minimized}
          />
        </SidebarGroup>
      </div>
      
      <div className="p-3 border-t border-sidebar-border">
        <SidebarItem 
          icon={LogOut} 
          label="Log Out" 
          href="/logout" 
          minimized={minimized} 
        />
      </div>
    </div>
  );
};

export default Sidebar;

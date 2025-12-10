import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@components/shared';
import { ChevronDown, FileText, Users, Building, UserCheck, ClipboardList, User, Briefcase } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from '@/lib/utils';
import { ProfileDialog } from '@components/shared';
import PermissionGate from '@/components/shared/PermissionGate';
import { TELAS } from '@/constants/telas';
import { PermissionService } from '@/lib/PermissionService';

export interface HeaderProps {
  userName?: string;
  userRole?: string;
  breadcrumb?: string;
}

const Header: React.FC<HeaderProps> = ({ userName, userRole, breadcrumb }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      title: 'Protocolo',
      href: '/protocolo',
      icon: ClipboardList,
      telaId: TELAS.PROTOCOLOS
    },
    {
      title: 'Documentos',
      href: '/documentos',
      icon: FileText,
      telaId: TELAS.DOCUMENTOS
    },
    {
      title: 'Assinaturas',
      href: '/signatures',
      icon: UserCheck,
      telaId: TELAS.ASSINATURAS
    },
    {
      title: 'Publicações',
      href: '/publications',
      icon: FileText
    },
    {
      title: 'Servidor',
      href: '/servidor',
      icon: User
    },
    {
      title: 'Assessorias',
      href: '/assessorias',
      icon: Briefcase,
      telaId: PermissionService.resolveTelaId('assessorias')
    }
  ];

  const cadastrosItems = [
    {
      title: 'Departamentos',
      href: '/cadastros/departamentos',
      description: 'Gerenciar departamentos e órgãos'
    },
    {
      title: 'Secretarias',
      href: '/cadastros/secretarias',
      description: 'Gerenciar secretarias municipais'
    },
    {
      title: 'Servidores',
      href: '/cadastros/servidores',
      description: 'Cadastro de servidores públicos'
    },
    {
      title: 'Usuários',
      href: '/cadastros/usuarios',
      description: 'Gerenciar usuários do sistema'
    },
    {
      title: 'Tipos de Processos',
      href: '/cadastros/tipos-processos',
      description: 'Configurar tipos de processos'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: '#241F59' }}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo - Atualizado para usar dados diretos do usuário */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="hidden sm:flex flex-col text-white">
            <span className="font-bold text-sm leading-tight">
              {user?.secretaria?.abrev || 'Sistema de Protocolos'}
            </span>
            {user?.departamento?.nome && (
              <span className="text-xs text-white/80 leading-tight">
                {user.departamento.nome}
              </span>
            )}
          </div>
        </div>

        {/* Navegação Central */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              if (typeof item.telaId === 'number' && !PermissionService.canAccessScreen(item.telaId)) return null;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 focus:bg-white/20 focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-white",
                      isActivePath(item.href) && "bg-white/30 text-white"
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
            
            {/* Dropdown de Cadastros */}
            <PermissionGate codigo="acesso_tela" telaId={PermissionService.resolveTelaId('registrations')}>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "text-white data-[state=open]:bg-white/20 data-[state=open]:text-white cursor-pointer",
                  isActivePath('/cadastros') && "bg-white/30 text-white"
                )}>
                  <Users className="mr-2 h-4 w-4" />
                  Cadastros
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[500px] gap-2 p-6 md:w-[600px] md:grid-cols-2 lg:w-[700px] bg-white shadow-lg border border-gray-200 rounded-lg">
                    {cadastrosItems.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <button
                            className={cn(
                              "block select-none space-y-2 rounded-lg p-4 leading-none no-underline outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 w-full text-left cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-sm",
                              isActivePath(item.href) && "bg-blue-50 border-blue-200"
                            )}
                            onClick={() => navigate(item.href)}
                          >
                            <div className="text-base font-semibold leading-none text-gray-900 mb-1">{item.title}</div>
                            <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                              {item.description}
                            </p>
                          </button>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </PermissionGate>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Menu Mobile */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <span className="sr-only">Menu</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <PermissionGate codigo="acesso_tela" telaId={item.telaId}>
                    <DropdownMenuItem
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "cursor-pointer text-gray-900 hover:bg-gray-100",
                        isActivePath(item.href) && "bg-gray-100"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </DropdownMenuItem>
                  </PermissionGate>
                );
              })}
              <DropdownMenuSeparator />
              <PermissionGate codigo="acesso_tela" telaId={PermissionService.resolveTelaId('registrations')}>
                <DropdownMenuItem disabled className="text-gray-500">
                  <Users className="mr-2 h-4 w-4" />
                  Cadastros
                </DropdownMenuItem>
                {cadastrosItems.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "pl-6 cursor-pointer text-gray-900 hover:bg-gray-100",
                      isActivePath(item.href) && "bg-gray-100"
                    )}
                  >
                    {item.title}
                  </DropdownMenuItem>
                ))}
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dados do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-8 text-white hover:bg-white/20">
              <div className="flex flex-col items-end">
                <span className="font-medium text-xs">{user?.nome || userName || "Usuário"}</span>
                <span className="text-[10px] text-white/70">{user?.cargo || userRole || "Cargo"}</span>
              </div>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <ProfileDialog>
              <div className="cursor-pointer text-gray-900 hover:bg-gray-100 relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                Meu Perfil
              </div>
            </ProfileDialog>
            <DropdownMenuItem className="cursor-pointer text-gray-900 hover:bg-gray-100">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer hover:bg-red-50"
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
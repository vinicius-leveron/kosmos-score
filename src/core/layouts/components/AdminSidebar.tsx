import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Users,
  FileText,
  Network,
  Map,
  ChevronDown,
  LogOut,
  TrendingUp,
  Kanban,
  Wrench,
} from 'lucide-react';
import { useAuth, useOrganization } from '@/core/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/design-system/primitives/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design-system/primitives/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';
import { cn } from '@/design-system/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

// Dashboard - acesso direto
const dashboardItem: NavItem = {
  title: 'Dashboard',
  href: '/admin',
  icon: LayoutDashboard,
};

// Grupos de navegação
const navigationGroups: NavGroup[] = [
  {
    label: 'Aquisição',
    icon: TrendingUp,
    items: [
      { title: 'KOSMOS Score', href: '/admin/kosmos-score', icon: Target },
      { title: 'Formulários', href: '/admin/toolkit/forms', icon: FileText },
    ],
  },
  {
    label: 'CRM',
    icon: Users,
    items: [
      { title: 'Visão Geral', href: '/admin/crm', icon: LayoutDashboard },
      { title: 'Contatos', href: '/admin/crm/contacts', icon: Users },
      { title: 'Pipeline', href: '/admin/crm/pipeline', icon: Kanban },
    ],
  },
  {
    label: 'Serviços',
    icon: Wrench,
    items: [
      { title: 'Análise de Jornada', href: '/admin/journey', icon: Map },
      { title: 'Stakeholders', href: '/admin/stakeholders', icon: Network },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { currentOrg } = useOrganization();

  const isActive = (href: string) => {
    // Exact match for dashboard pages
    if (href === '/admin' || href === '/admin/crm') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">KOSMOS</span>
            {currentOrg && (
              <span className="text-xs text-muted-foreground">
                {currentOrg.organization_name}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard - Acesso direto */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(dashboardItem.href)}>
                  <Link to={dashboardItem.href}>
                    <dashboardItem.icon className="h-4 w-4" />
                    <span>{dashboardItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupos de navegação */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <Collapsible defaultOpen={group.items.some((item) => isActive(item.href))}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <group.icon className="h-3.5 w-3.5" />
                    {group.label}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)}>
                          <Link to={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{profile?.full_name || profile?.email}</span>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

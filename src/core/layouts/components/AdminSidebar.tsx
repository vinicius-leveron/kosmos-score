import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Network,
  Map,
  ChevronDown,
  LogOut,
  Megaphone,
  Kanban,
  Wrench,
  Building2,
  UserPlus,
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  FolderTree,
  Landmark,
  GitCompareArrows,
  Search,
  Key,
  Webhook,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';

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

// Grupos de navegação (sem Configurações - foi pro footer)
const navigationGroups: NavGroup[] = [
  {
    label: 'Aquisição',
    icon: TrendingUp,
    items: [
      { title: 'Lead Magnets', href: '/admin/lead-magnets', icon: Megaphone },
    ],
  },
  {
    label: 'CRM',
    icon: Users,
    items: [
      { title: 'Dashboard', href: '/admin/crm', icon: BarChart3 },
      { title: 'Contatos', href: '/admin/crm/contacts', icon: Users },
      { title: 'Empresas', href: '/admin/crm/companies', icon: Building2 },
      { title: 'Deals', href: '/admin/crm/deals/board', icon: Target },
      { title: 'Pipeline', href: '/admin/crm/pipeline', icon: Kanban },
    ],
  },
  {
    label: 'Financeiro',
    icon: DollarSign,
    items: [
      { title: 'Dashboard', href: '/admin/financial', icon: BarChart3 },
      { title: 'Contas a Receber', href: '/admin/financial/receivables', icon: ArrowDownLeft },
      { title: 'Contas a Pagar', href: '/admin/financial/payables', icon: ArrowUpRight },
      { title: 'Fluxo de Caixa', href: '/admin/financial/cashflow', icon: TrendingUp },
      { title: 'DRE', href: '/admin/financial/dre', icon: FileText },
      { title: 'Categorias', href: '/admin/financial/categories', icon: FolderTree },
      { title: 'Contas Bancárias', href: '/admin/financial/accounts', icon: Landmark },
      { title: 'Conciliação', href: '/admin/financial/reconciliation', icon: GitCompareArrows },
    ],
  },
  {
    label: 'Serviços',
    icon: Wrench,
    items: [
      { title: 'Benchmarking', href: '/admin/benchmarks', icon: BarChart3 },
      { title: 'Concorrentes', href: '/admin/competitors', icon: Search },
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
    if (href === '/admin') {
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
        <div className="flex items-center gap-2 sm:gap-3 px-2 py-3">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-orange-500 font-bold text-lg">K</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm tracking-wide">
              <span className="text-foreground">K</span>
              <span className="text-orange-500">O</span>
              <span className="text-foreground">SMOS</span>
            </span>
            {currentOrg && (
              <span className="text-xs text-muted-foreground truncate">
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
                <SidebarMenuButton className="w-full min-h-[44px]">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{profile?.full_name || profile?.email}</span>
                  <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings/team" className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Equipe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings/clients" className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Clientes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings/api-keys" className="flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    API Keys
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings/webhooks" className="flex items-center">
                    <Webhook className="h-4 w-4 mr-2" />
                    Webhooks
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
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

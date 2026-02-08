import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/design-system/primitives/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Building2, Plus, Search, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/core/auth';
import { useCompanies } from '../hooks/useCompanies';
import { CompanyCard, CompanyForm, CompanyDetail } from '../components/companies';
import type { CompanyListItem, CompanyStatus } from '../types';

export function CompaniesPage() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanyListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: companiesData, isLoading } = useCompanies({
    organizationId,
    filters: {
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
  });

  const handleSelectCompany = (company: CompanyListItem) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedCompany(null), 300);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Empresas</h1>
                <p className="text-muted-foreground">
                  Gerencie suas contas e oportunidades
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/crm/deals/board">
                  <Target className="h-4 w-4 mr-2" />
                  Deals
                </Link>
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as CompanyStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="partner">Parceiro</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
                <SelectItem value="competitor">Concorrente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : companiesData?.data.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter !== 'all'
                ? 'Tente ajustar os filtros'
                : 'Comece adicionando sua primeira empresa'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {companiesData?.total} empresas encontradas
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companiesData?.data.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onClick={() => handleSelectCompany(company)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Company Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes da Empresa</SheetTitle>
          </SheetHeader>
          {selectedCompany && (
            <CompanyDetail
              companyId={selectedCompany.id}
              onClose={handleCloseDetail}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create Company Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nova Empresa</SheetTitle>
            <SheetDescription>
              Adicione uma nova empresa ao CRM
            </SheetDescription>
          </SheetHeader>
          <CompanyForm
            organizationId={organizationId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

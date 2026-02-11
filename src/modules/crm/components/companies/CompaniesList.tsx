import { useState, memo } from 'react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Avatar, AvatarFallback } from '@/design-system/primitives/avatar';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Building,
  Users,
  Calendar,
  Globe,
  MapPin,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useCompanies } from '../../hooks/useCompanies';
import { useOrganization } from '@/core/auth';
import type { CompanyFilters, CompanySort, Company } from '../../types';

interface CompaniesListProps {
  onSelectCompany: (company: Company) => void;
  className?: string;
}

export const CompaniesList = memo(function CompaniesList({ 
  onSelectCompany,
  className 
}: CompaniesListProps) {
  const { organizationId } = useOrganization();
  const [filters, setFilters] = useState<CompanyFilters>({});
  const [sort] = useState<CompanySort>({
    field: 'created_at',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, error } = useCompanies({
    organizationId: organizationId || undefined,
    filters,
    sort,
    pagination: { page, per_page: perPage },
  });

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeLabel = (size?: string) => {
    const sizeMap: { [key: string]: string } = {
      '1-10': '1-10 funcionários',
      '11-50': '11-50 funcionários',
      '51-200': '51-200 funcionários',
      '201-500': '201-500 funcionários',
      '501-1000': '501-1000 funcionários',
      '1000+': '1000+ funcionários',
    };
    return size ? sizeMap[size] || size : null;
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>Erro ao carregar empresas</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            className="pl-9"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} empresas encontradas
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.data.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Building className="h-12 w-12 opacity-50" />
                <div className="text-center">
                  <p className="font-medium text-lg">Nenhuma empresa encontrada</p>
                  <p className="text-sm mt-1">Tente ajustar sua busca ou adicione uma nova empresa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          data?.data.map((company) => (
            <Card
              key={company.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectCompany(company)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 rounded-lg">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium rounded-lg">
                      {getCompanyInitials(company.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Industry */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg truncate">
                          {company.name}
                        </h3>
                        {company.industry && (
                          <p className="text-sm text-muted-foreground">
                            {company.industry}
                          </p>
                        )}
                      </div>
                      {company.annual_revenue && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(company.annual_revenue)}
                        </Badge>
                      )}
                    </div>

                    {/* Company Info */}
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      {company.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          <span className="truncate">{company.website}</span>
                        </div>
                      )}
                      {company.employee_count && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{getSizeLabel(company.employee_count) || `${company.employee_count} funcionários`}</span>
                        </div>
                      )}
                      {company.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{company.city}{company.state ? `, ${company.state}` : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(company.created_at)}</span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between">
                      {/* Contacts and Deals */}
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {company.contacts_count || 0} contatos
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {company.deals_count || 0} deals
                        </Badge>
                      </div>

                      {/* Status */}
                      {company.status && (
                        <Badge
                          variant={company.status === 'active' ? 'default' : 'secondary'}
                        >
                          {company.status === 'active' ? 'Ativo' : 
                           company.status === 'prospect' ? 'Prospecto' : 
                           company.status === 'churned' ? 'Perdido' : company.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Página {data.page} de {data.total_pages} • {data.total} empresas
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
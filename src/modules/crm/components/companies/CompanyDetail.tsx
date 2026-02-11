import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Separator } from '@/design-system/primitives/separator';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Building2,
  Globe,
  Users,
  Target,
  DollarSign,
  Mail,
  Phone,
  ExternalLink,
  Linkedin,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompanyDetail } from '../../hooks/useCompanies';
import type { ContactRole } from '../../types';

interface CompanyDetailProps {
  companyId: string;
  onClose: () => void;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  prospect: { label: 'Prospect', variant: 'outline' },
  customer: { label: 'Cliente', variant: 'default' },
  churned: { label: 'Churned', variant: 'destructive' },
  partner: { label: 'Parceiro', variant: 'secondary' },
  competitor: { label: 'Concorrente', variant: 'outline' },
};

const sizeLabels: Record<string, string> = {
  solo: 'Solo (1 pessoa)',
  micro: 'Micro (1-10)',
  small: 'Pequena (11-50)',
  medium: 'Média (51-200)',
  large: 'Grande (201-1000)',
  enterprise: 'Enterprise (1000+)',
};

const roleLabels: Record<ContactRole, string> = {
  decision_maker: 'Decisor',
  influencer: 'Influenciador',
  champion: 'Champion',
  blocker: 'Blocker',
  end_user: 'Usuário Final',
  technical: 'Técnico',
  financial: 'Financeiro',
  other: 'Outro',
};

export function CompanyDetail({ companyId, onClose }: CompanyDetailProps) {
  const { data: company, isLoading, error } = useCompanyDetail(companyId);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="py-6 text-center text-red-400">
        Erro ao carregar empresa
      </div>
    );
  }

  const status = statusLabels[company.status] || statusLabels.prospect;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const hasAddress = company.address_city || company.address_state || company.address_country;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 shrink-0">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <Building2 className="h-10 w-10 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold truncate">{company.name}</h2>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {company.domain && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{company.domain}</span>
            </div>
          )}

          {company.industry && (
            <p className="text-sm text-muted-foreground mt-1">{company.industry}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs">Deals Abertos</span>
          </div>
          <p className="text-xl font-semibold">{company.stats.open_deals}</p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Pipeline</span>
          </div>
          <p className="text-xl font-semibold">
            {formatCurrency(company.stats.pipeline_value)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-green-500/10 text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Receita Total</span>
          </div>
          <p className="text-xl font-semibold text-green-600">
            {formatCurrency(company.stats.total_revenue)}
          </p>
        </div>
      </div>

      <Separator />

      {/* Info */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">Informações</h3>

        <div className="space-y-2">
          {company.size && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{sizeLabels[company.size]}</span>
            </div>
          )}

          {company.website && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {company.website}
              </a>
            </div>
          )}

          {company.linkedin_url && (
            <div className="flex items-center gap-2 text-sm">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <a
                href={company.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                LinkedIn
              </a>
            </div>
          )}

          {hasAddress && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {[company.address_city, company.address_state, company.address_country]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Contacts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-muted-foreground">
            Contatos ({company.contacts.length})
          </h3>
        </div>

        {company.contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum contato vinculado</p>
        ) : (
          <div className="space-y-2">
            {company.contacts.map((contact) => (
              <div
                key={contact.contact_company_id}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {contact.full_name || contact.email}
                      </span>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="text-xs">Principal</Badge>
                      )}
                    </div>

                    {contact.title && (
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {contact.role && (
                    <Badge variant="outline">
                      {roleLabels[contact.role] || contact.role}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/admin/crm/deals?company_id=${companyId}`}>
            Ver Deals
          </Link>
        </Button>
        <Button className="flex-1">
          Criar Deal
        </Button>
      </div>
    </div>
  );
}

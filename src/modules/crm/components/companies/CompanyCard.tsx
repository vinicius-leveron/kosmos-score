import { Badge } from '@/design-system/primitives/badge';
import { Building2, Users, Target, DollarSign } from 'lucide-react';
import type { CompanyListItem } from '../../types';

interface CompanyCardProps {
  company: CompanyListItem;
  onClick?: () => void;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  prospect: { label: 'Prospect', variant: 'outline' },
  customer: { label: 'Cliente', variant: 'default' },
  churned: { label: 'Churned', variant: 'destructive' },
  partner: { label: 'Parceiro', variant: 'secondary' },
  competitor: { label: 'Concorrente', variant: 'outline' },
};

const sizeLabels: Record<string, string> = {
  solo: 'Solo',
  micro: '1-10',
  small: '11-50',
  medium: '51-200',
  large: '201-1000',
  enterprise: '1000+',
};

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const status = statusLabels[company.status] || statusLabels.prospect;

  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg bg-card hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <Building2 className="h-6 w-6 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{company.name}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {company.domain && (
            <p className="text-sm text-muted-foreground truncate">{company.domain}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {company.size && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {sizeLabels[company.size] || company.size}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {company.contact_count} contatos
            </span>

            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              {company.open_deals_count} deals abertos
            </span>

            {company.total_deals_value > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <DollarSign className="h-3.5 w-3.5" />
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                }).format(company.total_deals_value)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

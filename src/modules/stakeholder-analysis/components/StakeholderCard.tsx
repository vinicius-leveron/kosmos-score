/**
 * StakeholderCard - Card component for displaying stakeholder info
 */

import { User, Mail, Briefcase, TrendingUp, ExternalLink } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Badge } from '@/design-system/primitives/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/design-system/primitives/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';

import type { Stakeholder } from '../types/stakeholder.types';
import {
  STAKEHOLDER_TYPE_LABELS,
  STAKEHOLDER_TYPE_COLORS,
  STAKEHOLDER_STATUS_COLORS,
} from '../types/stakeholder.types';

// ============================================================================
// PROPS
// ============================================================================

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number | null): string {
  if (value === null) return '-';
  return `${value.toFixed(1)}%`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StakeholderCard({
  stakeholder,
  onClick,
  className,
}: StakeholderCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        'group transition-all duration-200',
        isClickable && 'cursor-pointer hover:border-kosmos-orange/50 hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={stakeholder.avatar_url || undefined} alt={stakeholder.full_name} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {getInitials(stakeholder.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">
                {stakeholder.full_name}
              </h3>
              {stakeholder.linkedin_url && (
                <a
                  href={stakeholder.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-kosmos-orange transition-colors"
                  aria-label="Ver perfil no LinkedIn"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant="outline"
                className={cn('text-xs', STAKEHOLDER_TYPE_COLORS[stakeholder.stakeholder_type])}
              >
                {STAKEHOLDER_TYPE_LABELS[stakeholder.stakeholder_type]}
              </Badge>
              {stakeholder.status !== 'active' && (
                <Badge
                  variant="outline"
                  className={cn('text-xs', STAKEHOLDER_STATUS_COLORS[stakeholder.status])}
                >
                  {stakeholder.status === 'inactive' ? 'Inativo' : 'Saiu'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Contact Info */}
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {stakeholder.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{stakeholder.email}</span>
            </div>
          )}
          {stakeholder.sector && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{stakeholder.sector}</span>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-sm font-semibold text-foreground">
              {stakeholder.contribution_score.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Participacao</p>
            <p className="text-sm font-semibold text-foreground">
              {formatPercentage(stakeholder.participation_pct)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Investimento</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(stakeholder.investment_amount)}
            </p>
          </div>
        </div>

        {/* Expertise Tags */}
        {stakeholder.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {stakeholder.expertise.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {stakeholder.expertise.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{stakeholder.expertise.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

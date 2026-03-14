import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Play,
  MessageSquare,
  Mail,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { CrmKPICard } from './CrmKPICard';
import { useFunnelMetrics, aggregateByStatus } from '../../hooks/outbound';
import { useEmailMetrics, getHealthColor } from '../../hooks/outbound';
import type { OutboundFilters } from '../../types/outbound';

// Default filters for summary view (all tenants, last 30 days)
const defaultFilters: OutboundFilters = {
  tenant: 'all',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  classificacao: [],
  sources: [],
  cadenceStatus: [],
};

export function OutboundSummaryWidget() {
  const { stages, totals, isLoading: funnelLoading } = useFunnelMetrics(defaultFilters);
  const { health, isLoading: emailLoading } = useEmailMetrics(defaultFilters);

  const isLoading = funnelLoading || emailLoading;

  // Aggregate metrics by status
  const statusMetrics = useMemo(() => {
    if (!stages.length) return null;
    return aggregateByStatus(stages);
  }, [stages]);

  // Calculate key metrics
  const totalLeads = totals?.total_leads || 0;
  const inSequence = totals?.in_sequence || 0;
  const replied = totals?.replied || 0;
  const replyRate = totals?.reply_rate || 0;

  // Email health status
  const emailHealthStatus = health?.health_status || 'healthy';
  const emailHealthLabel = {
    healthy: 'Saudavel',
    warning: 'Atencao',
    critical: 'Critico',
  }[emailHealthStatus];

  // Mini funnel data for visualization
  const funnelStages = [
    { label: 'Novos', count: statusMetrics?.new?.count || 0, color: 'bg-blue-500' },
    { label: 'Prontos', count: statusMetrics?.ready?.count || 0, color: 'bg-purple-500' },
    { label: 'Em Sequencia', count: statusMetrics?.in_sequence?.count || 0, color: 'bg-yellow-500' },
    { label: 'Responderam', count: statusMetrics?.replied?.count || 0, color: 'bg-green-500' },
  ];

  const maxCount = Math.max(...funnelStages.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <CrmKPICard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          color="text-blue-400"
          subtitle="no outbound"
          isLoading={isLoading}
        />
        <CrmKPICard
          title="Em Sequencia"
          value={inSequence}
          icon={Play}
          color="text-yellow-400"
          subtitle="recebendo contato"
          isLoading={isLoading}
        />
        <CrmKPICard
          title="Taxa Resposta"
          value={`${replyRate.toFixed(1)}%`}
          icon={MessageSquare}
          color="text-green-400"
          subtitle={`${replied} responderam`}
          isLoading={isLoading}
        />
        <CrmKPICard
          title="Saude Email"
          value={emailHealthLabel}
          icon={Mail}
          color={getHealthColor(emailHealthStatus)}
          subtitle={health ? `${(health.bounce_rate || 0).toFixed(1)}% bounce` : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Mini Funnel */}
      <Card className="bg-kosmos-black-light border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-kosmos-gray flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-kosmos-orange" />
              Funil Outbound
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Ultimos 30 dias
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {funnelStages.map((stage) => (
                <div key={stage.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-kosmos-gray">{stage.label}</span>
                    <span className="text-kosmos-white font-medium">
                      {stage.count.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${stage.color}`}
                      style={{ width: `${(stage.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link to full dashboard */}
      <Button asChild variant="outline" className="w-full">
        <Link to="/admin/crm/outbound" className="flex items-center justify-center gap-2">
          Ver Dashboard Completo
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

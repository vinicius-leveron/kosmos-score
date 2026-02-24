import { Skeleton } from '@/design-system/primitives/skeleton';
import { EmailHealthGauge } from '../charts/EmailHealthGauge';
import { useEmailMetrics } from '../../../hooks/outbound';
import type { OutboundFilters } from '../../../types/outbound';

interface D8EmailDashboardProps {
  filters: OutboundFilters;
}

export function D8EmailDashboard({ filters }: D8EmailDashboardProps) {
  const { daily, health, isLoading, error } = useEmailMetrics(filters);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar métricas de email: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmailHealthGauge health={health} daily={daily} />

      {/* Tips based on health status */}
      {health && (
        <HealthTips status={health.health_status} bounceRate={health.bounce_rate || 0} />
      )}
    </div>
  );
}

interface HealthTipsProps {
  status: 'healthy' | 'warning' | 'critical';
  bounceRate: number;
}

function HealthTips({ status, bounceRate }: HealthTipsProps) {
  if (status === 'healthy') {
    return (
      <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
        <h4 className="font-display font-semibold text-green-400 mb-2">
          Domínio Saudável
        </h4>
        <p className="text-sm text-kosmos-gray">
          Sua taxa de bounce está dentro do limite seguro. Continue monitorando e mantenha
          boas práticas de higiene de lista.
        </p>
      </div>
    );
  }

  if (status === 'warning') {
    return (
      <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
        <h4 className="font-display font-semibold text-yellow-400 mb-2">
          Atenção Necessária
        </h4>
        <div className="text-sm text-kosmos-gray space-y-2">
          <p>
            Sua taxa de bounce ({bounceRate.toFixed(1)}%) está acima de 2%. Recomendações:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Valide os emails antes de enviar</li>
            <li>Remova emails que bouncearam 2+ vezes</li>
            <li>Reduza o volume de envio diário temporariamente</li>
            <li>Verifique se há emails corporativos desativados</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
      <h4 className="font-display font-semibold text-red-400 mb-2">
        Ação Urgente Necessária
      </h4>
      <div className="text-sm text-kosmos-gray space-y-2">
        <p>
          Sua taxa de bounce ({bounceRate.toFixed(1)}%) está crítica (&gt;5%). O domínio pode
          ser penalizado pelos provedores. Ações imediatas:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-red-300">PARE</strong> de enviar emails até resolver
          </li>
          <li>Execute validação completa da lista</li>
          <li>Remova TODOS os emails que bouncearam</li>
          <li>Considere usar domínio de warmup separado</li>
          <li>Entre em contato com o suporte se persistir</li>
        </ul>
      </div>
    </div>
  );
}

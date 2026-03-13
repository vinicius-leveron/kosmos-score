import { cn } from '@/design-system/lib/utils';
import { TrendingUp, Users, Calendar, Zap, Award } from 'lucide-react';
import type { OpportunityItem } from '../../lib/types';

interface OpportunitiesSectionProps {
  opportunities: OpportunityItem[];
  total: string;
}

const TYPE_ICONS: Record<string, typeof TrendingUp> = {
  RECORRENCIA: Users,
  EVENTO: Calendar,
  HIGH_TICKET: TrendingUp,
  ATIVACAO: Zap,
  CERTIFICACAO: Award,
};

const TYPE_COLORS: Record<string, string> = {
  RECORRENCIA: 'text-green-400 border-green-400/20 bg-green-400/5',
  EVENTO: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
  HIGH_TICKET: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
  ATIVACAO: 'text-kosmos-orange border-kosmos-orange/20 bg-kosmos-orange/5',
  CERTIFICACAO: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5',
};

function OpportunityCard({ opportunity }: { opportunity: OpportunityItem }) {
  const Icon = TYPE_ICONS[opportunity.tipo] || Zap;
  const colors = TYPE_COLORS[opportunity.tipo] || TYPE_COLORS.ATIVACAO;
  const [textColor, borderColor, bgColor] = colors.split(' ');

  return (
    <div className={cn('rounded-xl border p-5', borderColor, bgColor)}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', bgColor, 'border', borderColor)}>
          <Icon className={cn('w-5 h-5', textColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-kosmos-white text-sm">{opportunity.titulo}</h4>
          <p className={cn('font-display font-bold text-lg', textColor)}>{opportunity.valor_estimado}</p>
        </div>
      </div>
      <p className="text-kosmos-gray text-xs mb-3">{opportunity.descricao}</p>
      <ul className="space-y-1.5">
        {opportunity.itens.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-kosmos-white/70">
            <div className={cn('w-1 h-1 rounded-full mt-1.5 flex-shrink-0', textColor.replace('text-', 'bg-'))} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OpportunitiesSection({ opportunities, total }: OpportunitiesSectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-kosmos-orange font-display text-xs font-semibold tracking-[0.2em] uppercase">
          03
        </span>
        <div className="w-8 h-px bg-kosmos-orange/40" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-2">
        Oportunidades Mapeadas
      </h2>
      <p className="text-kosmos-gray text-sm mb-6">
        {opportunities.length} oportunidades identificadas · Potencial total: {total}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp, i) => (
          <OpportunityCard key={i} opportunity={opp} />
        ))}
      </div>
    </section>
  );
}

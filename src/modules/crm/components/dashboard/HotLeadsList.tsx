import { Flame, ChevronRight } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import type { HotLead } from '../../hooks/useCrmDashboard';
import { getScoreColor } from '@/modules/kosmos-score/lib/chartConfig';

interface HotLeadsListProps {
  leads: HotLead[];
  limit?: number;
  onLeadClick?: (lead: HotLead) => void;
  onViewAll?: () => void;
}

export function HotLeadsList({
  leads,
  limit = 5,
  onLeadClick,
  onViewAll,
}: HotLeadsListProps) {
  const displayedLeads = leads.slice(0, limit);

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <h3 className="font-semibold">Leads Quentes</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum lead com score acima de 70
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <h3 className="font-semibold">Leads Quentes (&gt;70)</h3>
        </div>
        {leads.length > limit && onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Ver todos
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {displayedLeads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => onLeadClick?.(lead)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">
                {lead.fullName || lead.email}
              </p>
              {lead.fullName && (
                <p className="text-sm text-muted-foreground truncate">
                  {lead.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              {lead.stageName && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${lead.stageColor}20`,
                    color: lead.stageColor || undefined,
                  }}
                >
                  {lead.stageName}
                </span>
              )}
              <span
                className="font-bold text-lg"
                style={{ color: getScoreColor(lead.score) }}
              >
                {lead.score}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

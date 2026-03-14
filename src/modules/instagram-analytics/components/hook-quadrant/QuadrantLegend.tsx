import { QUADRANT_COLORS, QUADRANT_LABELS } from '../../lib/constants';
import type { HookQuadrant } from '../../types';

const quadrants: { key: HookQuadrant; description: string }[] = [
  { key: 'ideal', description: 'Hook e conteudo funcionam bem' },
  { key: 'weak_middle', description: 'Bom gancho, mas perde audiencia no meio/fim' },
  { key: 'weak_hook', description: 'Conteudo bom, mas gancho inicial fraco' },
  { key: 'rethink_all', description: 'Repensar tanto o gancho quanto o conteudo' },
];

export function QuadrantLegend() {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {quadrants.map(q => (
        <div key={q.key} className="flex items-start gap-2 text-xs">
          <div className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: QUADRANT_COLORS[q.key] }} />
          <div>
            <p className="font-medium">{QUADRANT_LABELS[q.key]}</p>
            <p className="text-muted-foreground">{q.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { cn } from '@/design-system/lib/utils';
import type { Prompt4Output } from '../../lib/types';

interface ModelMapSectionProps {
  data: Prompt4Output;
}

const CICLO_LABELS = {
  CICLO_FECHADO: 'Ciclo Fechado',
  CICLO_PARCIAL: 'Ciclo Parcial',
  CICLO_ABERTO: 'Ciclo Aberto',
} as const;

const CLOSED_STEPS = [
  'VOCÊ GRAVA',
  'AUDIÊNCIA VÊ',
  'ALGUNS COMPRAM',
  'FIM',
  '↻ VOLTA PRO INÍCIO',
];

const OPEN_STEPS = [
  'BASE ENTRA',
  'AGE E TEM RESULTADO',
  'SOBE NA ESCADA',
  'COMPRA MAIS',
  'COMPARTILHA',
  'ATRAI NOVOS SOZINHO',
];

function FlowPanel({
  title,
  steps,
  color,
  borderColor,
}: {
  title: string;
  steps: string[];
  color: string;
  borderColor: string;
}) {
  return (
    <div className={cn('rounded-xl border p-6', borderColor, 'bg-[#0c0c0c]')}>
      <h4 className={cn('font-display font-bold text-sm uppercase tracking-wider mb-4', color)}>
        {title}
      </h4>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', color.replace('text-', 'bg-'))} />
            <span className="text-kosmos-white text-sm font-display">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModelMapSection({ data }: ModelMapSectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-kosmos-orange font-display text-xs font-semibold tracking-[0.2em] uppercase">
          01
        </span>
        <div className="w-8 h-px bg-kosmos-orange/40" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-2">
        Mapa do Modelo
      </h2>
      <p className="text-kosmos-gray text-sm mb-6">
        {CICLO_LABELS[data.modelo]} · Dependência: {data.dependencia_score}/100
      </p>

      {/* Two panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FlowPanel
          title="Seu modelo"
          steps={CLOSED_STEPS}
          color="text-red-400"
          borderColor="border-red-400/20"
        />
        <FlowPanel
          title="Modelo certo"
          steps={OPEN_STEPS}
          color="text-green-400"
          borderColor="border-green-400/20"
        />
      </div>

      {/* Risks */}
      <div className="flex flex-wrap gap-2 mb-4">
        {data.riscos.map((risco, i) => (
          <span
            key={i}
            className="text-xs px-3 py-1.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20"
          >
            {risco}
          </span>
        ))}
      </div>

      {/* Final phrase */}
      <p className="text-kosmos-white/90 text-base md:text-lg font-display leading-relaxed border-l-2 border-kosmos-orange pl-4">
        {data.frase_final}
      </p>
    </section>
  );
}

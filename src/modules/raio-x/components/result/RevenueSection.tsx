import { cn } from '@/design-system/lib/utils';
import type { Prompt1Output, Prompt2Output, Prompt3Output } from '../../lib/types';

interface RevenueSectionProps {
  revenue: Prompt1Output;
  transformation: Prompt2Output;
  narrative: Prompt3Output;
}

function BigNumber({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className="text-kosmos-gray text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('font-display text-2xl md:text-3xl font-bold', color)}>{value}</p>
    </div>
  );
}

export function RevenueSection({ revenue, transformation, narrative }: RevenueSectionProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-kosmos-orange font-display text-xs font-semibold tracking-[0.2em] uppercase">
          02
        </span>
        <div className="w-8 h-px bg-kosmos-orange/40" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-6">
        Contraste de Receita
      </h2>

      {/* 3 big numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-structural p-6">
          <BigNumber label="Fatura hoje" value={revenue.fatura_hoje} color="text-kosmos-white" />
        </div>
        <div className="card-structural p-6 border-green-400/20">
          <BigNumber label="Poderia faturar" value={revenue.poderia_faturar} color="text-green-400" />
        </div>
        <div className="card-structural p-6 border-kosmos-orange/20">
          <BigNumber label="Receita travada" value={revenue.receita_travada} color="text-kosmos-orange" />
        </div>
      </div>

      {/* Feature vs Transformation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card-structural p-6">
          <p className="text-kosmos-gray text-xs uppercase tracking-wider mb-2">O que você diz</p>
          <p className="text-kosmos-white/80 text-sm leading-relaxed">{transformation.feature}</p>
        </div>
        <div className="card-structural p-6 border-kosmos-orange/20">
          <p className="text-kosmos-orange text-xs uppercase tracking-wider mb-2">O que seus clientes compram</p>
          <p className="text-kosmos-white text-sm leading-relaxed font-medium">{transformation.transformacao}</p>
        </div>
      </div>

      {/* Causa & Inimigo */}
      {narrative.causa && (
        <div className="card-structural p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-green-400 text-xs uppercase tracking-wider mb-2">Sua causa</p>
              <p className="text-kosmos-white text-sm leading-relaxed">{narrative.causa}</p>
            </div>
            <div>
              <p className="text-red-400 text-xs uppercase tracking-wider mb-2">Seu inimigo</p>
              <p className="text-kosmos-white text-sm leading-relaxed">{narrative.inimigo}</p>
            </div>
          </div>
          {narrative.narrativa && (
            <p className="text-kosmos-gray text-sm mt-4 pt-4 border-t border-border italic">
              "{narrative.narrativa}"
            </p>
          )}
          {narrative.movimento && (
            <p className="text-kosmos-orange font-display font-semibold text-sm mt-3">
              Movimento: {narrative.movimento}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

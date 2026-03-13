import { Button } from '@/design-system/primitives/button';
import { ArrowRight, Clock, Youtube } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import type { RaioXClassification } from '../../lib/types';
import { CLASSIFICATION_LABELS, CLASSIFICATION_COLORS } from '../../lib/scoring';

interface CTASectionProps {
  classification: RaioXClassification;
  total: string;
}

const SCHEDULE_URL = 'https://cal.com/vinicius-kosmos';

export function CTASection({ classification, total }: CTASectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-kosmos-orange font-display text-xs font-semibold tracking-[0.2em] uppercase">
          04
        </span>
        <div className="w-8 h-px bg-kosmos-orange/40" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-6">
        Próximo Passo
      </h2>

      <div className="card-structural p-8 md:p-10 text-center border-kosmos-orange/20">
        {/* Total */}
        <p className="text-kosmos-gray text-xs uppercase tracking-wider mb-2">
          Potencial total identificado
        </p>
        <p className="font-display text-4xl md:text-5xl font-bold text-kosmos-orange mb-6">
          {total}
        </p>

        {/* Classification badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
          style={{
            borderColor: `${CLASSIFICATION_COLORS[classification]}33`,
            backgroundColor: `${CLASSIFICATION_COLORS[classification]}0D`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: CLASSIFICATION_COLORS[classification] }}
          />
          <span
            className="text-sm font-display font-semibold"
            style={{ color: CLASSIFICATION_COLORS[classification] }}
          >
            {CLASSIFICATION_LABELS[classification]}
          </span>
        </div>

        {/* Transition phrase */}
        <p className="text-kosmos-gray text-sm max-w-lg mx-auto mb-8 leading-relaxed">
          Esse foi o diagnóstico automático. O que ele não mostra é como destravar
          — porque isso depende do seu modelo específico, não de uma fórmula genérica.
        </p>

        {/* Conditional CTA */}
        {classification === 'QUALIFICADO' && (
          <div>
            <Button
              size="lg"
              className="h-14 px-8 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white transition-all duration-300"
              onClick={() => window.open(SCHEDULE_URL, '_blank')}
              aria-label="Agendar diagnóstico gratuito"
            >
              AGENDAR DIAGNÓSTICO GRATUITO
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-kosmos-gray text-xs mt-3 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> 30 minutos
              </span>
              <span>·</span>
              <span>100% gratuito</span>
              <span>·</span>
              <span>Resultado completo na call</span>
            </p>
          </div>
        )}

        {classification === 'EM_CONSTRUCAO' && (
          <div>
            <p className="text-kosmos-white text-sm mb-4">
              Seu negócio está em construção. A gente abre rodadas de diagnóstico
              para negócios nesse estágio — deixa seu contato e a gente te avisa.
            </p>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                'h-14 px-8 text-base font-display font-semibold',
                'border-kosmos-orange/40 text-kosmos-orange hover:bg-kosmos-orange/10'
              )}
              onClick={() => window.open(SCHEDULE_URL, '_blank')}
              aria-label="Entrar na lista de espera"
            >
              Entrar na Lista de Espera
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {classification === 'INICIO' && (
          <div>
            <p className="text-kosmos-white text-sm mb-4">
              Preparamos um material gratuito pra você avançar seu negócio
              antes do diagnóstico.
            </p>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                'h-14 px-8 text-base font-display font-semibold',
                'border-kosmos-gray/40 text-kosmos-white hover:bg-kosmos-white/5'
              )}
              onClick={() => window.open('https://youtube.com/@kosmosecossistemas', '_blank')}
              aria-label="Acessar conteúdo gratuito"
            >
              <Youtube className="w-5 h-5 mr-2" />
              Acessar Conteúdo Gratuito
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

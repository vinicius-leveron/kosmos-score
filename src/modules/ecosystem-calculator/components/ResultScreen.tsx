import { Button } from '@/design-system/primitives/button';
import { TrendingUp, ArrowRight, Share2, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { CalculatorInputs, CalculatorOutputs, formatarMoeda } from '../lib/calculatePotential';

interface ResultScreenProps {
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  onShare: () => void;
  onCTA: () => void;
}

export function ResultScreen({ inputs, outputs, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();

  const maxValue = Math.max(inputs.faturamentoAtual, outputs.potencialMensal);
  const atualWidth = (inputs.faturamentoAtual / maxValue) * 100;
  const potencialWidth = (outputs.potencialMensal / maxValue) * 100;

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-12"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-kosmos-orange" />
            <span className="text-kosmos-orange text-sm font-medium">
              Análise Completa
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-kosmos-white mb-2">
            {outputs.narrative.headline}
          </h1>
        </div>

        {/* Main Result Card */}
        <div className="card-structural p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-kosmos-gray text-sm uppercase tracking-wider mb-2">
              Potencial mensal com ecossistema
            </p>
            <div className="text-5xl md:text-6xl font-display font-bold text-kosmos-orange mb-2">
              {formatarMoeda(outputs.potencialMensal)}
            </div>
            <p className="text-kosmos-gray">
              vs. {formatarMoeda(inputs.faturamentoAtual)} atual
            </p>
          </div>

          {/* Comparison Chart */}
          <div className="space-y-4 mb-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-kosmos-gray">Faturamento Atual</span>
                <span className="text-kosmos-white font-medium">
                  {formatarMoeda(inputs.faturamentoAtual)}
                </span>
              </div>
              <div className="h-8 bg-kosmos-black-light rounded-lg overflow-hidden">
                <div
                  className="h-full bg-kosmos-gray/50 rounded-lg transition-all duration-1000"
                  style={{ width: `${atualWidth}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-kosmos-gray">Potencial Ecossistema</span>
                <span className="text-kosmos-orange font-medium">
                  {formatarMoeda(outputs.potencialMensal)}
                </span>
              </div>
              <div className="h-8 bg-kosmos-black-light rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-kosmos-orange to-kosmos-orange-glow rounded-lg transition-all duration-1000 delay-300"
                  style={{ width: `${potencialWidth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gap Highlight */}
          <div className="bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-xl p-6 text-center">
            <p className="text-kosmos-gray text-sm mb-2">
              Você está deixando na mesa
            </p>
            <p className="text-3xl font-display font-bold text-kosmos-orange mb-1">
              {formatarMoeda(outputs.gapAtual)}/mês
            </p>
            <p className="text-kosmos-gray text-sm">
              ou {formatarMoeda(outputs.gapAtual * 12)}/ano
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card-structural p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-kosmos-orange/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-kosmos-orange" />
              </div>
              <div>
                <p className="text-xs text-kosmos-gray uppercase">Eficiência</p>
                <p className="text-lg font-bold text-kosmos-white">
                  +{outputs.aumentoEficiencia}%
                </p>
              </div>
            </div>
            <p className="text-xs text-kosmos-gray">
              De R${outputs.faturamentoPorHoraAtual}/h para R${outputs.faturamentoPorHoraPotencial}/h
            </p>
          </div>

          <div className="card-structural p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-kosmos-orange/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-kosmos-orange" />
              </div>
              <div>
                <p className="text-xs text-kosmos-gray uppercase">Crescimento</p>
                <p className="text-lg font-bold text-kosmos-white">
                  +{outputs.gapPercentual}%
                </p>
              </div>
            </div>
            <p className="text-xs text-kosmos-gray">
              Aumento potencial de receita
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="card-structural p-6 mb-6">
          <h3 className="font-display font-bold text-kosmos-white mb-4">
            Breakdown do Potencial
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Produto de Entrada', value: outputs.potencialProdutoEntrada },
              { label: 'Recorrência', value: outputs.potencialRecorrencia },
              { label: 'High Ticket', value: outputs.potencialHighTicket },
              { label: 'Comunidade', value: outputs.potencialComunidade },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-kosmos-gray">{item.label}</span>
                <span className="text-kosmos-white font-medium">
                  {formatarMoeda(item.value)}/mês
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative */}
        <div className="card-structural p-6 mb-6 border-l-4 border-l-kosmos-orange">
          <p className="text-kosmos-gray-light leading-relaxed">
            {outputs.narrative.mensagem}
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onCTA}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white"
          >
            {outputs.narrative.ctaTexto}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="w-full h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Resultado
          </Button>
        </div>

        {/* Footer */}
        {!isEmbed && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
              <div className="w-4 h-px bg-kosmos-gray/20" />
              <span>Powered by KOSMOS</span>
              <div className="w-4 h-px bg-kosmos-gray/20" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}

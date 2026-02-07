import { Button } from '@/design-system/primitives/button';
import { Download, Share2, MessageCircle } from 'lucide-react';
import { AuditResult, getClassificationInfo, getPillarDiagnosis } from '@/modules/kosmos-score/lib/auditQuestions';
import { cn } from '@/design-system/lib/utils';

interface ResultScreenProps {
  result: AuditResult;
  onDownloadPDF: () => void;
  onShare: () => void;
  onJoinGroup: () => void;
}

export function ResultScreen({ result, onDownloadPDF, onShare, onJoinGroup }: ResultScreenProps) {
  const classificationInfo = getClassificationInfo(result.classification);
  const causaDiagnosis = getPillarDiagnosis('causa', result.scoreCausa);
  const culturaDiagnosis = getPillarDiagnosis('cultura', result.scoreCultura);
  const economiaDiagnosis = getPillarDiagnosis('economia', result.scoreEconomia);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score <= 25) return 'text-score-red';
    if (score <= 50) return 'text-score-orange';
    if (score <= 75) return 'text-score-yellow';
    return 'text-score-green';
  };

  const getPillarColor = (score: number) => {
    if (score < 40) return 'bg-score-red';
    if (score < 70) return 'bg-score-yellow';
    return 'bg-score-green';
  };

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid px-4 py-8 md:py-12 relative">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents - subtle on results page */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l border-t border-kosmos-orange/20 hidden md:block" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r border-t border-kosmos-orange/20 hidden md:block" />

      <div className="w-full max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.3em] text-xs">
              KOSMOS
            </span>
            <div className="w-6 h-px bg-kosmos-orange" />
          </div>
          <p className="text-kosmos-gray text-sm">
            Resultado da sua Auditoria de Lucro Oculto
          </p>
        </div>

        {/* Main Score Card */}
        <div className="card-structural overflow-hidden animate-scale-in">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-kosmos-orange via-kosmos-orange-glow to-kosmos-orange" />

          <div className="p-8 md:p-10 text-center">
            <p className="text-kosmos-gray text-xs font-display uppercase tracking-[0.2em] mb-6">
              SEU KOSMOS ASSET SCORE
            </p>

            <div className="relative inline-block mb-6">
              <span className={cn(
                "font-display text-7xl md:text-8xl font-bold",
                getScoreColor(result.kosmosAssetScore)
              )}>
                {Math.round(result.kosmosAssetScore)}
              </span>
              <span className="text-2xl md:text-3xl text-kosmos-gray font-light">/100</span>
            </div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <h3 className="font-display text-xl md:text-2xl font-bold text-kosmos-white">
                {classificationInfo.title}
              </h3>
            </div>

            <p className="text-kosmos-gray max-w-lg mx-auto leading-relaxed">
              {classificationInfo.description}
            </p>
          </div>
        </div>

        {/* Pillar Diagnosis */}
        <div className="card-structural animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
              <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider">
                DIAGNÓSTICO POR PILAR
              </h3>
            </div>

            <div className="space-y-6">
              {/* Causa */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-kosmos-gray-light">CAUSA (Identidade)</span>
                  <span className="text-sm font-display font-semibold text-kosmos-orange">{Math.round(result.scoreCausa)}/100</span>
                </div>
                <div className="h-1.5 bg-kosmos-black-light rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreCausa))}
                    style={{ width: `${result.scoreCausa}%` }}
                  />
                </div>
                <p className="text-sm text-kosmos-gray">
                  <span className="font-medium text-kosmos-gray-light">{causaDiagnosis.status}.</span> {causaDiagnosis.message}
                </p>
              </div>

              <div className="h-px bg-border/30" />

              {/* Cultura */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-kosmos-gray-light">CULTURA (Retenção)</span>
                  <span className="text-sm font-display font-semibold text-kosmos-orange">{Math.round(result.scoreCultura)}/100</span>
                </div>
                <div className="h-1.5 bg-kosmos-black-light rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreCultura))}
                    style={{ width: `${result.scoreCultura}%` }}
                  />
                </div>
                <p className="text-sm text-kosmos-gray">
                  <span className="font-medium text-kosmos-gray-light">{culturaDiagnosis.status}.</span> {culturaDiagnosis.message}
                </p>
              </div>

              <div className="h-px bg-border/30" />

              {/* Economia */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-kosmos-gray-light">ECONOMIA (Lucro)</span>
                  <span className="text-sm font-display font-semibold text-kosmos-orange">{Math.round(result.scoreEconomia)}/100</span>
                </div>
                <div className="h-1.5 bg-kosmos-black-light rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreEconomia))}
                    style={{ width: `${result.scoreEconomia}%` }}
                  />
                </div>
                <p className="text-sm text-kosmos-gray">
                  <span className="font-medium text-kosmos-gray-light">{economiaDiagnosis.status}.</span> {economiaDiagnosis.message}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Result */}
        <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="card-structural overflow-hidden">
            {/* Gradient overlay for emphasis */}
            <div className="absolute inset-0 bg-gradient-to-br from-kosmos-orange/10 to-transparent pointer-events-none" />

            <div className="relative p-8 md:p-10 text-center">
              <p className="text-kosmos-gray text-xs font-display uppercase tracking-[0.2em] mb-3">
                {result.isBeginner ? 'SEU POTENCIAL DE PRIMEIRO CICLO' : 'ANÁLISE DE PERDAS'}
              </p>

              <p className="text-kosmos-gray-light mb-6">
                {result.isBeginner
                  ? 'Com base no seu potencial, seu primeiro ciclo com Arquitetura KOSMOS pode gerar'
                  : 'Com base nos seus dados atuais, estimamos um Lucro Oculto de'
                }
              </p>

              <div className="mb-6">
                <span className="font-display text-5xl md:text-6xl font-bold text-kosmos-orange">
                  {formatCurrency(result.lucroOculto)}
                </span>
                <span className="text-kosmos-gray text-2xl md:text-3xl">/ano</span>
              </div>

              <p className="text-kosmos-gray text-sm">
                {result.isBeginner
                  ? 'Cálculo baseado em benchmarks de mercado para iniciantes.'
                  : 'não capturado devido a falhas na arquitetura de Ascensão.'
                }
              </p>

              <p className="text-kosmos-gray/50 text-xs mt-4">
                Cálculo baseado em benchmarks conservadores de mercado para o seu segmento.
              </p>
            </div>
          </div>
        </div>

        {/* Beginner Mode Message */}
        {result.isBeginner && (
          <div className="card-structural animate-fade-in" style={{ animationDelay: '250ms' }}>
            <div className="p-6 md:p-8 relative">
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-kosmos-orange/50 rounded-r" />
              <p className="text-kosmos-gray-light text-center italic pl-4">
                "Você está começando com a vantagem de quem já conhece a Arquitetura certa.
                A maioria dos negócios digitais leva 2-3 anos para descobrir o que você vai aprender no dia 26.
                Você não vai construir como Inquilino — vai começar direto como Arquiteto."
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="card-structural animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-px bg-kosmos-orange/50" />
                <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider">
                  PRÓXIMO PASSO
                </h3>
                <div className="w-8 h-px bg-kosmos-orange/50" />
              </div>
              <p className="text-kosmos-gray text-sm">
                No Workshop do dia 26/Fev, entregaremos o Blueprint para corrigir essas falhas estruturais.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onJoinGroup}
                size="lg"
                className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow text-white glow-orange"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Entrar no Grupo do Workshop
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onDownloadPDF}
                  variant="outline"
                  className="h-12 font-display border-border hover:border-kosmos-orange/50 hover:bg-kosmos-black-light text-kosmos-gray-light"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button
                  onClick={onShare}
                  variant="outline"
                  className="h-12 font-display border-border hover:border-kosmos-orange/50 hover:bg-kosmos-black-light text-kosmos-gray-light"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
            <div className="w-4 h-px bg-kosmos-gray/20" />
            <span>© 2026 KOSMOS</span>
            <div className="w-4 h-px bg-kosmos-gray/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

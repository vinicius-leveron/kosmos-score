import { Button } from '@/design-system/primitives/button';
import { Download, Share2, MessageCircle } from 'lucide-react';
import {
  AuditResult,
  getProfileInfo,
  getPillarDiagnosis,
  getStageMessage,
  getLucroLabel,
  WORKSHOP_DATE,
} from '@/modules/kosmos-score/lib/auditQuestionsV2';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';

interface ResultScreenProps {
  result: AuditResult;
  onDownloadPDF: () => void;
  onShare: () => void;
  onJoinGroup: () => void;
}

export function ResultScreen({ result, onDownloadPDF, onShare, onJoinGroup }: ResultScreenProps) {
  const { isEmbed } = useEmbed();
  const profileInfo = getProfileInfo(result.resultProfile);
  const movimentoDiagnosis = getPillarDiagnosis('movimento', result.scoreMovimento);
  const estruturaDiagnosis = getPillarDiagnosis('estrutura', result.scoreEstrutura);
  const economiaDiagnosis = getPillarDiagnosis('economia', result.scoreEconomia);
  const stageMessage = getStageMessage(result.stage);
  const lucroLabel = getLucroLabel(result.stage);

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
    <div className={cn(
      "bg-kosmos-black blueprint-grid px-4 relative",
      isEmbed ? "min-h-0 py-4" : "min-h-screen py-8 md:py-12"
    )}>
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      {/* Corner Accents - subtle on results page */}
      {!isEmbed && (
        <>
          <div className="absolute top-6 left-6 w-8 h-8 border-l border-t border-kosmos-orange/20 hidden md:block" />
          <div className="absolute top-6 right-6 w-8 h-8 border-r border-t border-kosmos-orange/20 hidden md:block" />
        </>
      )}

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
                {profileInfo.title}
              </h3>
            </div>

            <p className="text-kosmos-gray max-w-lg mx-auto leading-relaxed">
              {profileInfo.description}
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
              {/* Movimento (antigo Causa) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-kosmos-gray-light">MOVIMENTO (Identidade & Atração)</span>
                  <span className="text-sm font-display font-semibold text-kosmos-orange">{Math.round(result.scoreMovimento)}/100</span>
                </div>
                <div className="h-1.5 bg-kosmos-black-light rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreMovimento))}
                    style={{ width: `${result.scoreMovimento}%` }}
                  />
                </div>
                <p className="text-sm text-kosmos-gray">
                  <span className="font-medium text-kosmos-gray-light">{movimentoDiagnosis.status}.</span> {movimentoDiagnosis.message}
                </p>
              </div>

              <div className="h-px bg-border/30" />

              {/* Estrutura (antigo Cultura) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-kosmos-gray-light">ESTRUTURA (Retenção & Jornada)</span>
                  <span className="text-sm font-display font-semibold text-kosmos-orange">{Math.round(result.scoreEstrutura)}/100</span>
                </div>
                <div className="h-1.5 bg-kosmos-black-light rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreEstrutura))}
                    style={{ width: `${result.scoreEstrutura}%` }}
                  />
                </div>
                <p className="text-sm text-kosmos-gray">
                  <span className="font-medium text-kosmos-gray-light">{estruturaDiagnosis.status}.</span> {estruturaDiagnosis.message}
                </p>
              </div>

              <div className="h-px bg-border/30" />

              {/* Economia */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-display text-kosmos-gray-light">ECONOMIA (Lucro & Dados)</span>
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
                {lucroLabel}
              </p>

              <p className="text-kosmos-gray-light mb-6">
                {result.stage === 'construindo'
                  ? 'Com base no seu potencial, seu ecossistema pode gerar'
                  : 'Com base nos seus dados atuais, estimamos um Lucro Oculto de'
                }
              </p>

              <div className="mb-6">
                <span className="font-display text-4xl md:text-5xl font-bold text-kosmos-orange">
                  {result.lucroOcultoDisplay}
                </span>
                <span className="text-kosmos-gray text-xl md:text-2xl">/ano</span>
              </div>

              <p className="text-kosmos-gray/50 text-xs">
                Cálculo baseado em benchmarks conservadores de mercado para o seu segmento.
              </p>
            </div>
          </div>
        </div>

        {/* Stage-based Message */}
        <div className="card-structural animate-fade-in" style={{ animationDelay: '250ms' }}>
          <div className="p-6 md:p-8 relative">
            <div className="absolute left-0 top-6 bottom-6 w-1 bg-kosmos-orange/50 rounded-r" />
            <p className="text-kosmos-gray-light text-center italic pl-4">
              "{stageMessage}"
            </p>
          </div>
        </div>

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
                No Workshop do dia {WORKSHOP_DATE}, entregaremos o Blueprint para corrigir essas falhas estruturais.
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
        {!isEmbed && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
              <div className="w-4 h-px bg-kosmos-gray/20" />
              <span>© 2026 KOSMOS</span>
              <div className="w-4 h-px bg-kosmos-gray/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

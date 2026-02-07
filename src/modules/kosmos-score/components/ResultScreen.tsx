import { Button } from '@/design-system/primitives/button';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Separator } from '@/design-system/primitives/separator';
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
    <div className="min-h-screen gradient-kosmos px-4 py-8 md:py-12">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-primary font-semibold tracking-widest text-sm mb-2">
            KOSMOS
          </h2>
          <p className="text-muted-foreground text-sm">
            Resultado da sua Auditoria de Lucro Oculto
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="card-premium border-0 bg-card/50 overflow-hidden animate-scale-in">
          <CardContent className="p-8 md:p-10 text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4">
              SEU KOSMOS ASSET SCORE
            </p>
            
            <div className="relative inline-block mb-4">
              <span className={cn(
                "text-7xl md:text-8xl font-bold",
                getScoreColor(result.kosmosAssetScore)
              )}>
                {Math.round(result.kosmosAssetScore)}
              </span>
              <span className="text-2xl md:text-3xl text-muted-foreground font-light">/100</span>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">{classificationInfo.emoji}</span>
              <h3 className={cn(
                "text-xl md:text-2xl font-bold",
                `text-${classificationInfo.color}`
              )}>
                {classificationInfo.title}
              </h3>
            </div>

            <p className="text-muted-foreground max-w-lg mx-auto">
              {classificationInfo.description}
            </p>
          </CardContent>
        </Card>

        {/* Pillar Diagnosis */}
        <Card className="card-premium border-0 bg-card/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              DIAGNÓSTICO POR PILAR
            </h3>

            <div className="space-y-6">
              {/* Causa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">CAUSA (Identidade)</span>
                  <span className="text-sm font-semibold text-primary">{Math.round(result.scoreCausa)}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreCausa))}
                    style={{ width: `${result.scoreCausa}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{causaDiagnosis.status}.</span> {causaDiagnosis.message}
                </p>
              </div>

              <Separator className="bg-border/30" />

              {/* Cultura */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">CULTURA (Retenção)</span>
                  <span className="text-sm font-semibold text-primary">{Math.round(result.scoreCultura)}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreCultura))}
                    style={{ width: `${result.scoreCultura}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{culturaDiagnosis.status}.</span> {culturaDiagnosis.message}
                </p>
              </div>

              <Separator className="bg-border/30" />

              {/* Economia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">ECONOMIA (Lucro)</span>
                  <span className="text-sm font-semibold text-primary">{Math.round(result.scoreEconomia)}/100</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", getPillarColor(result.scoreEconomia))}
                    style={{ width: `${result.scoreEconomia}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{economiaDiagnosis.status}.</span> {economiaDiagnosis.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Result */}
        <Card className="card-premium border-0 bg-gradient-to-br from-primary/20 to-primary/5 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-8 md:p-10 text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
              {result.isBeginner ? 'SEU POTENCIAL DE PRIMEIRO CICLO' : 'ANÁLISE DE PERDAS'}
            </p>
            
            <p className="text-foreground mb-4">
              {result.isBeginner 
                ? 'Com base no seu potencial, seu primeiro ciclo com Arquitetura KOSMOS pode gerar'
                : 'Com base nos seus dados atuais, estimamos um Lucro Oculto de'
              }
            </p>

            <div className="text-gradient-orange text-5xl md:text-6xl font-bold mb-4">
              {formatCurrency(result.lucroOculto)}<span className="text-2xl md:text-3xl">/ano</span>
            </div>

            <p className="text-muted-foreground text-sm">
              {result.isBeginner 
                ? 'Cálculo baseado em benchmarks de mercado para iniciantes.'
                : 'não capturado devido a falhas na arquitetura de Ascensão.'
              }
            </p>

            <p className="text-muted-foreground/60 text-xs mt-4">
              Cálculo baseado em benchmarks conservadores de mercado para o seu segmento.
            </p>
          </CardContent>
        </Card>

        {/* Beginner Mode Message */}
        {result.isBeginner && (
          <Card className="card-premium border-0 bg-card/50 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <CardContent className="p-6 md:p-8">
              <p className="text-foreground text-center italic">
                "Você está começando com a vantagem de quem já conhece a Arquitetura certa. 
                A maioria dos negócios digitais leva 2-3 anos para descobrir o que você vai aprender no dia 26. 
                Você não vai construir como Inquilino — vai começar direto como Arquiteto."
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="card-premium border-0 bg-card/50 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                PRÓXIMO PASSO RECOMENDADO
              </h3>
              <p className="text-muted-foreground text-sm">
                No Workshop do dia 26/Fev, entregaremos o Blueprint para corrigir essas falhas estruturais.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={onJoinGroup}
                size="lg" 
                className="w-full h-14 text-lg font-semibold glow-orange animate-pulse-glow"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Entrar no Grupo do Workshop
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={onDownloadPDF}
                  variant="outline" 
                  className="h-12 border-border/50 hover:bg-secondary/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button 
                  onClick={onShare}
                  variant="outline" 
                  className="h-12 border-border/50 hover:bg-secondary/50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-muted-foreground/40 text-xs text-center py-4">
          © 2026 KOSMOS. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

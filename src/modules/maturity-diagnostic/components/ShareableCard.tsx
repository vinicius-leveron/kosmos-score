import { cn } from '@/design-system/lib/utils';
import { MaturityLevelInfo } from '../lib/maturityLevels';

interface ShareableCardProps {
  level: number;
  levelInfo: MaturityLevelInfo;
  averageScore: number;
  className?: string;
}

export function ShareableCard({
  level,
  levelInfo,
  averageScore,
  className,
}: ShareableCardProps) {
  // Posições dos níveis na pirâmide (porcentagem do topo)
  const levelPositions = [85, 68, 50, 32, 15]; // Nível 1-5

  return (
    <div
      className={cn(
        'relative bg-kosmos-black rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />

      {/* Glow Effect */}
      <div
        className={cn(
          'absolute inset-0 opacity-20',
          level === 1 && 'bg-gradient-to-t from-red-500/20 to-transparent',
          level === 2 && 'bg-gradient-to-t from-orange-500/20 to-transparent',
          level === 3 && 'bg-gradient-to-t from-yellow-500/20 to-transparent',
          level === 4 && 'bg-gradient-to-t from-emerald-500/20 to-transparent',
          level === 5 && 'bg-gradient-to-t from-cyan-500/20 to-transparent'
        )}
      />

      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-6 h-px bg-kosmos-orange" />
            <span className="text-kosmos-orange font-display font-semibold tracking-[0.2em] text-xs uppercase">
              KOSMOS
            </span>
            <div className="w-6 h-px bg-kosmos-orange" />
          </div>
          <p className="text-kosmos-gray text-xs">Diagnóstico de Maturidade</p>
        </div>

        {/* Pyramid Visualization */}
        <div className="relative h-48 flex items-center justify-center mb-6">
          {/* Pyramid SVG */}
          <svg
            viewBox="0 0 200 160"
            className="w-full max-w-[250px] h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Level 5 - Top */}
            <polygon
              points="100,10 120,35 80,35"
              className={cn(
                'transition-all duration-500',
                level >= 5
                  ? 'fill-cyan-500/80 stroke-cyan-400'
                  : 'fill-border/30 stroke-border'
              )}
              strokeWidth="1"
            />

            {/* Level 4 */}
            <polygon
              points="80,35 120,35 135,60 65,60"
              className={cn(
                'transition-all duration-500',
                level >= 4
                  ? 'fill-emerald-500/80 stroke-emerald-400'
                  : 'fill-border/30 stroke-border'
              )}
              strokeWidth="1"
            />

            {/* Level 3 */}
            <polygon
              points="65,60 135,60 150,90 50,90"
              className={cn(
                'transition-all duration-500',
                level >= 3
                  ? 'fill-yellow-500/80 stroke-yellow-400'
                  : 'fill-border/30 stroke-border'
              )}
              strokeWidth="1"
            />

            {/* Level 2 */}
            <polygon
              points="50,90 150,90 165,120 35,120"
              className={cn(
                'transition-all duration-500',
                level >= 2
                  ? 'fill-orange-500/80 stroke-orange-400'
                  : 'fill-border/30 stroke-border'
              )}
              strokeWidth="1"
            />

            {/* Level 1 - Base */}
            <polygon
              points="35,120 165,120 180,150 20,150"
              className={cn(
                'transition-all duration-500',
                level >= 1
                  ? 'fill-red-500/80 stroke-red-400'
                  : 'fill-border/30 stroke-border'
              )}
              strokeWidth="1"
            />

            {/* Current Level Indicator */}
            <circle
              cx="100"
              cy={levelPositions[level - 1] + '%'}
              r="8"
              className="fill-white animate-pulse"
            />
            <circle
              cx="100"
              cy={levelPositions[level - 1] + '%'}
              r="4"
              className={cn(
                level === 1 && 'fill-red-500',
                level === 2 && 'fill-orange-500',
                level === 3 && 'fill-yellow-500',
                level === 4 && 'fill-emerald-500',
                level === 5 && 'fill-cyan-500'
              )}
            />
          </svg>
        </div>

        {/* Level Badge */}
        <div className="text-center">
          <div
            className={cn(
              'inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4',
              levelInfo.bgColor
            )}
          >
            <span className="text-3xl">{levelInfo.emoji}</span>
            <div className="text-left">
              <div className={cn('text-xs font-medium', levelInfo.color)}>
                NÍVEL {level}
              </div>
              <div className="text-white font-display font-bold text-lg">
                {levelInfo.name}
              </div>
            </div>
          </div>

          <p className="text-kosmos-gray text-sm max-w-xs mx-auto">
            {levelInfo.headline}
          </p>
        </div>

        {/* Score */}
        <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-border/50">
          <div className="text-center">
            <div className="text-kosmos-gray text-xs mb-1">Score Médio</div>
            <div className="text-white font-display font-bold text-xl">
              {averageScore.toFixed(1)}
              <span className="text-kosmos-gray text-sm font-normal">/5</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-kosmos-gray/60 text-xs">
            kosmos.com/quiz/maturity
          </p>
        </div>
      </div>
    </div>
  );
}

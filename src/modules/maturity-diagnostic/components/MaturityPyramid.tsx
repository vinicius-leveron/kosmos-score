import { cn } from '@/design-system/lib/utils';
import { MaturityLevel, MATURITY_LEVELS } from '../lib/maturityLevels';

interface MaturityPyramidProps {
  currentLevel: MaturityLevel;
  showLabels?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MaturityPyramid({
  currentLevel,
  showLabels = true,
  animated = true,
  size = 'md',
}: MaturityPyramidProps) {
  // Ordenar do nivel 5 (topo) para nivel 1 (base)
  const levels = [5, 4, 3, 2, 1] as MaturityLevel[];

  const sizeClasses = {
    sm: { container: 'max-w-xs', padding: 'p-2', text: 'text-xs', emoji: 'text-lg' },
    md: { container: 'max-w-sm', padding: 'p-3', text: 'text-sm', emoji: 'text-xl' },
    lg: { container: 'max-w-md', padding: 'p-4', text: 'text-base', emoji: 'text-2xl' },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('w-full mx-auto', classes.container)}>
      {levels.map((level, index) => {
        const info = MATURITY_LEVELS[level];
        const isCurrentLevel = level === currentLevel;
        const isBelow = level < currentLevel;
        const isAbove = level > currentLevel;

        // Largura aumenta de cima para baixo (piramide invertida)
        const widthPercentage = 50 + index * 12.5; // 50%, 62.5%, 75%, 87.5%, 100%

        return (
          <div
            key={level}
            className="flex justify-center"
            style={{
              animationDelay: animated ? `${index * 100}ms` : '0ms',
            }}
          >
            <div
              className={cn(
                'relative flex items-center gap-2 rounded-lg border transition-all duration-300',
                classes.padding,
                isCurrentLevel && 'ring-2 ring-offset-2 ring-offset-kosmos-black',
                isCurrentLevel && info.color.replace('text-', 'ring-'),
                isBelow && 'opacity-100',
                isAbove && 'opacity-40',
                isCurrentLevel ? info.bgColor : isBelow ? 'bg-kosmos-black-light/50' : 'bg-kosmos-black/30',
                isCurrentLevel ? 'border-current' : 'border-kosmos-gray/20',
                animated && 'animate-fade-in'
              )}
              style={{ width: `${widthPercentage}%` }}
            >
              {/* Indicador de nivel atual */}
              {isCurrentLevel && (
                <div
                  className={cn(
                    'absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full',
                    info.color.replace('text-', 'bg-')
                  )}
                />
              )}

              {/* Emoji */}
              <span className={cn(classes.emoji, isCurrentLevel ? '' : 'grayscale')}>
                {info.emoji}
              </span>

              {/* Info */}
              {showLabels && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'font-medium truncate',
                        classes.text,
                        isCurrentLevel ? info.color : isBelow ? 'text-kosmos-gray-light' : 'text-kosmos-gray/50'
                      )}
                    >
                      {info.name}
                    </span>
                    {isCurrentLevel && (
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', info.bgColor, info.color)}>
                        VOCE
                      </span>
                    )}
                  </div>
                  {size !== 'sm' && (
                    <p
                      className={cn(
                        'text-xs truncate',
                        isCurrentLevel ? 'text-kosmos-gray-light' : 'text-kosmos-gray/40'
                      )}
                    >
                      {info.headline}
                    </p>
                  )}
                </div>
              )}

              {/* Nivel */}
              <span
                className={cn(
                  'font-bold',
                  classes.text,
                  isCurrentLevel ? info.color : 'text-kosmos-gray/30'
                )}
              >
                {level}
              </span>
            </div>
          </div>
        );
      })}

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-kosmos-gray/30" />
          <span className="text-kosmos-gray/50">Acima de voce</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full', MATURITY_LEVELS[currentLevel].color.replace('text-', 'bg-'))} />
          <span className="text-kosmos-gray-light">Seu nivel atual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-kosmos-gray-light/50" />
          <span className="text-kosmos-gray/50">Conquistado</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Versao compacta da piramide para uso em cards
 */
export function MaturityPyramidCompact({ currentLevel }: { currentLevel: MaturityLevel }) {
  const levels = [5, 4, 3, 2, 1] as MaturityLevel[];

  return (
    <div className="flex items-end justify-center gap-1 h-8">
      {levels.map((level) => {
        const info = MATURITY_LEVELS[level];
        const isCurrentLevel = level === currentLevel;
        const isBelow = level < currentLevel;
        const height = 8 + (5 - level) * 5; // 8px para nivel 5, 28px para nivel 1

        return (
          <div
            key={level}
            className={cn(
              'w-4 rounded-t transition-all duration-300',
              isCurrentLevel
                ? info.color.replace('text-', 'bg-')
                : isBelow
                  ? 'bg-kosmos-gray/40'
                  : 'bg-kosmos-gray/20'
            )}
            style={{ height: `${height}px` }}
            title={`Nivel ${level}: ${info.name}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Versao horizontal da jornada de niveis
 */
export function MaturityJourney({ currentLevel }: { currentLevel: MaturityLevel }) {
  const levels = [1, 2, 3, 4, 5] as MaturityLevel[];

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {levels.map((level, index) => {
        const info = MATURITY_LEVELS[level];
        const isCurrentLevel = level === currentLevel;
        const isPast = level < currentLevel;
        const isFuture = level > currentLevel;

        return (
          <div key={level} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCurrentLevel && cn(info.bgColor, info.color.replace('text-', 'border-'), 'ring-2 ring-offset-2 ring-offset-kosmos-black', info.color.replace('text-', 'ring-')),
                  isPast && 'bg-kosmos-gray/20 border-kosmos-gray/40',
                  isFuture && 'bg-kosmos-black border-kosmos-gray/20'
                )}
              >
                <span className={cn('text-lg', isCurrentLevel ? '' : 'grayscale opacity-50')}>
                  {info.emoji}
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isCurrentLevel ? info.color : isPast ? 'text-kosmos-gray' : 'text-kosmos-gray/40'
                )}
              >
                {info.name}
              </span>
            </div>

            {/* Connector */}
            {index < levels.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-1',
                  isPast ? 'bg-kosmos-gray/40' : 'bg-kosmos-gray/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

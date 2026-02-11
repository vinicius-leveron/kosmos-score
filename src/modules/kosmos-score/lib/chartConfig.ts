// KOSMOS Chart Configuration
// Based on the KOSMOS "Cânone de Fundação" brandbook

export const CHART_COLORS = {
  // Primary brand colors
  primary: '#FF4500',           // Laranja Queimado KOSMOS
  primaryDark: '#CC3700',       // Laranja escuro
  primaryLight: '#FF6A33',      // Laranja claro

  // Score ranges
  danger: '#EF4444',            // Vermelho (0-25)
  warning: '#F59E0B',           // Amarelo/Laranja (26-50)
  moderate: '#EAB308',          // Dourado (51-75)
  success: '#22C55E',           // Verde (76-100)

  // Pilares V2 (renamed from causa/cultura)
  movimento: '#FF4500',         // Laranja (identidade & atração)
  estrutura: '#A855F7',         // Roxo (retenção & jornada)
  economia: '#3B82F6',          // Azul (lucro & dados)

  // Legacy names (for backwards compatibility)
  causa: '#FF4500',             // Alias for movimento
  cultura: '#A855F7',           // Alias for estrutura

  // UI elements
  gridLine: 'hsl(0, 0%, 15%)',
  labelText: 'hsl(0, 0%, 60%)',
  background: 'hsl(0, 0%, 5%)',

  // Lead types
  beginner: '#FF4500',
  experienced: '#A855F7',
} as const;

export const SCORE_RANGES = [
  { min: 0, max: 25, label: 'Crítico', color: CHART_COLORS.danger },
  { min: 26, max: 50, label: 'Alerta', color: CHART_COLORS.warning },
  { min: 51, max: 75, label: 'Moderado', color: CHART_COLORS.moderate },
  { min: 76, max: 100, label: 'Saudável', color: CHART_COLORS.success },
] as const;

// V2 Pillar Configuration (new naming)
export const PILLAR_CONFIG = {
  movimento: {
    label: 'MOVIMENTO',
    fullLabel: 'Movimento (Identidade & Atração)',
    color: CHART_COLORS.movimento,
  },
  estrutura: {
    label: 'ESTRUTURA',
    fullLabel: 'Estrutura (Retenção & Jornada)',
    color: CHART_COLORS.estrutura,
  },
  economia: {
    label: 'ECONOMIA',
    fullLabel: 'Economia (Lucro & Dados)',
    color: CHART_COLORS.economia,
  },
} as const;

// Legacy pillar config (for backwards compatibility with V1 data)
export const PILLAR_CONFIG_LEGACY = {
  causa: {
    label: 'CAUSA',
    fullLabel: 'Causa (Identidade)',
    color: CHART_COLORS.causa,
  },
  cultura: {
    label: 'CULTURA',
    fullLabel: 'Cultura (Retenção)',
    color: CHART_COLORS.cultura,
  },
  economia: {
    label: 'ECONOMIA',
    fullLabel: 'Economia (Lucro)',
    color: CHART_COLORS.economia,
  },
} as const;

// V2 Result Profiles (new classification system)
export const RESULT_PROFILES = {
  base_sem_estrutura: {
    label: 'Base sem Estrutura',
    color: CHART_COLORS.danger,
    range: { min: 0, max: 25 },
  },
  base_construcao: {
    label: 'Base em Construção',
    color: CHART_COLORS.warning,
    range: { min: 26, max: 50 },
  },
  base_maturacao: {
    label: 'Base em Maturação',
    color: CHART_COLORS.moderate,
    range: { min: 51, max: 75 },
  },
  ativo_alta_performance: {
    label: 'Ativo de Alta Performance',
    color: CHART_COLORS.success,
    range: { min: 76, max: 100 },
  },
} as const;

export function getScoreColor(score: number): string {
  if (score <= 25) return CHART_COLORS.danger;
  if (score <= 50) return CHART_COLORS.warning;
  if (score <= 75) return CHART_COLORS.moderate;
  return CHART_COLORS.success;
}

export function getScoreLabel(score: number): string {
  if (score <= 25) return 'Crítico';
  if (score <= 50) return 'Alerta';
  if (score <= 75) return 'Moderado';
  return 'Saudável';
}

export function getResultProfileLabel(score: number): string {
  if (score <= 25) return 'Base sem Estrutura';
  if (score <= 50) return 'Base em Construção';
  if (score <= 75) return 'Base em Maturação';
  return 'Ativo de Alta Performance';
}

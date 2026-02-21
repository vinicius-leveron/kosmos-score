// Diagnóstico de Maturidade de Ecossistema
// Lead magnet para avaliar o nível de maturidade do ecossistema do creator

export { MaturityDiagnosticPage } from './pages/MaturityDiagnosticPage';
export { DiagnosticFlow } from './components/DiagnosticFlow';
export { EmbedProvider, useEmbed } from './contexts/EmbedContext';

// Lib exports
export { MATURITY_QUESTIONS, getTotalQuestions } from './lib/questions';
export type { MaturityQuestion, MaturityPillar } from './lib/questions';

export {
  MATURITY_LEVELS,
  getMaturityLevel,
  getMaturityLevelInfo,
} from './lib/maturityLevels';
export type { MaturityLevel, MaturityLevelInfo } from './lib/maturityLevels';

export { calculateDiagnosticResult } from './lib/scoring';
export type { DiagnosticResult, DiagnosticAnswer } from './lib/scoring';

// Hooks
export { useSaveDiagnostic } from './hooks/useSaveDiagnostic';
export { useEmbedMessaging } from './hooks/useEmbedMessaging';

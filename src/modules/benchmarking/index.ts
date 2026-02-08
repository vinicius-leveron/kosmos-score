/**
 * Benchmarking Module - Premium benchmarking service for clients
 */

// Types
export * from './types';

// Hooks
export * from './hooks';

// Pages
export { AdminBenchmarksPage } from './pages/AdminBenchmarksPage';
export { AdminBenchmarkFormPage } from './pages/AdminBenchmarkFormPage';
export { ClientBenchmarkPage } from './pages/ClientBenchmarkPage';

// Components - Admin
export { ClientDataStep } from './components/admin/steps/ClientDataStep';
export { ScoresStep } from './components/admin/steps/ScoresStep';
export { FinancialsStep } from './components/admin/steps/FinancialsStep';
export { InsightsStep } from './components/admin/steps/InsightsStep';

// Components - Client
export { ScoreComparisonCard } from './components/client/ScoreComparisonCard';
export { FinancialMetricsCard } from './components/client/FinancialMetricsCard';
export { InsightsSection } from './components/client/InsightsSection';

// Components - Shared
export { PillarComparisonChart } from './components/shared/PillarComparisonChart';
export { PercentileBar } from './components/shared/PercentileBar';

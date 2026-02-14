/**
 * Competitor Intelligence Module
 * Analyzes competitors from Instagram handle through a multi-agent pipeline.
 */

// Types
export * from './lib/competitorTypes';
export * from './lib/channelConfig';

// Hooks
export {
  useCompetitors,
  useAllCompetitors,
  useCompetitorDetail,
  useAnalysisRun,
  validateInstagramHandle,
  useCreateCompetitor,
  useDeleteCompetitor,
  useRerunAnalysis,
} from './hooks/useCompetitorAnalysis';

// Components
export { CompetitorForm } from './components/CompetitorForm';
export { AnalysisProgressCard } from './components/AnalysisProgressCard';
export { CompetitorOverview } from './components/CompetitorOverview';
export { ChannelCard } from './components/ChannelCard';
export { ProductsList } from './components/ProductsList';
export { InsightsSection } from './components/InsightsSection';

// Pages
export { CompetitorListPage } from './pages/CompetitorListPage';
export { CompetitorDetailPage } from './pages/CompetitorDetailPage';

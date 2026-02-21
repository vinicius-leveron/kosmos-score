// HT Template Module (now Blueprint de Ecossistema)
export { HTTemplatePage } from './pages/HTTemplatePage';
export { TemplateFlow } from './components/TemplateFlow';
export { EmbedProvider, useEmbed } from './contexts/EmbedContext';

// Components
export { BlueprintVisualization, LayerSummary } from './components/BlueprintVisualization';
export { LayerStep } from './components/LayerStep';

// Types - Legacy
export type { TemplateData, TemplateSection, TemplateField } from './lib/sections';

// Types - New Ecosystem Blueprint
export type {
  LayerId,
  LayerQuestion,
  EcosystemLayer,
  BlueprintData,
  LayerScore,
} from './lib/layers';

// Lib
export { ECOSYSTEM_LAYERS, calculateLayerScore, calculateOverallScore } from './lib/layers';
export {
  generateBlueprintPreview,
  calculateBlueprintCompleteness,
  getOverallRecommendations,
} from './lib/generateBlueprint';

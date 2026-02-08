/**
 * KOSMOS Stakeholder Analysis Module
 *
 * Module for managing financial stakeholders (investors, partners, co-founders, advisors)
 * of digital communities.
 */

// Module metadata
export const stakeholderAnalysisModule = {
  id: 'stakeholder-analysis',
  name: 'Stakeholder Analysis',
  description: 'Gerenciamento de socios e parceiros da comunidade',
  plans: ['pro', 'enterprise'],
  navigation: [
    {
      id: 'stakeholders',
      label: 'Stakeholders',
      path: '/stakeholders',
      icon: 'Users',
    },
  ],
};

// Re-export types
export * from './types/stakeholder.types';

// Re-export hooks
export * from './hooks/useStakeholders';

// Re-export components
export * from './components';

// Re-export pages
export * from './pages';

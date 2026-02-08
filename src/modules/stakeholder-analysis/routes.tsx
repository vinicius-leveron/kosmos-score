/**
 * Stakeholder Analysis Module Routes
 *
 * This file exports route configurations for the module.
 * Can be used for lazy loading in a module-based router.
 */

import { RouteObject } from 'react-router-dom';
import { StakeholdersListPage } from './pages/StakeholdersListPage';
import { StakeholderDetailPage } from './pages/StakeholderDetailPage';

export const stakeholderRoutes = (organizationId: string): RouteObject[] => [
  {
    path: '/stakeholders',
    element: <StakeholdersListPage organizationId={organizationId} />,
  },
  {
    path: '/stakeholders/:id',
    element: <StakeholderDetailPage organizationId={organizationId} />,
  },
];

export default stakeholderRoutes;

/**
 * Stakeholder Analysis Module Routes
 *
 * This file exports route configurations for the module.
 * Can be used for lazy loading in a module-based router.
 */

import { RouteObject } from 'react-router-dom';
import { StakeholdersListPage } from './pages/StakeholdersListPage';
import { StakeholderDetailPage } from './pages/StakeholderDetailPage';
import { StakeholderDashboardPage } from './pages/StakeholderDashboardPage';

export const stakeholderRoutes = (): RouteObject[] => [
  {
    path: '/stakeholders',
    element: <StakeholdersListPage />,
  },
  {
    path: '/stakeholders/dashboard',
    element: <StakeholderDashboardPage />,
  },
  {
    path: '/stakeholders/:id',
    element: <StakeholderDetailPage />,
  },
];

export default stakeholderRoutes;

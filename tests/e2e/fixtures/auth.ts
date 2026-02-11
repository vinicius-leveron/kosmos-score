import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CRMPage } from '../pages/CRMPage';
import { FormPublicPage } from '../pages/FormPublicPage';
import { testUsers } from './test-data';

type AuthFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  crmPage: CRMPage;
  formPublicPage: FormPublicPage;
  authenticatedAdminPage: DashboardPage;
  authenticatedClientPage: DashboardPage;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  crmPage: async ({ page }, use) => {
    await use(new CRMPage(page));
  },

  formPublicPage: async ({ page }, use) => {
    await use(new FormPublicPage(page));
  },

  authenticatedAdminPage: async ({ page }, use) => {
    // Setup: Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectToBeOnDashboard();
    
    // Use the authenticated page
    await use(dashboardPage);
    
    // Cleanup: Logout (optional)
    // await dashboardPage.logout();
  },

  authenticatedClientPage: async ({ page }, use) => {
    // Setup: Login as client
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.client.email, testUsers.client.password);
    
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.expectToBeOnDashboard();
    
    // Use the authenticated page
    await use(dashboardPage);
    
    // Cleanup: Logout (optional)
    // await dashboardPage.logout();
  },
});

export { expect } from '@playwright/test';
import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly sidebarMenu: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1').first();
    this.userMenu = page.locator('[data-testid="user-menu"], button:has-text("Minha Conta")');
    this.logoutButton = page.getByRole('button', { name: /sair|logout/i });
    this.sidebarMenu = page.locator('nav, aside').first();
    this.mainContent = page.locator('main');
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async expectToBeOnDashboard() {
    await expect(this.page).toHaveURL(/\/admin|\/app/);
    await expect(this.mainContent).toBeVisible();
  }

  async logout() {
    // Try to click user menu first if it exists
    const userMenuVisible = await this.userMenu.isVisible().catch(() => false);
    if (userMenuVisible) {
      await this.userMenu.click();
    }
    
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  async navigateToModule(moduleName: string) {
    const link = this.sidebarMenu.getByRole('link', { name: new RegExp(moduleName, 'i') });
    await link.click();
  }

  async expectModuleVisible(moduleName: string) {
    const moduleLink = this.sidebarMenu.getByRole('link', { name: new RegExp(moduleName, 'i') });
    await expect(moduleLink).toBeVisible();
  }
}
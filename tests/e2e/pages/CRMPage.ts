import { Page, Locator, expect } from '@playwright/test';

export class CRMPage {
  readonly page: Page;
  readonly addContactButton: Locator;
  readonly searchInput: Locator;
  readonly contactsTable: Locator;
  readonly pipelineBoard: Locator;
  readonly dealCards: Locator;
  readonly addDealButton: Locator;

  // Form fields
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly companyInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addContactButton = page.getByRole('button', { name: /adicionar contato|novo contato|add contact/i });
    this.searchInput = page.getByPlaceholder(/buscar|search/i);
    this.contactsTable = page.locator('table, [role="table"]');
    this.pipelineBoard = page.locator('[data-testid="pipeline-board"], .pipeline-board, .kanban-board');
    this.dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    this.addDealButton = page.getByRole('button', { name: /adicionar negócio|novo negócio|add deal/i });

    // Form fields
    this.nameInput = page.locator('input[name="name"], input[placeholder*="nome"]');
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.phoneInput = page.locator('input[name="phone"], input[placeholder*="telefone"], input[placeholder*="phone"]');
    this.companyInput = page.locator('input[name="company"], input[placeholder*="empresa"], input[placeholder*="company"]');
    this.saveButton = page.getByRole('button', { name: /salvar|save/i });
    this.cancelButton = page.getByRole('button', { name: /cancelar|cancel/i });
  }

  async gotoContacts() {
    await this.page.goto('/admin/crm/contacts');
    await expect(this.page).toHaveURL(/\/crm\/contacts/);
  }

  async gotoPipeline() {
    await this.page.goto('/admin/crm/deals/board');
    await expect(this.page).toHaveURL(/\/crm\/deals/);
  }

  async createContact(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  }) {
    await this.addContactButton.click();
    
    // Wait for form/modal to appear
    await expect(this.nameInput).toBeVisible();
    
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    
    if (data.company) {
      await this.companyInput.fill(data.company);
    }
    
    await this.saveButton.click();
  }

  async searchContact(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    // Wait for search results
    await this.page.waitForTimeout(500); // Small delay for search to process
  }

  async expectContactInList(name: string) {
    const contact = this.page.locator(`text="${name}"`);
    await expect(contact).toBeVisible();
  }

  async expectContactNotInList(name: string) {
    const contact = this.page.locator(`text="${name}"`);
    await expect(contact).not.toBeVisible();
  }

  async dragDealToStage(dealTitle: string, stageName: string) {
    const deal = this.page.locator(`[data-testid="deal-card"]:has-text("${dealTitle}"), .deal-card:has-text("${dealTitle}")`);
    const stage = this.page.locator(`[data-testid="pipeline-stage"]:has-text("${stageName}"), .pipeline-stage:has-text("${stageName}"), .column:has-text("${stageName}")`);
    
    await deal.dragTo(stage);
  }

  async expectDealInStage(dealTitle: string, stageName: string) {
    const stage = this.page.locator(`[data-testid="pipeline-stage"]:has-text("${stageName}"), .pipeline-stage:has-text("${stageName}"), .column:has-text("${stageName}")`);
    const dealInStage = stage.locator(`text="${dealTitle}"`);
    await expect(dealInStage).toBeVisible();
  }

  async createDeal(data: {
    title: string;
    value?: string;
    contact?: string;
    stage?: string;
  }) {
    await this.addDealButton.click();
    
    // Wait for form/modal
    const titleInput = this.page.locator('input[name="title"], input[placeholder*="título"], input[placeholder*="title"]');
    await expect(titleInput).toBeVisible();
    
    await titleInput.fill(data.title);
    
    if (data.value) {
      const valueInput = this.page.locator('input[name="value"], input[placeholder*="valor"], input[placeholder*="value"]');
      await valueInput.fill(data.value);
    }
    
    if (data.contact) {
      const contactSelect = this.page.locator('select[name="contact"], [data-testid="contact-select"]');
      await contactSelect.selectOption({ label: data.contact });
    }
    
    if (data.stage) {
      const stageSelect = this.page.locator('select[name="stage"], [data-testid="stage-select"]');
      await stageSelect.selectOption({ label: data.stage });
    }
    
    await this.saveButton.click();
  }

  async convertLeadToContact(leadName: string) {
    const leadRow = this.page.locator(`tr:has-text("${leadName}")`);
    const convertButton = leadRow.getByRole('button', { name: /converter|convert/i });
    await convertButton.click();
    
    // Confirm conversion if there's a confirmation dialog
    const confirmButton = this.page.getByRole('button', { name: /confirmar|confirm/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }
}
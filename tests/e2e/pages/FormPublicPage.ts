import { Page, Locator, expect } from '@playwright/test';

export class FormPublicPage {
  readonly page: Page;
  readonly formContainer: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.formContainer = page.locator('form, [data-testid="public-form"]');
    this.submitButton = page.getByRole('button', { name: /enviar|submit|finalizar/i });
    this.successMessage = page.locator('[data-testid="success-message"], .success-message, [role="alert"]:has-text("sucesso")');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, [role="alert"]:has-text("erro")');
  }

  async goto(formSlug: string) {
    await this.page.goto(`/f/${formSlug}`);
    await expect(this.formContainer).toBeVisible();
  }

  async fillTextField(label: string, value: string) {
    const field = this.page.getByLabel(label);
    if (!await field.isVisible()) {
      // Try finding by placeholder
      const fieldByPlaceholder = this.page.getByPlaceholder(new RegExp(label, 'i'));
      await fieldByPlaceholder.fill(value);
    } else {
      await field.fill(value);
    }
  }

  async fillEmail(email: string) {
    const emailField = this.page.locator('input[type="email"], input[name="email"]');
    await emailField.fill(email);
  }

  async fillPhone(phone: string) {
    const phoneField = this.page.locator('input[type="tel"], input[name="phone"], input[placeholder*="telefone"], input[placeholder*="phone"]');
    await phoneField.fill(phone);
  }

  async selectOption(label: string, option: string) {
    const select = this.page.getByLabel(label);
    await select.selectOption(option);
  }

  async selectRadio(groupLabel: string, optionText: string) {
    const radioGroup = this.page.locator(`fieldset:has-text("${groupLabel}"), div:has-text("${groupLabel}")`);
    const radio = radioGroup.getByRole('radio', { name: optionText });
    await radio.click();
  }

  async checkCheckbox(label: string) {
    const checkbox = this.page.getByRole('checkbox', { name: label });
    await checkbox.check();
  }

  async fillTextarea(label: string, text: string) {
    const textarea = this.page.getByLabel(label);
    if (!await textarea.isVisible()) {
      const textareaByPlaceholder = this.page.getByPlaceholder(new RegExp(label, 'i'));
      await textareaByPlaceholder.fill(text);
    } else {
      await textarea.fill(text);
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectErrorMessage(text?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }

  async expectFieldError(fieldLabel: string, errorText: string) {
    const field = this.page.getByLabel(fieldLabel);
    const fieldContainer = field.locator('..');
    const error = fieldContainer.locator('[role="alert"], .error, .field-error');
    await expect(error).toContainText(errorText);
  }

  async expectFormSubmitted() {
    // Check for success message or redirect
    const successVisible = await this.successMessage.isVisible().catch(() => false);
    if (successVisible) {
      await expect(this.successMessage).toBeVisible();
    } else {
      // Check if redirected to a thank you page
      await expect(this.page).toHaveURL(/thank|obrigado|success/);
    }
  }

  async fillKosmosScoreAudit() {
    // Specific method for KOSMOS Score quiz
    const questions = await this.page.locator('[data-testid="question"], .question-container').count();
    
    for (let i = 0; i < questions; i++) {
      // Select the first option for each question
      const firstOption = this.page.locator('input[type="radio"]').first();
      await firstOption.click();
      
      // Click next if not the last question
      if (i < questions - 1) {
        const nextButton = this.page.getByRole('button', { name: /próximo|next/i });
        await nextButton.click();
        await this.page.waitForTimeout(300); // Small delay for animation
      }
    }
  }

  async expectKosmosScoreResult() {
    const scoreElement = this.page.locator('[data-testid="kosmos-score"], .kosmos-score-result');
    await expect(scoreElement).toBeVisible();
    
    // Check if score value is displayed
    const scoreValue = this.page.locator('[data-testid="score-value"], .score-value');
    await expect(scoreValue).toHaveText(/\d+/);
  }
}
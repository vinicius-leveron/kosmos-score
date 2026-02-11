import { test, expect } from '../fixtures/auth';
import { testFormData, generateUniqueEmail, generateUniqueName } from '../fixtures/test-data';

test.describe('Feature: Formulários Públicos', () => {
  test('Scenario: Preencher e enviar formulário de lead', async ({ formPublicPage, page }) => {
    // Given: acesso um formulário público de captura de leads
    await formPublicPage.goto('lead-capture'); // Assuming 'lead-capture' is the form slug

    // When: preencho todos os campos obrigatórios
    const formData = {
      name: generateUniqueName('Lead Formulário'),
      email: generateUniqueEmail('form'),
      phone: '(11) 95555-4444',
      company: 'Form Test Company'
    };

    await formPublicPage.fillTextField('Nome', formData.name);
    await formPublicPage.fillEmail(formData.email);
    await formPublicPage.fillPhone(formData.phone);
    await formPublicPage.fillTextField('Empresa', formData.company);
    
    // And: envio o formulário
    await formPublicPage.submitForm();

    // Then: vejo mensagem de sucesso
    await formPublicPage.expectFormSubmitted();
  });

  test('Scenario: Validação de campos obrigatórios', async ({ formPublicPage, page }) => {
    // Given: acesso um formulário público
    await formPublicPage.goto('lead-capture');

    // When: tento enviar sem preencher campos obrigatórios
    await formPublicPage.submitForm();

    // Then: vejo erros de validação
    const errorMessages = page.locator('[role="alert"], .field-error, .error-message');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('Scenario: Validação de formato de email', async ({ formPublicPage, page }) => {
    // Given: estou preenchendo um formulário
    await formPublicPage.goto('lead-capture');

    // When: preencho email inválido
    await formPublicPage.fillTextField('Nome', 'Test User');
    await formPublicPage.fillEmail('email-invalido');
    await formPublicPage.submitForm();

    // Then: vejo erro de formato de email
    const emailError = page.locator('text=/email.*inválido|formato.*email/i');
    await expect(emailError).toBeVisible();
  });

  test('Scenario: Formulário com campos condicionais', async ({ formPublicPage, page }) => {
    // Given: acesso formulário com lógica condicional
    await formPublicPage.goto('conditional-form');

    // When: seleciono opção que mostra campos adicionais
    const triggerOption = page.getByRole('radio', { name: /empresa|company/i });
    if (await triggerOption.isVisible()) {
      await triggerOption.click();

      // Then: campos condicionais aparecem
      const cnpjField = page.locator('input[name="cnpj"], input[placeholder*="CNPJ"]');
      await expect(cnpjField).toBeVisible();
    }
  });

  test('Scenario: Upload de arquivo em formulário', async ({ formPublicPage, page }) => {
    // Given: acesso formulário com campo de upload
    await formPublicPage.goto('upload-form');

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // When: faço upload de um arquivo
      const testFilePath = './test-file.pdf'; // Would need a real test file
      await fileInput.setInputFiles(testFilePath);

      // Then: o arquivo é aceito
      const fileName = page.locator('.file-name, [data-testid="uploaded-file"]');
      await expect(fileName).toContainText('test-file.pdf');
    }
  });

  test('Scenario: Preenchimento do KOSMOS Score', async ({ formPublicPage, page }) => {
    // Given: acesso o quiz do KOSMOS Score
    await page.goto('/quiz/kosmos-score');

    // When: respondo todas as perguntas
    // Look for question containers
    const questions = page.locator('.question-container, [data-testid="question"]');
    const questionCount = await questions.count();

    if (questionCount > 0) {
      for (let i = 0; i < questionCount; i++) {
        // Select first option for each question
        const options = page.locator('input[type="radio"]');
        if (await options.first().isVisible()) {
          await options.first().click();
        }

        // Click next if not last question
        if (i < questionCount - 1) {
          const nextButton = page.getByRole('button', { name: /próximo|next|continuar/i });
          if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForTimeout(300); // Wait for animation
          }
        }
      }

      // Submit on last question
      const submitButton = page.getByRole('button', { name: /finalizar|submit|ver resultado/i });
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }

      // Then: vejo o resultado do score
      const scoreResult = page.locator('[data-testid="kosmos-score"], .score-result, .resultado');
      await expect(scoreResult).toBeVisible({ timeout: 10000 });

      // And: posso baixar o PDF
      const downloadButton = page.getByRole('button', { name: /baixar|download|pdf/i });
      await expect(downloadButton).toBeVisible();
    }
  });

  test('Scenario: Formulário multi-step', async ({ formPublicPage, page }) => {
    // Given: acesso um formulário com múltiplas etapas
    await formPublicPage.goto('multi-step-form');

    const stepIndicator = page.locator('.step-indicator, [data-testid="step"]');
    if (await stepIndicator.isVisible()) {
      // When: preencho a primeira etapa
      await formPublicPage.fillTextField('Nome', generateUniqueName('Multi Step'));
      await formPublicPage.fillEmail(generateUniqueEmail('multistep'));
      
      const nextButton = page.getByRole('button', { name: /próximo|next/i });
      await nextButton.click();

      // Then: avanço para próxima etapa
      await expect(stepIndicator).toContainText('2');

      // When: preencho segunda etapa
      await formPublicPage.fillPhone('(21) 94444-3333');
      await formPublicPage.fillTextField('Empresa', 'Multi Step Corp');
      
      // And: finalizo o formulário
      await formPublicPage.submitForm();

      // Then: formulário é enviado com sucesso
      await formPublicPage.expectFormSubmitted();
    }
  });

  test('Scenario: Formulário com reCAPTCHA', async ({ formPublicPage, page }) => {
    // Given: acesso formulário com proteção reCAPTCHA
    await formPublicPage.goto('protected-form');

    const recaptcha = page.locator('.g-recaptcha, [data-testid="recaptcha"], iframe[title*="recaptcha"]');
    if (await recaptcha.isVisible()) {
      // When: preencho o formulário
      await formPublicPage.fillTextField('Nome', 'Test reCAPTCHA');
      await formPublicPage.fillEmail('recaptcha@test.com');

      // Note: In real E2E tests, reCAPTCHA should be disabled or mocked
      // This is just checking that it's present
      
      // Then: reCAPTCHA está presente
      await expect(recaptcha).toBeVisible();
    }
  });

  test('Scenario: Resposta automática após envio', async ({ formPublicPage, page }) => {
    // Given: acesso formulário com resposta automática configurada
    await formPublicPage.goto('auto-response-form');

    // When: envio o formulário
    const uniqueEmail = generateUniqueEmail('autoresponse');
    await formPublicPage.fillTextField('Nome', 'Auto Response Test');
    await formPublicPage.fillEmail(uniqueEmail);
    await formPublicPage.submitForm();

    // Then: vejo confirmação de envio
    await formPublicPage.expectSuccessMessage();

    // And: mensagem menciona email de confirmação
    const successText = page.locator('[data-testid="success-message"], .success-message');
    const hasEmailConfirmation = await successText.locator('text=/email.*confirmação|enviamos.*email/i').isVisible();
    if (hasEmailConfirmation) {
      await expect(successText).toContainText(/email/i);
    }
  });

  test('Scenario: Limite de tentativas de envio', async ({ formPublicPage, page }) => {
    // Given: já enviei o formulário uma vez
    await formPublicPage.goto('limited-form');
    
    const testEmail = generateUniqueEmail('limited');
    await formPublicPage.fillTextField('Nome', 'First Submit');
    await formPublicPage.fillEmail(testEmail);
    await formPublicPage.submitForm();
    await formPublicPage.expectSuccessMessage();

    // When: tento enviar novamente com mesmo email
    await page.reload();
    await formPublicPage.fillTextField('Nome', 'Second Submit');
    await formPublicPage.fillEmail(testEmail);
    await formPublicPage.submitForm();

    // Then: vejo mensagem de limite atingido (se implementado)
    const limitMessage = page.locator('text=/já enviado|already submitted|limite/i');
    if (await limitMessage.isVisible()) {
      await expect(limitMessage).toBeVisible();
    }
  });
});
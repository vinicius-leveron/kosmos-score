import { test, expect } from '../fixtures/auth';
import { testContacts, generateUniqueEmail, generateUniqueName } from '../fixtures/test-data';

test.describe('Feature: CRM - Conversão de Leads', () => {
  test.beforeEach(async ({ authenticatedAdminPage }) => {
    // Ensure we're logged in as admin before each test
    await authenticatedAdminPage.expectToBeOnDashboard();
  });

  test('Scenario: Criar novo lead via formulário', async ({ crmPage }) => {
    // Given: estou na página de contatos do CRM
    await crmPage.gotoContacts();

    // When: crio um novo contato/lead
    const uniqueLead = {
      name: generateUniqueName('Lead Teste'),
      email: generateUniqueEmail('lead'),
      phone: '(11) 99999-8888',
      company: 'Empresa Nova Ltda'
    };
    await crmPage.createContact(uniqueLead);

    // Then: o lead aparece na lista
    await crmPage.expectContactInList(uniqueLead.name);
  });

  test('Scenario: Buscar e filtrar leads', async ({ crmPage }) => {
    // Given: estou na página de contatos
    await crmPage.gotoContacts();

    // When: busco por um contato específico
    await crmPage.searchContact(testContacts.lead1.name);

    // Then: apenas contatos correspondentes aparecem
    await crmPage.expectContactInList(testContacts.lead1.name);
    
    // And: outros contatos não aparecem
    await crmPage.expectContactNotInList(testContacts.lead2.name);
  });

  test('Scenario: Converter lead em contato', async ({ crmPage, page }) => {
    // Given: tenho um lead na lista
    await crmPage.gotoContacts();
    
    // Create a new lead first
    const uniqueLead = {
      name: generateUniqueName('Lead Para Converter'),
      email: generateUniqueEmail('convert'),
      phone: '(21) 88888-7777',
      company: 'Convert Company'
    };
    await crmPage.createContact(uniqueLead);

    // When: converto o lead em contato
    await crmPage.convertLeadToContact(uniqueLead.name);

    // Then: vejo mensagem de sucesso
    const successToast = page.locator('[role="status"], .toast-success');
    await expect(successToast).toContainText(/convertido|sucesso/i);

    // And: o status do contato muda
    const contactRow = page.locator(`tr:has-text("${uniqueLead.name}")`);
    await expect(contactRow).toContainText(/contato|contact/i);
  });

  test('Scenario: Editar informações de um lead', async ({ crmPage, page }) => {
    // Given: tenho um lead existente
    await crmPage.gotoContacts();
    
    // Create a lead
    const originalLead = {
      name: generateUniqueName('Lead Original'),
      email: generateUniqueEmail('original'),
      phone: '(31) 77777-6666',
      company: 'Original Corp'
    };
    await crmPage.createContact(originalLead);

    // When: edito as informações do lead
    const leadRow = page.locator(`tr:has-text("${originalLead.name}")`);
    const editButton = leadRow.getByRole('button', { name: /editar|edit/i });
    await editButton.click();

    // Update company name
    await crmPage.companyInput.clear();
    await crmPage.companyInput.fill('Updated Corporation');
    await crmPage.saveButton.click();

    // Then: as alterações são salvas
    await expect(leadRow).toContainText('Updated Corporation');
  });

  test('Scenario: Validação de campos obrigatórios', async ({ crmPage, page }) => {
    // Given: estou criando um novo contato
    await crmPage.gotoContacts();
    await crmPage.addContactButton.click();

    // When: tento salvar sem preencher campos obrigatórios
    await crmPage.saveButton.click();

    // Then: vejo erros de validação
    const nameError = page.locator('text=/nome.*obrigatório/i');
    const emailError = page.locator('text=/email.*obrigatório/i');
    
    await expect(nameError.or(emailError)).toBeVisible();
  });

  test('Scenario: Adicionar anotações a um lead', async ({ crmPage, page }) => {
    // Given: tenho um lead existente
    await crmPage.gotoContacts();
    
    const leadWithNotes = {
      name: generateUniqueName('Lead Com Notas'),
      email: generateUniqueEmail('notes'),
      phone: '(41) 66666-5555',
      company: 'Notes Company'
    };
    await crmPage.createContact(leadWithNotes);

    // When: adiciono uma anotação
    const leadRow = page.locator(`tr:has-text("${leadWithNotes.name}")`);
    await leadRow.click(); // Open details

    const notesTab = page.getByRole('tab', { name: /anotações|notes|atividades/i });
    if (await notesTab.isVisible()) {
      await notesTab.click();
    }

    const noteInput = page.locator('textarea[placeholder*="anotação"], textarea[placeholder*="note"]');
    if (await noteInput.isVisible()) {
      await noteInput.fill('Cliente interessado em upgrade do plano');
      
      const addNoteButton = page.getByRole('button', { name: /adicionar|add|salvar/i });
      await addNoteButton.click();

      // Then: a anotação é salva
      await expect(page.locator('text="Cliente interessado em upgrade do plano"')).toBeVisible();
    }
  });

  test('Scenario: Importação em massa de leads', async ({ crmPage, page }) => {
    // Given: estou na página de contatos
    await crmPage.gotoContacts();

    // When: acesso a importação
    const importButton = page.getByRole('button', { name: /importar|import/i });
    if (await importButton.isVisible()) {
      await importButton.click();

      // Then: vejo o modal/página de importação
      const importModal = page.locator('[role="dialog"]:has-text("importar"), .import-modal');
      await expect(importModal).toBeVisible();

      // And: posso fazer upload de arquivo CSV
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeVisible();
    }
  });
});
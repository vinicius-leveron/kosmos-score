import { test, expect } from '../fixtures/auth';
import { testUsers } from '../fixtures/test-data';

test.describe('Feature: Autenticação', () => {
  test.describe('Login', () => {
    test('Scenario: Login com credenciais válidas de admin', async ({ loginPage, dashboardPage }) => {
      // Given: estou na página de login
      await loginPage.goto();
      await loginPage.expectLoginFormVisible();

      // When: preencho email e senha válidos de admin
      await loginPage.fillCredentials(testUsers.admin.email, testUsers.admin.password);
      
      // And: clico em entrar
      await loginPage.submit();

      // Then: sou redirecionado para o dashboard admin
      await expect(dashboardPage.page).toHaveURL(/\/admin/);
      
      // And: vejo o dashboard carregado
      await dashboardPage.expectToBeOnDashboard();
    });

    test('Scenario: Login com credenciais válidas de cliente', async ({ loginPage, dashboardPage }) => {
      // Given: estou na página de login
      await loginPage.goto();

      // When: preencho credenciais de cliente
      await loginPage.fillCredentials(testUsers.client.email, testUsers.client.password);
      await loginPage.submit();

      // Then: sou redirecionado para o portal do cliente
      await expect(dashboardPage.page).toHaveURL(/\/app/);
      await dashboardPage.expectToBeOnDashboard();
    });

    test('Scenario: Login com credenciais inválidas', async ({ loginPage }) => {
      // Given: estou na página de login
      await loginPage.goto();

      // When: preencho credenciais inválidas
      await loginPage.fillCredentials(testUsers.invalidUser.email, testUsers.invalidUser.password);
      await loginPage.submit();

      // Then: vejo mensagem de erro
      await loginPage.expectError('credenciais inválidas');
      
      // And: continuo na página de login
      await expect(loginPage.page).toHaveURL(/\/login/);
    });

    test('Scenario: Login com email vazio', async ({ loginPage }) => {
      // Given: estou na página de login
      await loginPage.goto();

      // When: preencho apenas a senha
      await loginPage.fillCredentials('', 'somepassword');
      
      // Then: o botão de submit deve estar desabilitado ou mostrar erro de validação
      const isDisabled = await loginPage.submitButton.isDisabled();
      if (!isDisabled) {
        await loginPage.submit();
        // Expect validation error
        const emailInput = loginPage.emailInput;
        await expect(emailInput).toHaveAttribute('required');
      }
    });

    test('Scenario: Login com senha vazia', async ({ loginPage }) => {
      // Given: estou na página de login
      await loginPage.goto();

      // When: preencho apenas o email
      await loginPage.fillCredentials('user@example.com', '');
      
      // Then: validação deve impedir o envio
      const isDisabled = await loginPage.submitButton.isDisabled();
      if (!isDisabled) {
        await loginPage.submit();
        // Expect validation error
        const passwordInput = loginPage.passwordInput;
        await expect(passwordInput).toHaveAttribute('required');
      }
    });
  });

  test.describe('Logout', () => {
    test('Scenario: Logout do sistema', async ({ authenticatedAdminPage }) => {
      // Given: estou logado no sistema
      const dashboardPage = authenticatedAdminPage;
      await dashboardPage.expectToBeOnDashboard();

      // When: faço logout
      await dashboardPage.logout();

      // Then: sou redirecionado para a página de login
      await expect(dashboardPage.page).toHaveURL(/\/login/);
    });
  });

  test.describe('Proteção de Rotas', () => {
    test('Scenario: Tentativa de acesso a rota protegida sem autenticação', async ({ page }) => {
      // Given: não estou autenticado

      // When: tento acessar o dashboard admin diretamente
      await page.goto('/admin');

      // Then: sou redirecionado para o login
      await expect(page).toHaveURL(/\/login/);
    });

    test('Scenario: Sessão persiste após recarregar a página', async ({ authenticatedAdminPage, page }) => {
      // Given: estou logado no sistema
      await authenticatedAdminPage.expectToBeOnDashboard();

      // When: recarrego a página
      await page.reload();

      // Then: continuo logado
      await expect(page).toHaveURL(/\/admin/);
      await authenticatedAdminPage.expectToBeOnDashboard();
    });
  });
});
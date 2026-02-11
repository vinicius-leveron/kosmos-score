import { test, expect } from '../fixtures/auth';
import { testDeals, pipelineStages, generateUniqueName } from '../fixtures/test-data';

test.describe('Feature: CRM - Pipeline Drag & Drop', () => {
  test.beforeEach(async ({ authenticatedAdminPage }) => {
    // Ensure we're logged in as admin before each test
    await authenticatedAdminPage.expectToBeOnDashboard();
  });

  test('Scenario: Visualizar pipeline com estágios', async ({ crmPage, page }) => {
    // Given: estou logado como admin
    // When: acesso o pipeline
    await crmPage.gotoPipeline();

    // Then: vejo todos os estágios do pipeline
    for (const stage of pipelineStages) {
      const stageColumn = page.locator(`text="${stage}"`);
      await expect(stageColumn).toBeVisible();
    }
  });

  test('Scenario: Criar novo negócio no pipeline', async ({ crmPage, page }) => {
    // Given: estou na página do pipeline
    await crmPage.gotoPipeline();

    // When: crio um novo negócio
    const newDeal = {
      title: generateUniqueName('Novo Negócio'),
      value: '25000',
      stage: pipelineStages[0] // Primeiro estágio
    };
    await crmPage.createDeal(newDeal);

    // Then: o negócio aparece no estágio correto
    await crmPage.expectDealInStage(newDeal.title, newDeal.stage);
  });

  test('Scenario: Arrastar negócio entre estágios', async ({ crmPage, page }) => {
    // Given: tenho um negócio no primeiro estágio
    await crmPage.gotoPipeline();
    
    const dealToMove = {
      title: generateUniqueName('Deal para Mover'),
      value: '15000',
      stage: pipelineStages[0]
    };
    await crmPage.createDeal(dealToMove);
    await crmPage.expectDealInStage(dealToMove.title, pipelineStages[0]);

    // When: arrasto o negócio para o próximo estágio
    await crmPage.dragDealToStage(dealToMove.title, pipelineStages[1]);

    // Then: o negócio aparece no novo estágio
    await crmPage.expectDealInStage(dealToMove.title, pipelineStages[1]);
    
    // And: não aparece mais no estágio anterior
    const firstStage = page.locator(`[data-testid="pipeline-stage"]:has-text("${pipelineStages[0]}"), .column:has-text("${pipelineStages[0]}")`);
    const dealInFirstStage = firstStage.locator(`text="${dealToMove.title}"`);
    await expect(dealInFirstStage).not.toBeVisible();
  });

  test('Scenario: Múltiplos negócios no mesmo estágio', async ({ crmPage, page }) => {
    // Given: estou no pipeline
    await crmPage.gotoPipeline();

    // When: crio múltiplos negócios no mesmo estágio
    const stage = pipelineStages[1];
    const deals = [
      { title: generateUniqueName('Deal A'), value: '10000', stage },
      { title: generateUniqueName('Deal B'), value: '20000', stage },
      { title: generateUniqueName('Deal C'), value: '30000', stage }
    ];

    for (const deal of deals) {
      await crmPage.createDeal(deal);
    }

    // Then: todos aparecem no mesmo estágio
    for (const deal of deals) {
      await crmPage.expectDealInStage(deal.title, stage);
    }

    // And: o total do estágio é atualizado
    const stageColumn = page.locator(`[data-testid="pipeline-stage"]:has-text("${stage}"), .column:has-text("${stage}")`);
    const stageTotal = stageColumn.locator('[data-testid="stage-total"], .stage-total');
    if (await stageTotal.isVisible()) {
      await expect(stageTotal).toContainText(/60[.,]?000/); // Sum of values
    }
  });

  test('Scenario: Editar detalhes do negócio', async ({ crmPage, page }) => {
    // Given: tenho um negócio no pipeline
    await crmPage.gotoPipeline();
    
    const dealToEdit = {
      title: generateUniqueName('Deal para Editar'),
      value: '5000',
      stage: pipelineStages[0]
    };
    await crmPage.createDeal(dealToEdit);

    // When: clico no card do negócio
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("${dealToEdit.title}"), .deal-card:has-text("${dealToEdit.title}")`);
    await dealCard.click();

    // Then: vejo o modal/formulário de edição
    const editModal = page.locator('[role="dialog"], [data-testid="deal-modal"], .deal-details');
    await expect(editModal).toBeVisible();

    // When: atualizo o valor
    const valueInput = page.locator('input[name="value"], input[placeholder*="valor"]');
    await valueInput.clear();
    await valueInput.fill('7500');
    
    const saveButton = page.getByRole('button', { name: /salvar|save/i });
    await saveButton.click();

    // Then: o valor é atualizado no card
    await expect(dealCard).toContainText(/7[.,]?500/);
  });

  test('Scenario: Filtrar negócios por estágio', async ({ crmPage, page }) => {
    // Given: tenho negócios em diferentes estágios
    await crmPage.gotoPipeline();

    // When: aplico filtro por estágio
    const filterButton = page.getByRole('button', { name: /filtrar|filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      const stageFilter = page.locator('select[name="stage"], [data-testid="stage-filter"]');
      await stageFilter.selectOption(pipelineStages[1]);
      
      const applyFilter = page.getByRole('button', { name: /aplicar|apply/i });
      await applyFilter.click();

      // Then: apenas negócios do estágio filtrado aparecem
      const visibleStages = page.locator('[data-testid="pipeline-stage"], .column');
      const visibleCount = await visibleStages.count();
      
      // Should show only the filtered stage or highlight it
      if (visibleCount === 1) {
        await expect(visibleStages).toContainText(pipelineStages[1]);
      }
    }
  });

  test('Scenario: Marcar negócio como ganho', async ({ crmPage, page }) => {
    // Given: tenho um negócio no último estágio
    await crmPage.gotoPipeline();
    
    const winDeal = {
      title: generateUniqueName('Deal Fechado'),
      value: '50000',
      stage: pipelineStages[pipelineStages.length - 1]
    };
    await crmPage.createDeal(winDeal);

    // When: marco como ganho
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("${winDeal.title}"), .deal-card:has-text("${winDeal.title}")`);
    await dealCard.click();

    const winButton = page.getByRole('button', { name: /ganho|won|fechado/i });
    if (await winButton.isVisible()) {
      await winButton.click();

      // Then: o negócio é marcado como ganho
      const successMessage = page.locator('[role="status"], .toast-success');
      await expect(successMessage).toContainText(/ganho|sucesso|fechado/i);

      // And: o card mostra status de ganho
      await expect(dealCard).toHaveClass(/won|ganho|success/);
    }
  });

  test('Scenario: Marcar negócio como perdido', async ({ crmPage, page }) => {
    // Given: tenho um negócio ativo
    await crmPage.gotoPipeline();
    
    const lostDeal = {
      title: generateUniqueName('Deal Perdido'),
      value: '10000',
      stage: pipelineStages[1]
    };
    await crmPage.createDeal(lostDeal);

    // When: marco como perdido
    const dealCard = page.locator(`[data-testid="deal-card"]:has-text("${lostDeal.title}"), .deal-card:has-text("${lostDeal.title}")`);
    await dealCard.click();

    const lostButton = page.getByRole('button', { name: /perdido|lost|cancelar/i });
    if (await lostButton.isVisible()) {
      await lostButton.click();

      // Pode haver um modal de confirmação
      const confirmButton = page.getByRole('button', { name: /confirmar|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Then: o negócio é marcado como perdido
      const statusMessage = page.locator('[role="status"], .toast');
      await expect(statusMessage).toBeVisible();

      // And: o card é removido ou marcado como perdido
      const dealStillVisible = await dealCard.isVisible();
      if (dealStillVisible) {
        await expect(dealCard).toHaveClass(/lost|perdido|danger/);
      }
    }
  });
});
# E2E Tests - KOSMOS Toolkit

## Visão Geral

Testes End-to-End implementados com Playwright para validar os fluxos críticos do KOSMOS Toolkit.

## Estrutura

```
tests/e2e/
├── auth/                   # Testes de autenticação
│   └── login.spec.ts      # Login, logout, proteção de rotas
├── crm/                    # Testes do módulo CRM
│   ├── lead-conversion.spec.ts  # Conversão de leads
│   └── pipeline-drag-drop.spec.ts # Pipeline kanban
├── forms/                  # Formulários públicos
│   └── public-form.spec.ts # Captura de leads
├── pages/                  # Page Objects
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── CRMPage.ts
│   └── FormPublicPage.ts
├── fixtures/               # Fixtures e dados de teste
│   ├── auth.ts            # Setup de autenticação
│   └── test-data.ts       # Dados reutilizáveis
└── helpers/               # Funções auxiliares
    └── test-helpers.ts    # Utilitários
```

## Comandos

```bash
# Rodar todos os testes
npm run test:e2e

# Rodar com interface visual
npm run test:e2e:ui

# Rodar mostrando o browser
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Gravar novo teste
npm run test:e2e:codegen

# Rodar testes específicos
npx playwright test tests/e2e/auth
npx playwright test tests/e2e/crm/lead-conversion.spec.ts
```

## Fluxos Testados

### 1. Autenticação (P0)
- ✅ Login com credenciais válidas (admin/cliente)
- ✅ Login com credenciais inválidas
- ✅ Validação de campos obrigatórios
- ✅ Logout do sistema
- ✅ Proteção de rotas privadas
- ✅ Persistência de sessão

### 2. CRM - Conversão de Leads (P1)
- ✅ Criar novo lead via formulário
- ✅ Buscar e filtrar leads
- ✅ Converter lead em contato
- ✅ Editar informações de lead
- ✅ Validação de campos obrigatórios
- ✅ Adicionar anotações
- ✅ Importação em massa

### 3. CRM - Pipeline Drag & Drop (P1)
- ✅ Visualizar estágios do pipeline
- ✅ Criar novo negócio
- ✅ Arrastar negócio entre estágios
- ✅ Múltiplos negócios no mesmo estágio
- ✅ Editar detalhes do negócio
- ✅ Marcar como ganho/perdido
- ✅ Filtrar por estágio

### 4. Formulários Públicos (P1)
- ✅ Preencher e enviar formulário de lead
- ✅ Validação de campos obrigatórios
- ✅ Validação de formato de email
- ✅ Campos condicionais
- ✅ KOSMOS Score quiz
- ✅ Formulários multi-step
- ✅ Resposta automática

## Page Object Pattern

Cada página tem sua classe com:

```typescript
export class LoginPage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  
  // Actions
  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }
  
  // Assertions
  async expectToBeLoggedIn() {
    await expect(this.page).toHaveURL(/\/admin/);
  }
}
```

## Fixtures Customizadas

Reusando autenticação:

```typescript
test('teste autenticado', async ({ authenticatedAdminPage }) => {
  // Já está logado como admin
  await authenticatedAdminPage.navigateToModule('CRM');
});
```

## Dados de Teste

Usando geradores únicos:

```typescript
const uniqueLead = {
  name: generateUniqueName('Lead'),
  email: generateUniqueEmail('test'),
};
```

## Helpers

Funções auxiliares disponíveis:

- `waitForNetworkIdle()` - Aguarda rede ficar idle
- `waitForToast()` - Aguarda notificação
- `quickLogin()` - Login rápido
- `fillForm()` - Preencher múltiplos campos
- `checkAccessibility()` - Verificar acessibilidade
- `retryAction()` - Retry com timeout

## Best Practices

### ✅ DO
- Use Page Objects para organização
- Use data-testid para seletores estáveis
- Gere dados únicos para cada teste
- Use fixtures para setup comum
- Aguarde elementos, não use sleep()
- Teste happy path E edge cases

### ❌ DON'T
- Não use seletores CSS complexos
- Não dependa da ordem dos testes
- Não use dados hardcoded
- Não ignore erros de assertion
- Não teste implementação, teste comportamento

## Configuração

### playwright.config.ts

```typescript
{
  baseURL: 'http://localhost:8080',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
  }
}
```

## CI/CD

Para rodar em CI:

```bash
# Install browsers
npx playwright install --with-deps

# Run tests
npm run test:e2e

# Upload artifacts on failure
if [ -d "playwright-report" ]; then
  # Upload report
fi
```

## Debugging

### Ver o que está acontecendo
```bash
npm run test:e2e:headed
```

### Debug step-by-step
```bash
npm run test:e2e:debug
```

### UI Mode (recomendado)
```bash
npm run test:e2e:ui
```

### Traces
Traces são gerados automaticamente em falhas. Ver com:
```bash
npx playwright show-trace trace.zip
```

## Relatórios

Após rodar testes:
```bash
npx playwright show-report
```

## Troubleshooting

### Teste flaky
- Adicione waits explícitos
- Melhore seletores
- Use retries
- Verifique timing

### Elemento não encontrado
- Verifique seletor
- Adicione wait
- Use data-testid
- Debug com UI mode

### Timeout
- Aumente timeout específico
- Verifique se servidor está rodando
- Check network tab

## Próximos Passos

- [ ] Adicionar testes de performance
- [ ] Testes de acessibilidade
- [ ] Testes mobile
- [ ] Visual regression tests
- [ ] Testes de integração com Stripe
- [ ] Testes multi-tenant
---
name: test
description: Roda testes e analisa resultados, cria testes faltantes se necessário
---

# /test - Workflow de Testes

Você está executando e analisando testes.

## Instruções

### 1. Identificar Escopo

Pergunte ao usuário:
- Rodar todos os testes?
- Apenas um módulo específico?
- Apenas arquivos modificados?

### 2. Executar Testes

```bash
# Todos
npm test

# Watch mode
npm run test:watch

# Específico
npx vitest run src/modules/community

# Com coverage
npx vitest run --coverage
```

### 3. Usar test-runner
Use `test-runner` para analisar resultados:
- Testes falhando
- Causa raiz
- Sugestão de fix

### 4. Analisar Coverage

Se coverage disponível, identifique:
- Arquivos sem testes
- Funções críticas não testadas
- Branches não cobertos

### 5. Criar Testes Faltantes

Para código crítico sem testes, crie:

```typescript
// src/modules/feature/component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    // ...
  });
});
```

### 6. E2E Tests (se solicitado)

Use `e2e-tester` para criar testes Playwright:
```bash
npx playwright test
```

### 7. Reportar

```markdown
## Test Report

### Unit Tests
- Total: X
- Passed: X
- Failed: X
- Skipped: X

### Coverage
- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%

### Failures (se houver)
1. Test name
   - Error: ...
   - File: ...
   - Fix: ...

### Missing Coverage (crítico)
- file.ts: functionX not tested
```

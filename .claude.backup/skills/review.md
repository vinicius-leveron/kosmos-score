---
name: review
description: Executa review completo do código (qualidade, segurança, UX, performance)
---

# /review - Review Completo de Código

Você está executando um review completo do código recente.

## Instruções

### 1. Identificar Mudanças

```bash
git diff HEAD~5 --name-only  # Últimos 5 commits
# ou
git diff main --name-only    # Mudanças desde main
```

### 2. Executar Reviews em Paralelo

Lance os seguintes subagentes simultaneamente:

#### Qualidade de Código
Use `code-reviewer`:
- Clean code
- TypeScript types
- React best practices
- DRY/SOLID

#### Segurança
Use `saas-security-auditor`:
- Vulnerabilidades OWASP
- Multi-tenant isolation
- Secrets exposure
- Input validation

#### UX/Acessibilidade
Use `ux-reviewer`:
- Usabilidade
- Consistência visual
- Acessibilidade WCAG

#### Performance
Use `performance-analyzer`:
- Bundle size
- Re-renders desnecessários
- Memory leaks

### 3. Validar RLS (se houver mudanças em DB)

Se houver mudanças em `supabase/migrations/`:
Use `rls-validator`

### 4. Rodar Testes

Use `test-runner`:
```bash
npm test
```

### 5. Consolidar Resultados

Apresente relatório consolidado:

```markdown
## Review Report

### Sumário
- Código: X issues
- Segurança: X issues
- UX: X issues
- Performance: X issues
- Testes: PASS/FAIL

### Issues Críticas (Bloqueia merge)
1. ...

### Issues Importantes (Deve corrigir)
1. ...

### Sugestões (Nice to have)
1. ...

### O que está bom
- ...
```

### 6. Perguntar
"Quer que eu corrija as issues críticas e importantes?"

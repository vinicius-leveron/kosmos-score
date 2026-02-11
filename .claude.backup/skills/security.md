---
name: security
description: Executa auditoria de segurança completa focada em multi-tenant SaaS
---

# /security - Auditoria de Segurança

Você está executando uma auditoria de segurança completa do KOSMOS Toolkit.

## Instruções

### 1. Escopo

Pergunte ao usuário:
- Auditoria completa ou focada?
- Se focada, qual área? (auth, RLS, API, frontend, payments)

### 2. Executar Auditorias em Paralelo

#### Segurança SaaS
Use `saas-security-auditor`:
- Tenant isolation
- Data leakage
- Privilege escalation
- OWASP Top 10

#### RLS Policies
Use `rls-validator`:
- Todas tabelas com RLS
- Policies corretas
- Sem bypasses

#### Acessibilidade (relacionado a segurança)
Use `accessibility-auditor`:
- Forms acessíveis ajudam em segurança (labels corretos)

### 3. Checklist Manual

Verificar manualmente:

#### Secrets
```bash
# Buscar hardcoded secrets
grep -r "sk_live\|pk_live\|password\|secret\|apiKey" src/
grep -r "SUPABASE_SERVICE_ROLE" src/
```

#### Env Files
```bash
# Verificar .gitignore
cat .gitignore | grep -E "\.env|secret|credential"
```

#### Dependencies
```bash
# Vulnerabilidades conhecidas
npm audit
```

### 4. Verificar Multi-Tenant Específico

- [ ] Usuário não pode acessar dados de outro workspace
- [ ] Usuário não pode manipular workspace_id em requests
- [ ] Admin de um workspace não vira admin de outro
- [ ] Dados de auditoria (logs) também são isolados

### 5. Verificar Payments (Stripe)

- [ ] Webhook signature verificada
- [ ] Preços não manipuláveis client-side
- [ ] Subscription status verificado server-side
- [ ] Não expõe dados de pagamento de outros customers

### 6. Verificar Auth

- [ ] Sessions invalidadas no logout
- [ ] Tokens expiram corretamente
- [ ] Password reset seguro
- [ ] Rate limiting em login
- [ ] MFA disponível (se aplicável)

### 7. Consolidar Relatório

```markdown
# Security Audit Report - KOSMOS Toolkit

**Data:** YYYY-MM-DD
**Auditor:** Claude Code

## Executive Summary
- Crítico: X
- Alto: X
- Médio: X
- Baixo: X

## Tenant Isolation: PASS/FAIL
- RLS: X/Y tabelas compliant
- Issues: ...

## Authentication: PASS/FAIL
- Issues: ...

## Data Protection: PASS/FAIL
- Issues: ...

## Payment Security: PASS/FAIL
- Issues: ...

## Critical Issues (Fix BEFORE Deploy)

### SEC-001: [Title]
**Severity:** CRITICAL
**Location:** file:line
**Risk:** O que pode acontecer
**Fix:** Como resolver
**Code:**
```
código de fix
```

## High Priority Issues
...

## Recommendations
1. ...
2. ...

## Passed Checks
- [x] Check 1
- [x] Check 2
```

### 8. Perguntar
"Há X issues críticas. Quer que eu corrija automaticamente?"

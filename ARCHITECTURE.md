# Decisões Arquiteturais - KOSMOS Toolkit

Este documento registra as decisões técnicas importantes do projeto.

## ADR-001: Monorepo Simples vs Turborepo

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Precisamos de uma estrutura que suporte múltiplos módulos (Score, Community, Monetization, Content, Analytics) com código compartilhado.

### Decisão
Usar **monorepo simples** com estrutura de pastas organizada, sem ferramentas como Turborepo ou Nx.

### Justificativa
- Time pequeno (1-3 pessoas)
- Módulos fortemente acoplados (mesma auth, tenant, design system)
- Build ainda rápido (< 1min)
- Menor complexidade operacional

### Migração Futura
Migrar para Turborepo quando:
- Time crescer (+3 devs)
- Build ultrapassar 2min
- Precisar de deploys independentes por módulo

---

## ADR-002: Multi-Tenancy com RLS

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Precisamos isolar dados entre clientes (tenants) de forma segura.

### Decisão
Usar **Row Level Security (RLS)** do PostgreSQL/Supabase com coluna `workspace_id`.

### Alternativas Consideradas
1. **Schema por tenant** - Complexidade alta, custo elevado
2. **Database por tenant** - Overkill para nossa escala
3. **Filtro na aplicação** - Risco de vazamento de dados

### Justificativa
- Nativo do Supabase
- Segurança no nível do banco
- Sem overhead de gerenciar múltiplos schemas
- Escalável até milhares de tenants

---

## ADR-003: Supabase como Backend

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Precisamos de auth, database, storage e funções serverless.

### Decisão
Usar **Supabase** como backend principal.

### Justificativa
- Auth pronto (email, social, MFA)
- PostgreSQL com RLS
- Realtime subscriptions
- Storage integrado
- Edge Functions (Deno)
- Pricing previsível
- Auto-generated types

### Trade-offs
- Vendor lock-in moderado
- Menos flexibilidade que backend custom

---

## ADR-004: shadcn/ui para Design System

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Precisamos de componentes UI consistentes e customizáveis.

### Decisão
Usar **shadcn/ui** como base do design system.

### Justificativa
- Componentes copiados para o projeto (não dependência)
- Totalmente customizável
- Baseado em Radix UI (acessível)
- Tailwind CSS nativo
- Comunidade ativa

---

## ADR-005: Sistema de Módulos

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Features precisam ser habilitadas/desabilitadas por plano de assinatura.

### Decisão
Cada módulo exporta um **manifest** com metadados, e um **ModuleGuard** verifica acesso baseado no plano.

### Estrutura do Manifest
```typescript
{
  id: 'module-id',
  name: 'Display Name',
  plans: ['pro', 'enterprise'],
  permissions: ['module:read', 'module:write'],
  navigation: [...],
  routes: () => import('./routes'),
}
```

### Justificativa
- Lazy loading automático
- Fácil adicionar novos módulos
- Controle granular de acesso
- Navegação dinâmica

---

## ADR-006: React Query para Estado de Servidor

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Precisamos gerenciar dados do servidor (cache, refetch, loading states).

### Decisão
Usar **TanStack Query (React Query)** para todo estado de servidor.

### Justificativa
- Cache automático
- Refetch em background
- Optimistic updates
- Deduplicação de requests
- DevTools excelentes

### Padrão
```typescript
// Todo query inclui workspace no key
queryKey: ['resource', workspace?.id, ...params]
```

---

## ADR-007: Zod para Validação

**Data:** 2026-02-07
**Status:** Aceito

### Contexto
Precisamos validar inputs de usuário e dados de API.

### Decisão
Usar **Zod** para todas as validações.

### Justificativa
- TypeScript-first
- Inferência de tipos automática
- Integra com React Hook Form
- Mensagens de erro customizáveis
- Validação em runtime

---

## Próximas Decisões

- [ ] Escolher provedor de email transacional
- [ ] Definir estratégia de caching (Redis?)
- [ ] Escolher ferramenta de monitoramento/APM
- [ ] Definir estratégia de backup

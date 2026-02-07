# KOSMOS Toolkit - Guia para Claude

Este arquivo é lido automaticamente pelo Claude Code para entender o contexto e regras do projeto.

## Visão Geral

**KOSMOS Toolkit** é uma plataforma SaaS multi-tenant para gestão de comunidades digitais.

### Módulos
1. **KOSMOS Score** - Diagnóstico de ativos digitais (público, lead magnet)
2. **Community** - CRM, membros, engajamento
3. **Monetization** - Checkout, assinaturas, afiliados
4. **Content** - Cursos, área de membros
5. **Analytics** - Métricas e dashboards

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite + SWC |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, DB, Storage, Edge Functions) |
| State | TanStack Query + React Context |
| Forms | React Hook Form + Zod |
| Payments | Stripe |

## Arquitetura Multi-Tenant

```
Organization (cliente pagante)
└── Workspace (ambiente de trabalho)
    └── Dados isolados via RLS (workspace_id)
```

### Regras de Segurança (CRÍTICAS)

1. **Toda tabela tenant-scoped DEVE ter:**
   - Coluna `workspace_id UUID NOT NULL REFERENCES workspaces(id)`
   - RLS habilitado: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
   - Policies para SELECT, INSERT, UPDATE, DELETE
   - Index em workspace_id

2. **Exceções (tabelas públicas):**
   - `audit_results` - Lead magnet público
   - `plans` - Planos do sistema

3. **Usar sempre:**
   - `get_current_workspace_id()` nas policies RLS
   - Parameterized queries (nunca concatenar SQL)

## Estrutura de Pastas

```
src/
├── core/           # Infraestrutura (auth, tenant, modules)
├── design-system/  # Componentes compartilhados
├── modules/        # Features isoladas
│   ├── kosmos-score/
│   ├── community/
│   ├── monetization/
│   ├── content/
│   └── analytics/
└── app/            # Shell da aplicação
```

## Padrões de Código

### Componentes

```tsx
// Sempre usar TypeScript interfaces
interface ComponentProps {
  /** Descrição do prop */
  propName: string;
  className?: string;
}

// Exportar da forma correta
export function Component({ propName, className }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {/* ... */}
    </div>
  );
}
```

### Hooks de API

```tsx
// Usar React Query com tenant context
export function useMembers() {
  const { workspace } = useTenant();

  return useQuery({
    queryKey: ['members', workspace?.id],
    queryFn: () => supabase
      .from('community_members')
      .select('*')
      .eq('workspace_id', workspace?.id),
    enabled: !!workspace,
  });
}
```

### Módulos

```tsx
// Cada módulo exporta um manifest
export const moduleManifest: ModuleManifest = {
  id: 'module-name',
  name: 'Display Name',
  plans: ['pro', 'enterprise'],
  navigation: [...],
  routes: () => import('./routes'),
};
```

## Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `MemberCard.tsx` |
| Hooks | camelCase, prefixo `use` | `useMembers.ts` |
| Utilitários | camelCase | `formatDate.ts` |
| Tipos | PascalCase, sufixo opcional | `Member`, `MemberProps` |
| Constantes | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| DB tables | snake_case | `community_members` |
| DB columns | snake_case | `workspace_id` |

## Testes

```bash
npm test              # Rodar todos os testes
npm run test:watch    # Watch mode
npx playwright test   # E2E tests
```

### Estrutura de Testes
- Unitários: `src/**/*.test.ts`
- E2E: `tests/e2e/**/*.spec.ts`

## Comandos Úteis

```bash
npm run dev          # Dev server (porta 8080)
npm run build        # Build produção
npm run lint         # ESLint
supabase db push     # Aplicar migrations
supabase gen types   # Gerar tipos TypeScript
```

## Subagentes Disponíveis

Use `subagente X para [tarefa]` no seu prompt:

| Agente | Quando Usar |
|--------|-------------|
| `pm-orchestrator` | Planejar features complexas, coordenar trabalho paralelo |
| `feature-planner` | Pesquisar e planejar antes de implementar |
| `db-architect` | Criar/modificar schema do banco |
| `component-builder` | Criar componentes UI |
| `code-reviewer` | Revisar código após implementar |
| `test-runner` | Rodar e analisar testes |
| `e2e-tester` | Criar testes E2E |
| `saas-security-auditor` | Auditoria de segurança multi-tenant |
| `rls-validator` | Validar políticas RLS |
| `ux-reviewer` | Revisar UX e acessibilidade |
| `copy-writer` | Escrever microcopy |
| `performance-analyzer` | Analisar performance |
| `accessibility-auditor` | Auditoria WCAG |

## Workflow Padrão para Features

```
1. pm-orchestrator → Planejar e quebrar em tarefas
2. feature-planner → Pesquisar codebase
3. [paralelo]
   - db-architect → Migrations
   - component-builder → UI
4. Implementar lógica
5. [paralelo]
   - code-reviewer → Review
   - test-runner → Testes
   - ux-reviewer → UX
6. saas-security-auditor → Segurança
7. Merge
```

## Regras Importantes

1. **Nunca** commitar arquivos `.env` ou secrets
2. **Sempre** usar RLS para dados tenant-scoped
3. **Sempre** validar inputs com Zod
4. **Preferir** componentes do design-system
5. **Manter** componentes pequenos e focados
6. **Documentar** decisões arquiteturais importantes
7. **Testar** fluxos críticos com E2E

## Contatos

- Repo: kosmos-score
- Plataforma: KOSMOS Toolkit
- Ambiente: Desenvolvimento

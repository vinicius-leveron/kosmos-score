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

## REGRAS DE EXECUÇÃO AUTOMÁTICA (OBRIGATÓRIO)

**IMPORTANTE:** Estas regras devem ser seguidas AUTOMATICAMENTE, sem o usuário precisar pedir.

### Triggers Automáticos de Subagentes

| Situação Detectada | Ação OBRIGATÓRIA |
|-------------------|------------------|
| Usuário pede nova feature/funcionalidade | 1. `feature-planner` ANTES de codar |
| Criar componente UI > 50 linhas | Usar `component-builder` |
| Qualquer texto user-facing (labels, erros, mensagens) | Usar `copy-writer` |
| Criar/modificar tabela no banco | Usar `db-architect` |
| APÓS implementar qualquer feature | Rodar `code-reviewer` + `ux-reviewer` |
| Feature envolve dados de usuário | Rodar `saas-security-auditor` |
| Criar rota /admin ou área restrita | Verificar autenticação + `saas-security-auditor` |
| Antes de fazer push/deploy | Rodar `test-runner` |
| Feature complexa (>3 arquivos) | Começar com `pm-orchestrator` |

### Checklist Obrigatório ANTES de Implementar

- [ ] Pesquisei o codebase com `feature-planner`?
- [ ] Entendi os padrões existentes?
- [ ] Defini user story clara?
- [ ] Identifiquei componentes reutilizáveis do design-system?

### Checklist Obrigatório DEPOIS de Implementar

- [ ] Rodei `code-reviewer`?
- [ ] Rodei `ux-reviewer`?
- [ ] Componentes têm < 200 linhas?
- [ ] Usei React Query (não useState+useEffect para fetch)?
- [ ] Tratei estados: loading, error, empty?
- [ ] Adicionei aria-labels em botões de ícone?
- [ ] Textos passaram pelo `copy-writer`?

### Regras de Código OBRIGATÓRIAS

1. **NUNCA usar useState+useEffect para fetch de dados** → Usar React Query
2. **NUNCA criar componente > 200 linhas** → Quebrar em componentes menores
3. **NUNCA criar rota admin sem auth** → Verificar autenticação primeiro
4. **NUNCA ignorar erros de API** → Sempre tratar e mostrar feedback
5. **NUNCA botão só com ícone sem aria-label** → Acessibilidade obrigatória
6. **NUNCA duplicar código** → Extrair para utils/hooks compartilhados

### Padrões de Implementação

```tsx
// ERRADO - Nunca fazer isso
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch().then(setData).finally(() => setLoading(false));
}, []);

// CERTO - Sempre usar React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchFunction,
});
```

```tsx
// ERRADO - Componente muito grande
export function BigComponent() {
  // 500 linhas de código...
}

// CERTO - Quebrar em partes
export function BigComponent() {
  return (
    <>
      <Header />
      <MainContent />
      <Footer />
    </>
  );
}
```

## Subagentes Disponíveis

| Agente | Trigger Automático |
|--------|-------------------|
| `pm-orchestrator` | Feature complexa, múltiplos arquivos |
| `feature-planner` | **SEMPRE** antes de implementar feature |
| `db-architect` | Qualquer mudança de schema |
| `component-builder` | Componente UI novo > 50 linhas |
| `code-reviewer` | **SEMPRE** após implementar |
| `test-runner` | Antes de push, após mudanças significativas |
| `e2e-tester` | Fluxos críticos (auth, checkout, onboarding) |
| `saas-security-auditor` | Rotas admin, dados sensíveis, RLS |
| `rls-validator` | Qualquer policy RLS nova |
| `ux-reviewer` | **SEMPRE** após implementar UI |
| `copy-writer` | Textos user-facing, mensagens de erro |
| `performance-analyzer` | Antes de release, componentes pesados |
| `accessibility-auditor` | Componentes interativos, formulários |

## Workflow Padrão para Features

```
ANTES:
1. feature-planner → Pesquisar codebase e criar plano
2. pm-orchestrator → Se complexo, quebrar em tarefas

DURANTE:
3. db-architect → Se precisar de banco
4. component-builder → Para UI significativa
5. copy-writer → Para textos user-facing
6. Implementar seguindo padrões acima

DEPOIS:
7. code-reviewer → Review obrigatório
8. ux-reviewer → UX review obrigatório
9. test-runner → Rodar testes
10. saas-security-auditor → Se envolver dados/auth
11. Push/Deploy
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

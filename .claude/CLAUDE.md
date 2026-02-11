# Synkra AIOS Development Rules for Claude Code

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.

## Agent System

### Agent Activation
- Agents are activated with @agent-name syntax: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- The master agent is activated with @aios-master
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction

## Development Methodology

### Story-Driven Development
1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: [ ] → [x]
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements
- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features
- Test edge cases and error scenarios

## AIOS Framework Structure

```
aios-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```

## Workflow Execution

### Task Execution Pattern
1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

### Interactive Workflows
- Workflows with `elicit: true` require user input
- Present options clearly
- Validate user responses
- Provide helpful defaults

## Best Practices

### When implementing features:
- Check existing patterns first
- Reuse components and utilities
- Follow naming conventions
- Keep functions focused and testable
- Document complex logic

### When working with agents:
- Respect agent boundaries
- Use appropriate agent for each task
- Follow agent communication patterns
- Maintain agent context

### When handling errors:
```javascript
try {
  // Operation
} catch (error) {
  console.error(`Error in ${operation}:`, error);
  // Provide helpful error message
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement IDE detection [Story 2.1]`
- Keep commits atomic and focused

### GitHub CLI Usage
- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

## AIOS-Specific Patterns

### Working with Templates
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

### Agent Command Handling
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

### Story Updates
```javascript
// Update story progress
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```

## Environment Setup

### Required Tools
- Node.js 18+ 
- GitHub CLI
- Git
- Your preferred package manager (npm/yarn/pnpm)

### Configuration Files
- `.aios/config.yaml` - Framework configuration
- `.env` - Environment variables
- `aios.config.js` - Project-specific settings

## Common Commands

### AIOS Master Commands
- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow

### Development Commands
- `npm run dev` - Start development
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run build` - Build project

## Debugging

### Enable Debug Mode
```bash
export AIOS_DEBUG=true
```

### View Agent Logs
```bash
tail -f .aios/logs/agent.log
```

### Trace Workflow Execution
```bash
npm run trace -- workflow-name
```

## Claude Code Specific Configuration

### Performance Optimization
- Prefer batched tool calls when possible for better performance
- Use parallel execution for independent operations
- Cache frequently accessed data in memory during sessions

### Tool Usage Guidelines
- Always use the Grep tool for searching, never `grep` or `rg` in bash
- Use the Task tool for complex multi-step operations
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

### Session Management
- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

### Error Recovery
- Always provide recovery suggestions for failures
- Include error context in messages to user
- Suggest rollback procedures when appropriate
- Document any manual fixes required

### Testing Strategy
- Run tests incrementally during development
- Always verify lint and typecheck before marking complete
- Test edge cases for each new feature
- Document test scenarios in story files

### Documentation
- Update relevant docs when changing functionality
- Include code examples in documentation
- Keep README synchronized with actual behavior
- Document breaking changes prominently

---

# KOSMOS Toolkit - Project-Specific Rules

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
│   ├── crm/
│   ├── monetization/
│   ├── content/
│   └── analytics/
└── app/            # Shell da aplicação
```

## Padrões de Código KOSMOS

### Hooks de API (React Query)

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

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `MemberCard.tsx` |
| Hooks | camelCase, prefixo `use` | `useMembers.ts` |
| DB tables | snake_case | `community_members` |
| DB columns | snake_case | `workspace_id` |

## Comandos KOSMOS

```bash
npm run dev          # Dev server (porta 8080)
npm run build        # Build produção
supabase db push     # Aplicar migrations
supabase gen types   # Gerar tipos TypeScript
```

## Regras de Código OBRIGATÓRIAS

1. **NUNCA usar useState+useEffect para fetch** → Usar React Query
2. **NUNCA criar componente > 200 linhas** → Quebrar em menores
3. **NUNCA criar rota admin sem auth** → Verificar autenticação
4. **NUNCA ignorar erros de API** → Sempre tratar e mostrar feedback
5. **NUNCA botão só com ícone sem aria-label** → Acessibilidade
6. **SEMPRE usar RLS** para dados tenant-scoped

## Mapeamento AIOS → KOSMOS Agents

| AIOS Agent | KOSMOS Equivalent |
|------------|-------------------|
| @dev | component-builder |
| @qa | code-reviewer, test-runner |
| @architect | db-architect |
| @po | feature-planner |
| @pm | pm-orchestrator |
| @ux-design-expert | ux-reviewer |

---
*Synkra AIOS Claude Code Configuration v2.0 + KOSMOS Toolkit Rules* 
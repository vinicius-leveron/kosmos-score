# Meta-Prompt: Framework PRO para Criar Prompts de Subagentes

Este é o framework completo para criar e refinar prompts de subagentes de alta qualidade para o KOSMOS Toolkit.

---

## Parte 1: Contexto de Negócio (KOSMOS)

### O Produto
**KOSMOS Toolkit** é uma plataforma SaaS para criadores de comunidades digitais monetizarem seu conhecimento e engajarem sua audiência.

### Público-Alvo
- Criadores de conteúdo
- Infoprodutores
- Donos de comunidades pagas
- Coaches e mentores
- Criadores de cursos online

### Proposta de Valor
"Transforme sua audiência em um ativo que gera receita recorrente"

### Métricas de Sucesso do Produto
| Métrica | O que mede |
|---------|------------|
| KOSMOS Asset Score | Saúde do ativo digital (0-100) |
| Lucro Oculto | Receita potencial não capturada |
| Member Engagement | Engajamento da comunidade |
| MRR | Receita recorrente mensal |
| Churn | Taxa de cancelamento |

### Os 3 Pilares (Modelo de Negócio)
1. **Causa** - Por que as pessoas compram (propósito, identidade)
2. **Cultura** - Como a comunidade se organiza (rituais, autonomia)
3. **Economia** - Como monetiza (ofertas, recorrência)

### Jornada do Usuário
```
1. Descoberta → KOSMOS Score (gratuito, lead magnet)
2. Awareness → Vê o potencial (Lucro Oculto)
3. Consideração → Explora a plataforma
4. Decisão → Escolhe um plano
5. Onboarding → Configura workspace
6. Ativação → Adiciona primeiro membro
7. Engajamento → Usa features diariamente
8. Expansão → Faz upgrade do plano
9. Advocacy → Indica para outros
```

### Personas
| Persona | Descrição | Dor Principal |
|---------|-----------|---------------|
| **Iniciante** | Começando a monetizar, <1k seguidores | "Não sei por onde começar" |
| **Gerente** | Tem audiência, vende esporadicamente | "Trabalho muito, ganho pouco" |
| **Arquiteto** | Fatura 10-50k/mês, quer escalar | "Preciso de sistemas" |
| **Dono** | Ativo maduro, receita previsível | "Quero otimizar" |

---

## Parte 2: Princípios Fundamentais de Prompts

### 1. Clareza de Papel (Role Clarity)
O agente precisa saber EXATAMENTE quem ele é e qual seu escopo.

```
❌ Ruim: "Você é um desenvolvedor"
✅ Bom: "Você é um senior backend engineer especializado em PostgreSQL e Supabase,
        focado em segurança de dados multi-tenant. Seu escopo é APENAS database -
        não opine sobre UI ou frontend."
```

### 2. Contexto de Negócio
Conecte decisões técnicas ao impacto no usuário/negócio.

```
❌ Ruim: "Valide os inputs"
✅ Bom: "Valide inputs para proteger os dados dos membros da comunidade.
        Um vazamento de dados destrói a confiança que o criador construiu
        com sua audiência - isso é inaceitável para nosso produto."
```

### 3. Contexto Técnico Específico
Dê informações concretas sobre a stack.

```
❌ Ruim: "Este é um projeto React"
✅ Bom: "Stack: React 18 + TypeScript + Supabase + Tailwind.
        Arquitetura: Módulos isolados em src/modules/{nome}/.
        Crítico: Toda tabela tenant-scoped usa workspace_id + RLS.
        Padrão: React Query para estado de servidor."
```

### 4. Formato de Output Explícito
Especifique EXATAMENTE como quer o output.

```
❌ Ruim: "Retorne um relatório"
✅ Bom: "Retorne no formato:
        ## Sumário Executivo
        [1 parágrafo para stakeholders não-técnicos]

        ## Issues Encontradas
        ### [SEVERIDADE] ISSUE-001: Título
        - **Impacto no Usuário:** Como afeta o criador/membros
        - **Impacto Técnico:** O que acontece no sistema
        - **Arquivo:** path:linha
        - **Fix:** Código exato"
```

### 5. Exemplos Concretos (Few-Shot)
Mostre o que você espera com exemplos reais.

```
❌ Ruim: "Escreva código limpo"
✅ Bom: "Código deve ser auto-documentado:

        // ❌ Ruim
        const x = members.filter(m => m.s === 'a');

        // ✅ Bom
        const activeMembers = members.filter(
          member => member.status === 'active'
        );"
```

### 6. Constraints e Guardrails
Diga o que o agente NÃO deve fazer.

```
✅ "NUNCA faça:
   - Não sugira mudanças fora do seu escopo
   - Não gere código sem antes analisar o existente
   - Não ignore erros silenciosamente
   - Não tome decisões de produto sem validar com PM"
```

### 7. Priorização com Critérios
Dê critérios claros para ordenar trabalho.

```
✅ "Priorize por impacto no usuário:
   1. CRÍTICO - Usuário perde dados ou dinheiro
   2. ALTO - Usuário não consegue completar tarefa
   3. MÉDIO - Usuário tem fricção mas consegue continuar
   4. BAIXO - Usuário nem percebe"
```

### 8. Chain of Thought
Guie o raciocínio para tarefas complexas.

```
✅ "Para cada componente:
   1. Qual o job-to-be-done deste componente?
   2. Quem é o usuário? (criador vs membro)
   3. Qual o estado esperado? (loading, empty, error, success)
   4. Como o usuário sabe que funcionou?
   5. O que acontece se falhar?"
```

### 9. Empatia com Usuário
Mantenha o foco em quem usa o produto.

```
✅ "Lembre-se: nosso usuário é um criador de conteúdo, não um dev.
   Ele quer vender cursos, não debugar código.
   Cada segundo de loading é frustração.
   Cada erro obscuro é abandono.
   Cada feature confusa é suporte."
```

### 10. Métricas de Sucesso
Defina como medir se o trabalho foi bem feito.

```
✅ "Seu trabalho foi bem feito se:
   - Zero erros em produção relacionados
   - Usuário completa o fluxo em <30s
   - NPS do feature >8
   - Suporte não recebe tickets sobre isso"
```

### 11. Integração com Outros Agentes
Defina como este agente se relaciona com outros.

```
✅ "Você trabalha em conjunto com:
   - ANTES de você: feature-planner (te dá o contexto)
   - PARALELO a você: component-builder (vocês podem trabalhar juntos)
   - DEPOIS de você: code-reviewer (vai revisar seu trabalho)

   Passe contexto para o próximo agente:
   'Para o code-reviewer: foquei em X, verifique Y especialmente'"
```

### 12. Fallbacks e Escalação
O que fazer quando não sabe algo.

```
✅ "Se você encontrar:
   - Algo fora do seu escopo → Indique qual agente deve cuidar
   - Decisão de produto → Escale para PM/usuário
   - Ambiguidade técnica → Liste opções com trade-offs
   - Informação insuficiente → Pergunte antes de assumir"
```

---

## Parte 3: Orquestração e Paralelismo

### Modelo de Execução

```
                    ┌─────────────────┐
                    │  pm-orchestrator │
                    │   (coordenação)  │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │  Stream A   │  │  Stream B   │  │  Stream C   │
     │  (Database) │  │    (API)    │  │    (UI)     │
     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Integração    │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │   Review    │  │   Testes    │  │     UX      │
     └─────────────┘  └─────────────┘  └─────────────┘
```

### Regras de Paralelismo

**Podem rodar em PARALELO (sem dependências):**
- db-architect + component-builder (DB e UI independentes)
- code-reviewer + test-runner + ux-reviewer (reviews paralelos)
- saas-security-auditor + performance-analyzer (auditorias paralelas)

**Devem rodar em SEQUÊNCIA (com dependências):**
- feature-planner → db-architect (plano antes de DB)
- db-architect → queries/hooks (schema antes de API)
- implementação → code-reviewer (código antes de review)
- todos reviews → deploy (qualidade antes de prod)

### Comunicação Entre Agentes

Cada agente deve:

1. **Declarar suas outputs:**
   ```
   "Minhas entregas para próximos agentes:
    - Arquivo: supabase/migrations/xxx.sql
    - Novo tipo: CommunityMember em types.ts
    - Atenção para: campo email é unique por workspace"
   ```

2. **Declarar suas necessidades:**
   ```
   "Preciso saber antes de começar:
    - Quais campos o membro terá?
    - Qual a relação com outros módulos?
    - Existe validação especial?"
   ```

3. **Passar contexto:**
   ```
   "Para o próximo agente (code-reviewer):
    - Foquei em performance de queries
    - Verifique os índices criados
    - RLS já está implementado e testado"
   ```

### Handoff Template

```markdown
## Handoff: [Agente Origem] → [Agente Destino]

### O que foi feito
- [Lista de entregas]

### Arquivos criados/modificados
- path/to/file.ts - [descrição]

### Decisões tomadas
- [Decisão]: [Justificativa]

### Pontos de atenção
- [O que o próximo agente deve verificar]

### Perguntas abertas
- [Dúvidas que precisam ser resolvidas]
```

### Workflow por Tipo de Tarefa

#### Feature Nova (Grande)
```
pm-orchestrator
    │
    ├── feature-planner (pesquisa)
    │
    ├── [PARALELO]
    │   ├── db-architect (schema)
    │   └── component-builder (UI base)
    │
    ├── Integração (conectar DB + UI)
    │
    ├── [PARALELO]
    │   ├── code-reviewer
    │   ├── test-runner
    │   ├── ux-reviewer
    │   └── copy-writer
    │
    ├── saas-security-auditor
    │
    └── Deploy
```

#### Bug Fix (Pequeno)
```
Reproduzir → Investigar → Fix → test-runner → code-reviewer → Deploy
```

#### Refactoring
```
Análise → Plan → [PARALELO: migrar por módulo] → test-runner → Deploy
```

---

## Parte 4: Template de Prompt Refinado

```markdown
---
name: [kebab-case-name]
description: [Quando usar este agente - 1 linha]
tools: [Lista de tools]
model: [inherit | opus | sonnet | haiku]
---

# [Nome do Agente]

## Identidade

Você é [ROLE] especializado em [ESPECIALIZAÇÃO] para o KOSMOS Toolkit.

**Seu foco:** [ESCOPO LIMITADO]
**Você NÃO:** [ANTI-ESCOPO]

## Contexto de Negócio

**Produto:** KOSMOS Toolkit - plataforma SaaS para criadores de comunidades
**Usuários:** Criadores de conteúdo, infoprodutores, coaches
**Proposta:** Transformar audiência em ativo que gera receita recorrente

**Os 3 Pilares:**
- Causa (propósito) → Cultura (comunidade) → Economia (monetização)

**Métricas que importam:**
- KOSMOS Score, Lucro Oculto, MRR, Churn, Engagement

## Contexto Técnico

**Stack:** React 18 + TypeScript + Vite + Supabase + Tailwind + shadcn/ui
**Arquitetura:** Módulos em src/modules/{nome}/
**Crítico:** Multi-tenant com RLS (workspace_id em toda tabela tenant)

## Quando Invocado

### Passo 1: Entender
[O que fazer primeiro - ler, analisar, perguntar]

### Passo 2: Executar
[Como fazer o trabalho principal]

### Passo 3: Entregar
[O que produzir e como passar para próximo agente]

## Checklist de Verificação
- [ ] Item obrigatório 1
- [ ] Item obrigatório 2

## Padrões (Faça Assim)

```typescript
// Exemplo de código correto com comentário explicando POR QUE
```

## Anti-Padrões (NÃO Faça)

```typescript
// Exemplo de código errado com comentário explicando o PROBLEMA
```

## Integração com Outros Agentes

**Recebo de:** [agente] - [o que espero receber]
**Passo para:** [agente] - [o que devo entregar]
**Paralelo com:** [agentes que podem rodar junto]

## Formato de Output

```markdown
# [Título]

## Sumário Executivo
[Para stakeholders não-técnicos]

## Detalhes
[Template específico]

## Handoff
[Para próximo agente]
```

## Exemplos

### Exemplo 1: [Cenário comum]
**Situação:** [Contexto]
**Input:** [O que foi pedido]
**Output:** [O que retornar]

### Exemplo 2: [Edge case]
**Situação:** [Contexto]
**Input:** [O que foi pedido]
**Output:** [O que retornar]

## Fallbacks

- **Se não tiver informação suficiente:** Pergunte antes de assumir
- **Se for fora do escopo:** Indique qual agente deve cuidar
- **Se for decisão de produto:** Escale para PM/usuário
```

---

## Parte 5: Checklist de Qualidade

Antes de finalizar um prompt, verifique:

### Negócio (25%)
- [ ] Conecta com proposta de valor do KOSMOS?
- [ ] Considera o usuário final (criador/membro)?
- [ ] Menciona métricas relevantes?
- [ ] Entende a jornada do usuário?

### Técnico (25%)
- [ ] Stack está correta e completa?
- [ ] Regras críticas (RLS, workspace_id) estão claras?
- [ ] Padrões de código têm exemplos?
- [ ] Anti-padrões estão documentados?

### Clareza (25%)
- [ ] Papel está claro em uma frase?
- [ ] Escopo e anti-escopo definidos?
- [ ] Passos são acionáveis?
- [ ] Output tem template exato?

### Integração (25%)
- [ ] Sabe de quem recebe contexto?
- [ ] Sabe para quem passa trabalho?
- [ ] Handoff está definido?
- [ ] Paralelismo está claro?

**Score mínimo:** 90% para agentes críticos (security, db, pm)
**Score mínimo:** 80% para outros agentes

---

## Parte 6: Prompt para Refinar Prompts

Use este meta-prompt para refinar um prompt existente:

```
Você é um especialista em prompt engineering refinando prompts de subagentes
para o KOSMOS Toolkit.

CONTEXTO DO PRODUTO:
- SaaS multi-tenant para criadores de comunidades
- Stack: React + TypeScript + Supabase
- Proposta: Transformar audiência em ativo de receita recorrente
- Pilares: Causa, Cultura, Economia

CRITÉRIOS DE REFINAMENTO:

1. NEGÓCIO
   - Conecta decisões técnicas ao impacto no usuário?
   - Menciona métricas de sucesso?
   - Considera a persona do criador?

2. TÉCNICO
   - Contexto de stack está completo?
   - Regras críticas (RLS, multi-tenant) estão claras?
   - Tem exemplos de código bom e ruim?

3. CLAREZA
   - Papel está definido em 1 frase?
   - Escopo e anti-escopo explícitos?
   - Passos ordenados e acionáveis?
   - Output tem template exato?

4. INTEGRAÇÃO
   - Define de quem recebe contexto?
   - Define para quem passa trabalho?
   - Explica handoff?
   - Clarifica paralelismo?

PROMPT ATUAL:
[cole aqui]

INSTRUÇÕES:
1. Analise cada seção contra os critérios
2. Identifique gaps específicos
3. Reescreva o prompt completo com melhorias
4. Adicione exemplos concretos onde faltam
5. Garanta que tem template de output exato

Retorne o prompt refinado no formato do template.
```

---

## Parte 7: Especialistas, Metodologias e Princípios por Área

Use estas referências para enriquecer cada tipo de agente com conhecimento de especialistas consagrados.

---

### Product Management (pm-orchestrator, feature-planner)

#### Especialistas
| Nome | Contribuição | Aplicação no KOSMOS |
|------|--------------|---------------------|
| **Marty Cagan** | Inspired, Empowered | Product discovery, times empoderados |
| **Teresa Torres** | Continuous Discovery | Entrevistas, opportunity solution trees |
| **Gibson Biddle** | DHM Model | Delight, Hard-to-copy, Margin |
| **Shreyas Doshi** | LNO Framework | Labor, Neutral, Overhead tasks |

#### Metodologias
- **Jobs to Be Done (JTBD)** - "Quando [situação], eu quero [motivação], para que [resultado]"
- **RICE Scoring** - Reach × Impact × Confidence / Effort
- **Opportunity Solution Trees** - Mapear oportunidades → soluções → experimentos
- **Working Backwards (Amazon)** - Começar pelo press release do produto

#### Princípios
```
1. "Fall in love with the problem, not the solution" - Uri Levine
2. "If you're not embarrassed by v1, you launched too late" - Reid Hoffman
3. "Make things people want" - YC motto
4. "Outcome over output" - Marty Cagan
```

#### Aplicar no Prompt
```
Você usa os princípios de Marty Cagan (Inspired) para priorização:
- Valor: Resolve problema real do criador?
- Usabilidade: Criador consegue usar sem suporte?
- Viabilidade: Conseguimos construir com a stack?
- Negócio: Contribui para MRR ou retenção?
```

---

### UX/Product Design (ux-reviewer, component-builder)

#### Especialistas
| Nome | Contribuição | Aplicação no KOSMOS |
|------|--------------|---------------------|
| **Don Norman** | Design of Everyday Things | Affordances, feedback, mapping |
| **Jakob Nielsen** | 10 Usability Heuristics | Checklist de usabilidade |
| **Dieter Rams** | 10 Principles of Good Design | Minimalismo funcional |
| **Steve Krug** | Don't Make Me Think | Simplicidade, convenções |
| **Jared Spool** | UX Strategy | Design como diferencial |

#### Metodologias
- **Design Thinking (IDEO)** - Empathize → Define → Ideate → Prototype → Test
- **Jobs to Be Done** - Focar no job, não na feature
- **Double Diamond** - Divergir → Convergir (2x)
- **Atomic Design** - Atoms → Molecules → Organisms → Templates → Pages

#### Princípios de Nielsen (usar como checklist)
```
1. Visibilidade do status do sistema
2. Correspondência com o mundo real
3. Controle e liberdade do usuário
4. Consistência e padrões
5. Prevenção de erros
6. Reconhecimento ao invés de memorização
7. Flexibilidade e eficiência de uso
8. Estética e design minimalista
9. Ajudar usuários a reconhecer e recuperar de erros
10. Ajuda e documentação
```

#### Princípios de Dieter Rams
```
1. Bom design é inovador
2. Bom design torna um produto útil
3. Bom design é estético
4. Bom design torna um produto compreensível
5. Bom design é discreto
6. Bom design é honesto
7. Bom design é duradouro
8. Bom design é completo até o último detalhe
9. Bom design é ambientalmente consciente
10. Bom design é o mínimo design possível
```

#### Aplicar no Prompt
```
Você aplica os 10 Heurísticos de Usabilidade de Jakob Nielsen:
Ao revisar cada componente, verifique:
- O usuário sabe o que está acontecendo? (visibilidade)
- Usa linguagem do criador, não jargão técnico? (mundo real)
- Pode desfazer ações facilmente? (controle)
- Segue padrões do resto do app? (consistência)
- Previne erros antes de acontecerem? (prevenção)
```

---

### Copywriting (copy-writer)

#### Especialistas
| Nome | Contribuição | Aplicação no KOSMOS |
|------|--------------|---------------------|
| **Joseph Sugarman** | Triggers | Gatilhos emocionais em copy |
| **David Ogilvy** | Ogilvy on Advertising | Headlines, clareza |
| **Eugene Schwartz** | Breakthrough Advertising | Níveis de consciência |
| **Gary Halbert** | Boron Letters | Estrutura de copy |
| **Joanna Wiebe** | Copyhackers | Voice of Customer research |

#### Metodologias
- **PAS** - Problem → Agitation → Solution
- **AIDA** - Attention → Interest → Desire → Action
- **4 Us** - Urgent, Unique, Ultra-specific, Useful
- **Voice of Customer (VoC)** - Usar palavras exatas do usuário

#### Princípios
```
1. Clareza > Criatividade
2. Benefícios > Features
3. "You" > "We"
4. Específico > Genérico
5. Ação > Passividade
```

#### Níveis de Consciência (Schwartz)
```
1. Unaware - Não sabe que tem problema
2. Problem-aware - Sabe do problema, não da solução
3. Solution-aware - Conhece soluções, não seu produto
4. Product-aware - Conhece seu produto, não os benefícios
5. Most aware - Pronto para comprar
```

#### Aplicar no Prompt
```
Você escreve copy usando os princípios de Joseph Sugarman:
- Cada frase deve fazer o leitor querer ler a próxima
- Use a voz do cliente (pesquise como eles falam)
- Seja específico: "Aumente seu MRR em 30%" > "Ganhe mais dinheiro"
- Foque no benefício emocional, não apenas funcional
```

---

### Security (saas-security-auditor, rls-validator)

#### Especialistas/Referências
| Nome/Org | Contribuição | Aplicação no KOSMOS |
|----------|--------------|---------------------|
| **OWASP** | Top 10, ASVS | Checklist de vulnerabilidades |
| **NIST** | Cybersecurity Framework | Identify, Protect, Detect, Respond, Recover |
| **Troy Hunt** | haveibeenpwned | Práticas de auth seguro |
| **Tanya Janca** | Alice & Bob Learn AppSec | Secure SDLC |

#### Metodologias
- **OWASP Top 10** - Vulnerabilidades mais críticas
- **STRIDE** - Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation
- **Defense in Depth** - Múltiplas camadas de proteção
- **Principle of Least Privilege** - Mínimo acesso necessário

#### OWASP Top 10 (2021)
```
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Auth Failures
8. Software/Data Integrity Failures
9. Logging/Monitoring Failures
10. SSRF
```

#### Princípios Multi-Tenant
```
1. Tenant Isolation - Dados nunca vazam entre tenants
2. Defense in Depth - RLS + App + API validam acesso
3. Least Privilege - Usuário só vê o que precisa
4. Audit Trail - Log de quem acessou o quê
5. Secure Defaults - Seguro por padrão, não por configuração
```

#### Aplicar no Prompt
```
Você é um security engineer que aplica OWASP Top 10 e STRIDE:
Para cada feature, analise:
- Broken Access Control: Usuário pode acessar dados de outro workspace?
- Injection: Inputs são sanitizados?
- Insecure Design: A arquitetura assume confiança indevida?

Seu mantra: "Em multi-tenant, um vazamento destrói a confiança de TODOS os clientes"
```

---

### QA/Testing (test-runner, e2e-tester)

#### Especialistas
| Nome | Contribuição | Aplicação no KOSMOS |
|------|--------------|---------------------|
| **Kent Beck** | TDD, XP | Test-first development |
| **Martin Fowler** | Refactoring, Test Pyramid | Arquitetura de testes |
| **Michael Bolton** | Rapid Software Testing | Exploratory testing |
| **James Bach** | Context-Driven Testing | Adaptar abordagem ao contexto |

#### Metodologias
- **Test Pyramid** - Unit (base) → Integration → E2E (topo)
- **TDD** - Red → Green → Refactor
- **BDD** - Given/When/Then
- **Exploratory Testing** - Aprender, projetar, executar simultaneamente

#### Princípios
```
1. Test behavior, not implementation
2. Tests should be FIRST: Fast, Independent, Repeatable, Self-validating, Timely
3. One assertion per test (quando possível)
4. Test the happy path AND edge cases
5. Tests are documentation
```

#### Pirâmide de Testes
```
        /\
       /E2E\        - Poucos, lentos, frágeis
      /------\
     /Integração\   - Alguns, médio speed
    /--------------\
   /     Unit       \  - Muitos, rápidos, estáveis
  /------------------\
```

#### Aplicar no Prompt
```
Você segue a Test Pyramid de Martin Fowler:
- 70% Unit Tests: Funções puras, hooks, utils
- 20% Integration: Componentes com contexto, API calls mockados
- 10% E2E: Fluxos críticos do usuário (checkout, login)

Princípio: "Se o teste é difícil de escrever, o código está mal projetado"
```

---

### Code Quality (code-reviewer)

#### Especialistas
| Nome | Contribuição | Aplicação no KOSMOS |
|------|--------------|---------------------|
| **Robert C. Martin** | Clean Code, SOLID | Princípios de código limpo |
| **Martin Fowler** | Refactoring | Code smells, patterns |
| **Kent Beck** | Smalltalk Best Practices | Simple design |
| **Sandi Metz** | POODR | OOP pragmático |

#### Princípios SOLID
```
S - Single Responsibility: Uma razão para mudar
O - Open/Closed: Aberto para extensão, fechado para modificação
L - Liskov Substitution: Subtipos substituíveis
I - Interface Segregation: Interfaces pequenas e focadas
D - Dependency Inversion: Dependa de abstrações
```

#### 4 Rules of Simple Design (Kent Beck)
```
1. Passes all tests
2. Reveals intention (código auto-documentado)
3. No duplication (DRY)
4. Fewest elements (YAGNI)
```

#### Code Smells (Fowler)
```
- Long Method
- Large Class
- Feature Envy
- Data Clumps
- Primitive Obsession
- Duplicated Code
- Dead Code
- Speculative Generality
```

#### Aplicar no Prompt
```
Você aplica Clean Code de Uncle Bob e Simple Design de Kent Beck:

Ao revisar código, verifique:
1. Funções fazem uma coisa só? (SRP)
2. Nomes revelam intenção?
3. Código duplicado foi extraído?
4. Há código especulativo (YAGNI)?

Code smell → Sugira refactoring específico:
- Long Method → Extract Function
- Feature Envy → Move Method
- Data Clumps → Extract Class
```

---

### Performance (performance-analyzer)

#### Especialistas/Referências
| Nome/Org | Contribuição | Aplicação no KOSMOS |
|----------|--------------|---------------------|
| **Steve Souders** | High Performance Websites | Frontend performance |
| **Addy Osmani** | Web Performance | Core Web Vitals, loading |
| **Google** | RAIL Model | Response, Animation, Idle, Load |
| **Lighthouse** | Web Vitals | Métricas de performance |

#### Metodologias
- **RAIL** - Response <100ms, Animation <16ms, Idle <50ms, Load <1s
- **PRPL** - Push, Render, Pre-cache, Lazy-load
- **Core Web Vitals** - LCP, FID, CLS

#### Princípios
```
1. Measure first, optimize second
2. Perceived performance > actual performance
3. Ship less JavaScript
4. Lazy load everything possible
5. Cache aggressively
```

#### Aplicar no Prompt
```
Você aplica o modelo RAIL do Google:
- Response: Interações respondem em <100ms
- Animation: 60fps (16ms per frame)
- Idle: Use tempo ocioso para pre-fetch
- Load: First Contentful Paint <1s

Para cada componente, pergunte:
- Precisa carregar no bundle inicial?
- Pode ser lazy loaded?
- Dados podem ser pre-fetched?
```

---

### Accessibility (accessibility-auditor)

#### Especialistas/Referências
| Nome/Org | Contribuição | Aplicação no KOSMOS |
|----------|--------------|---------------------|
| **W3C/WAI** | WCAG Guidelines | Standard de acessibilidade |
| **Marcy Sutton** | A11y Testing | Testing practices |
| **Léonie Watson** | Screen Reader UX | Experiência de SR users |
| **Deque** | axe-core | Automated testing |

#### Metodologias
- **WCAG 2.1 AA** - Standard mínimo
- **POUR** - Perceivable, Operable, Understandable, Robust
- **a11y Testing** - Automated + Manual + User testing

#### Princípios POUR
```
Perceivable - Usuários podem perceber o conteúdo
Operable - Usuários podem operar a interface
Understandable - Usuários entendem conteúdo e operação
Robust - Funciona com tecnologias assistivas
```

#### Aplicar no Prompt
```
Você garante conformidade WCAG 2.1 AA usando os princípios POUR:

Para cada componente:
- Perceivable: Tem alt text? Contraste suficiente?
- Operable: Navegável por teclado? Focus visible?
- Understandable: Labels claros? Erros explicativos?
- Robust: Funciona com screen readers?

Lembre-se: "Acessibilidade não é feature, é requisito"
```

---

### Database/Architecture (db-architect)

#### Especialistas
| Nome | Contribuição | Aplicação no KOSMOS |
|------|--------------|---------------------|
| **Martin Kleppmann** | DDIA | Sistemas distribuídos |
| **C.J. Date** | Database Design | Normalização, integridade |
| **Sam Newman** | Microservices | Bounded contexts |
| **Eric Evans** | DDD | Domain modeling |

#### Metodologias
- **Normalização** - 1NF → 2NF → 3NF
- **DDD** - Bounded Contexts, Aggregates, Entities
- **Event Sourcing** - Estado derivado de eventos
- **CQRS** - Separar leitura de escrita

#### Princípios
```
1. Normalize for writes, denormalize for reads
2. Every table needs a reason to exist
3. Foreign keys are your friends
4. Index what you query
5. RLS is mandatory for tenant data
```

#### Aplicar no Prompt
```
Você projeta schemas seguindo princípios de C.J. Date e Eric Evans:

Para cada tabela:
1. Está normalizada? (evitar anomalias)
2. Tem primary key clara?
3. Foreign keys têm ON DELETE definido?
4. Índices cobrem queries frequentes?
5. RLS está configurado? (CRÍTICO para multi-tenant)

Para domínios complexos, aplique DDD:
- Identifique aggregates
- Defina bounded contexts
- Modele entidades e value objects
```

---

## Como Usar Esta Referência

1. **Ao criar um novo agente:** Consulte a seção da área correspondente
2. **Ao refinar um prompt:** Adicione referências a especialistas e princípios
3. **Ao revisar trabalho:** Use os checklists e princípios como critérios

Exemplo de incorporação no prompt:

```markdown
## Identidade

Você é um UX Designer sênior que aplica os 10 Heurísticos de Usabilidade
de Jakob Nielsen e os princípios de Design Thinking da IDEO.

Seu trabalho é guiado por:
- "Don't Make Me Think" - Steve Krug (simplicidade)
- "Design of Everyday Things" - Don Norman (affordances)
- "10 Principles of Good Design" - Dieter Rams (minimalismo)
```

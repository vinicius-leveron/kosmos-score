# Task: Create Questions & Scoring Logic

## Agent
raio-x-developer

## Purpose
Definir as 13 perguntas do Raio-X e o sistema de lead scoring.

## Prerequisites
- Spec completa das perguntas (no plano)
- Referência: `src/modules/kosmos-score/lib/auditQuestionsV2.ts`

## Steps

### Step 1: Criar types.ts
`src/modules/raio-x/lib/types.ts` com interfaces para:
- `RaioXQuestion`, `RaioXOption`, `RaioXAnswer`
- `RaioXResult`, `RaioXClassification`
- `RaioXOutputs` (JSONs dos 4 prompts)

### Step 2: Criar questions.ts
`src/modules/raio-x/lib/questions.ts` com 13 perguntas em 3 blocos:

**Bloco 1 — Dados do Negócio (P1-P5):**
- P1: Tipo de negócio (single, 5 opções)
- P2: Faturamento mensal (single, 6 opções, scorable: 0-5 pts)
- P3: Tamanho da base (single, 5 opções, scorable: 0-4 pts)
- P4: Produtos atuais (text, aberta)
- P5: Modelo de receita (single, 4 opções, scorable: 0-2 pts)

**Bloco 2 — Modelo e Dependência (P6-P9):**
- P6: Canal de aquisição (single, 5 opções)
- P7: Equipe (single, 4 opções)
- P8: Teste dos 30 dias (single, 3 opções, scorable: 0-3 pts)
- P9: Atividade da base (single, 4 opções, scorable: 0-3 pts)

**Bloco 3 — Transformação (P10-P13):**
- P10: O que faz (text, aberta)
- P11: Melhor resultado de aluno (text, aberta)
- P12: Por que começou (text, aberta)
- P13: Conexão entre membros (single, 3 opções, scorable: 0-3 pts)

### Step 3: Criar scoring.ts
`src/modules/raio-x/lib/scoring.ts` com:
- `calculateLeadScore(answers)` → retorna `{ total, breakdown, classification }`
- Score ranges: 0-5 INÍCIO, 6-11 EM_CONSTRUCAO, 12+ QUALIFICADO

## Output
- 3 arquivos em `src/modules/raio-x/lib/`

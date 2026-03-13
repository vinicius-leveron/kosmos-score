# Task: Tests & Build Validation

## Agent
qa-engineer

## Purpose
Criar testes unitários e validar build.

## Steps

### Step 1: Testes de Scoring
`src/modules/raio-x/lib/__tests__/scoring.test.ts`
- Score 0 → INÍCIO
- Score 5 → INÍCIO (limite)
- Score 6 → EM_CONSTRUCAO (limite)
- Score 11 → EM_CONSTRUCAO (limite)
- Score 12 → QUALIFICADO (limite)
- Score 20 → QUALIFICADO (máximo)
- Breakdown correto por pergunta

### Step 2: Testes de Perguntas
`src/modules/raio-x/lib/__tests__/questions.test.ts`
- 13 perguntas definidas
- IDs únicos
- Perguntas scoráveis têm numericValue
- Blocos corretos

### Step 3: Build
- `npm run build` sem erros
- `npm run lint` sem warnings críticos

## Output
- Testes passando
- Build limpo

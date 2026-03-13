# Task: Create Edge Function raio-x-process

## Agent
raio-x-developer

## Purpose
Criar Edge Function que processa respostas do quiz com Claude API e salva resultado.

## Prerequisites
- `lib/scoring.ts` criado (Task 02)
- `ANTHROPIC_API_KEY` configurado como secret do Supabase

## Steps

### Step 1: Scaffold
Criar `supabase/functions/raio-x-process/index.ts`

### Step 2: Implementar handler
1. Validar input (Zod)
2. Calcular lead score server-side
3. Montar 4 prompts com dados das respostas
4. Chamar Claude API (Sonnet) com `Promise.all` (4 chamadas paralelas)
5. Salvar em `lead_magnet_results` com:
   - `lead_magnet_type: 'raio-x-kosmos'`
   - `inputs`: respostas + contato
   - `outputs`: JSONs dos 4 prompts
   - `total_score`: lead score
   - `score_level`: classificação
   - `score_breakdown`: detalhamento por pergunta
   - `organization_id`: KOSMOS org ID
6. Invocar `send-raio-x-email` (se implementado)
7. Retornar `{ id, classification, outputs }`

### Step 3: Prompts
Implementar os 4 prompts exatamente como na spec do Gabriel:
- Prompt 1: Análise de Esteira e Oportunidades
- Prompt 2: Feature vs Transformação
- Prompt 3: Causa, Inimigo e Narrativa
- Prompt 4: Análise do Modelo e Mapa

Cada prompt deve retornar JSON estruturado.

### Step 4: Rate limiting
- Max 5 submissões por email/dia
- Timeout 30s com fallback

## Output
- Edge Function funcional em `supabase/functions/raio-x-process/`

# Task: Create Database Migration

## Agent
db-architect

## Purpose
Criar migration SQL para adicionar tipo `raio-x-kosmos` à tabela `lead_magnet_results` e atualizar trigger CRM.

## Prerequisites
- Acesso ao diretório `supabase/migrations/`
- Referência: `supabase/migrations/20260220180000_add_maturity_diagnostic_type.sql`

## Steps

### Step 1: Criar migration
Criar arquivo `supabase/migrations/YYYYMMDDHHMMSS_add_raio_x_type.sql` com:

1. DROP + re-CREATE constraint `lead_magnet_results_lead_magnet_type_check` incluindo `'raio-x-kosmos'`
2. UPDATE da função `sync_lead_magnet_to_contact()` com bloco condicional para raio-x:
   - Score 0-5 → stage `low_score`
   - Score 6-11 → stage `medium_score`
   - Score 12+ → stage `high_score`
3. Comentário na coluna `lead_magnet_type`

### Step 2: Validar
- SQL válido (sem erros de sintaxe)
- Tipos existentes preservados
- Trigger atualizado com `CREATE OR REPLACE`

## Output
- Migration file pronto para `supabase db push`

---
name: migrate
description: Cria e aplica migrations do Supabase para alterações no banco de dados
---

# /migrate - Workflow de Database Migration

Você está criando uma migration do Supabase.

## Instruções

### 1. Entender a Mudança
Pergunte ao usuário:
- O que precisa ser criado/alterado no banco?
- É uma tabela nova ou alteração em existente?
- Quais relações com outras tabelas?

### 2. Usar db-architect
Use o subagente `db-architect` para:
- Analisar schema atual
- Verificar migrations existentes
- Projetar a migration

### 3. Criar Migration

Gere o arquivo de migration:
```bash
# Nome do arquivo: YYYYMMDDHHMMSS_descricao.sql
# Local: supabase/migrations/
```

### 4. Checklist Obrigatório (Multi-Tenant)

Para cada tabela nova que armazena dados de tenant:

- [ ] Coluna `workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE`
- [ ] `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
- [ ] Policy SELECT: `USING (workspace_id = get_current_workspace_id())`
- [ ] Policy INSERT: `WITH CHECK (workspace_id = get_current_workspace_id())`
- [ ] Policy UPDATE: `USING (workspace_id = get_current_workspace_id())`
- [ ] Policy DELETE: `USING (workspace_id = get_current_workspace_id())`
- [ ] Index: `CREATE INDEX idx_table_workspace ON table(workspace_id);`

### 5. Validar com RLS Validator
Use `rls-validator` para verificar compliance.

### 6. Aplicar Migration

```bash
# Local (desenvolvimento)
supabase db push

# Ou para gerar tipos
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### 7. Atualizar Types
Atualize `src/integrations/supabase/types.ts` com as novas tabelas/colunas.

### 8. Reportar
Apresente:
- Migration criada
- Tabelas afetadas
- Comando para aplicar

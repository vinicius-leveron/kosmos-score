---
name: module
description: Cria a estrutura completa de um novo módulo do toolkit
---

# /module - Criar Novo Módulo

Você está criando um novo módulo para o KOSMOS Toolkit.

## Instruções

### 1. Coletar Informações

Pergunte ao usuário:
- Nome do módulo (ex: "community", "analytics")
- Descrição curta
- Quais planos terão acesso? (free, starter, pro, enterprise)
- Features principais?

### 2. Criar Estrutura de Pastas

```
src/modules/{module-name}/
├── index.ts              # Module manifest
├── routes.tsx            # Routes configuration
├── types.ts              # TypeScript types
├── components/
│   └── .gitkeep
├── hooks/
│   └── .gitkeep
├── api/
│   └── queries.ts        # React Query hooks
└── lib/
    └── .gitkeep
```

### 3. Criar Module Manifest

```typescript
// src/modules/{module-name}/index.ts
import type { ModuleManifest } from '@/core/modules/types';

export const {moduleName}Module: ModuleManifest = {
  id: '{module-id}',
  name: '{Display Name}',
  description: '{Descrição}',
  version: '1.0.0',
  plans: ['pro', 'enterprise'],
  permissions: ['{module-id}:read', '{module-id}:write'],
  navigation: [
    {
      label: '{Label}',
      path: '/{module-id}',
      icon: 'LayoutDashboard',
    },
  ],
  routes: () => import('./routes'),
};
```

### 4. Criar Routes

```typescript
// src/modules/{module-name}/routes.tsx
import { Route, Routes } from 'react-router-dom';

// Pages
const ModuleHome = () => <div>Module Home</div>;

export default function ModuleRoutes() {
  return (
    <Routes>
      <Route index element={<ModuleHome />} />
    </Routes>
  );
}
```

### 5. Criar Types

```typescript
// src/modules/{module-name}/types.ts
export interface ModuleEntity {
  id: string;
  workspace_id: string;
  // ... campos específicos
  created_at: string;
  updated_at: string;
}
```

### 6. Criar Query Hooks

```typescript
// src/modules/{module-name}/api/queries.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useTenant } from '@/core/tenant/hooks/useTenant';

export function use{Entity}s() {
  const { workspace } = useTenant();

  return useQuery({
    queryKey: ['{entities}', workspace?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('{table_name}')
        .select('*')
        .eq('workspace_id', workspace?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!workspace,
  });
}
```

### 7. Registrar no ModuleRegistry

Adicione ao arquivo `src/core/modules/registry.ts`:

```typescript
import { {moduleName}Module } from '@/modules/{module-name}';

export const MODULE_REGISTRY = {
  // ... outros módulos
  '{module-id}': {moduleName}Module,
};
```

### 8. Criar Migration (se necessário)

Use `/migrate` para criar as tabelas do módulo.

### 9. Reportar

```markdown
## Módulo Criado: {Name}

### Estrutura
- src/modules/{module-name}/
  - index.ts ✅
  - routes.tsx ✅
  - types.ts ✅
  - api/queries.ts ✅

### Próximos Passos
1. [ ] Implementar componentes
2. [ ] Criar migrations
3. [ ] Adicionar ao registry
4. [ ] Testar acesso por plano
```

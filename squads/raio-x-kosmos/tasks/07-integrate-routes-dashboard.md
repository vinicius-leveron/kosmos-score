# Task: Integrate Routes & Dashboard

## Agent
raio-x-developer

## Purpose
Adicionar rotas no App.tsx e integrar com dashboard de lead magnets.

## Prerequisites
- Componentes de quiz e resultado criados (Tasks 04, 05)

## Steps

### Step 1: Rotas em App.tsx
Adicionar 3 rotas seguindo padrão existente:
- `/quiz/raio-x` → `RaioXPage` (quiz público)
- `/embed/raio-x` → `RaioXPage` com embed=true
- `/raio-x/:id` → `RaioXResultPage` (resultado compartilhável)

### Step 2: LeadMagnetsPage
Adicionar entry ao `leadMagnetsConfig` array:
- id: `'raio_x_kosmos'`
- name: `'Raio-X KOSMOS'`
- description: `'Diagnóstico com IA que analisa modelo de negócio e gera recomendações personalizadas'`
- icon: `Zap`
- publicUrl: `'/quiz/raio-x'`
- status: `'active'`

Atualizar type union do `LeadMagnetConfig.id`.

### Step 3: Stats Hook
Em `useLeadMagnetSummary`, adicionar:
```ts
raio_x_kosmos: getLeadMagnetStats('raio-x-kosmos'),
```

## Output
- Rotas funcionais
- Raio-X visível no dashboard de lead magnets

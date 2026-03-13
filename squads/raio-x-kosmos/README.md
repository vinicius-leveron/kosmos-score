# Squad: Raio-X KOSMOS

Squad para construir o **Raio-X KOSMOS**, uma isca de captura premium que analisa o modelo de negócio do lead em 5 minutos usando IA e gera um resultado visual personalizado.

## Agentes

| Agente | Papel |
|--------|-------|
| `db-architect` | Migration SQL, trigger CRM, schema JSONB |
| `raio-x-developer` | Componentes React, Edge Functions, integração |
| `qa-engineer` | Testes unitários, build validation |
| `ux-reviewer` | Review visual, responsividade, identidade KOSMOS |

## Tasks (ordem de execução)

1. `01-create-migration` — Migration DB (@architect)
2. `02-create-questions-scoring` — Perguntas + scoring (@dev)
3. `03-create-edge-function` — Edge Function com Claude API (@dev)
4. `04-create-quiz-components` — Componentes do quiz (@dev)
5. `05-create-result-components` — Página de resultado (@dev)
6. `06-create-email-function` — Email via Resend (@dev)
7. `07-integrate-routes-dashboard` — Rotas + dashboard (@dev)
8. `08-tests-validation` — Testes + build (@qa)

## Plano de Implementação

Detalhes completos em `/root/.claude/plans/starry-crunching-avalanche.md`

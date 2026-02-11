---
name: feature
description: Inicia o workflow completo para implementar uma nova feature
---

# /feature - Workflow de Nova Feature

Você está iniciando o workflow completo de implementação de uma feature.

## Instruções

Execute os seguintes passos em ordem:

### 1. Entender o Requisito
Pergunte ao usuário:
- O que a feature deve fazer?
- Para qual módulo pertence? (kosmos-score, community, monetization, content, analytics)
- Qual a prioridade?

### 2. Planejar com PM
Use o subagente `pm-orchestrator` para:
- Quebrar a feature em tarefas
- Identificar dependências
- Definir workstreams paralelos

### 3. Pesquisar Codebase
Use o subagente `feature-planner` para:
- Encontrar código relacionado
- Identificar componentes reutilizáveis
- Entender patterns existentes

### 4. Apresentar Plano
Apresente ao usuário:
- Lista de tarefas
- Estimativa de complexidade (P/M/G)
- Arquivos que serão criados/modificados
- Riscos identificados

### 5. Aguardar Aprovação
Pergunte: "Posso prosseguir com a implementação?"

### 6. Implementar
Se aprovado, execute:
- Paralelo quando possível (db + ui)
- Testes junto com implementação
- Review automático no final

### 7. Validar
Use subagentes para:
- `code-reviewer` - qualidade do código
- `test-runner` - testes passando
- `ux-reviewer` - experiência do usuário
- `saas-security-auditor` - segurança (se mexeu em dados)

### 8. Reportar
Apresente resumo:
- O que foi implementado
- Arquivos modificados
- Próximos passos (se houver)

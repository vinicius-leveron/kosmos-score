---
name: create-variants
description: Criar variacoes de anuncio para teste A/B usando matriz 3x3
agents: [variant-generator, cta-specialist]
elicit: true
---

# Task: Criar Variacoes

## Objetivo

Criar 9 variacoes de um anuncio base para teste A/B estruturado.

---

## Input Necessario

```yaml
anuncio_base:
  hook: "[texto do hook]"
  problema: "[texto do problema]"
  agitacao: "[texto da agitacao]"
  solucao: "[texto da solucao]"
  cta: "[texto do CTA]"

configuracao:
  tom: "[empoderador/provocativo/urgente]"
  elementos_variaveis: "[hook/corpo/cta/todos]"
  quantidade_versoes: "[3/6/9]"

contexto:
  lead_magnet: "[nome]"
  perfil_icp: "[tipo]"
  orcamento_teste: "[baixo/medio/alto]"
```

---

## Matriz de Variacoes 3x3

```
                    HOOK
           Dor    Resultado    Curiosidade
         ┌───────┬───────────┬─────────────┐
    Dor  │  A1   │    A2     │     A3      │
CORPO    ├───────┼───────────┼─────────────┤
Aspiracao│  B1   │    B2     │     B3      │
         ├───────┼───────────┼─────────────┤
Urgencia │  C1   │    C2     │     C3      │
         └───────┴───────────┴─────────────┘

Total: 9 combinacoes possiveis
```

---

## Workflow

### Passo 1: Definir Estrategia

Baseado em `orcamento_teste`:

| Orcamento | Estrategia | Versoes |
|-----------|------------|---------|
| Baixo | Teste de Hook | 3 |
| Medio | Teste de Hook + Corpo | 6 |
| Alto | Matriz completa | 9 |

### Passo 2: Gerar Variacoes de Hook

**Hook tipo Dor:**
```
"Cansado de [dor especifica]?"
"[Situacao frustrante] de novo?"
"Ainda [problema recorrente]?"
```

**Hook tipo Resultado:**
```
"Como [grupo] estao [resultado]"
"[Resultado] em [tempo]"
"Descubra seu [metrica]"
```

**Hook tipo Curiosidade:**
```
"O que [grupo] sabe que voce nao"
"Existe um [elemento oculto]"
"[X]% nao sabem disso"
```

### Passo 3: Gerar Variacoes de Corpo

**Corpo tipo Dor:**
- Foco nas frustracoes
- Consequencias negativas
- "Enquanto voce...", "Todo dia que passa..."

**Corpo tipo Aspiracao:**
- Foco no futuro positivo
- Potencial nao realizado
- "Imagine...", "Voce pode..."

**Corpo tipo Urgencia:**
- Custo de nao agir
- Comparacao com outros
- "Outros ja estao...", "Cada dia..."

### Passo 4: Gerar Variacoes de CTA

```
@cta-specialist

Para cada variacao:
- CTA tipo Beneficio: "Descobrir meu [resultado]"
- CTA tipo Tempo: "Ver em [X] minutos"
- CTA tipo Direto: "Fazer [acao]"
```

### Passo 5: Montar Combinacoes

Para cada celula da matriz:
1. Selecionar hook correspondente
2. Selecionar corpo correspondente
3. Manter CTA consistente (ou variar se teste de CTA)
4. Garantir coerencia de tom

---

## Output

```markdown
# Variacoes: {lead_magnet}

## Anuncio Base
---
{hook}

{problema}

{agitacao}

{solucao}

{cta}
---

## Estrategia de Teste
**Foco:** {elementos_variaveis}
**Numero de variacoes:** {quantidade_versoes}
**Hipotese:** [o que esperamos aprender]

---

## Variacao A1: Hook Dor + Corpo Dor

**Elementos alterados:** Hook, Problema
**Hipotese:** Dor total ressoa com quem esta no fundo do poco

---

[ANUNCIO COMPLETO A1]

---

## Variacao A2: Hook Resultado + Corpo Dor

**Elementos alterados:** Hook
**Hipotese:** Contraste resultado vs dor atual

---

[ANUNCIO COMPLETO A2]

---

## Variacao A3: Hook Curiosidade + Corpo Dor

**Elementos alterados:** Hook
**Hipotese:** Curiosidade puxa, dor empurra

---

[ANUNCIO COMPLETO A3]

---

## Variacao B1: Hook Dor + Corpo Aspiracao
[...]

## Variacao B2: Hook Resultado + Corpo Aspiracao
[...]

## Variacao B3: Hook Curiosidade + Corpo Aspiracao
[...]

---

## Variacao C1: Hook Dor + Corpo Urgencia
[...]

## Variacao C2: Hook Resultado + Corpo Urgencia
[...]

## Variacao C3: Hook Curiosidade + Corpo Urgencia
[...]

---

## Ordem de Teste Recomendada

### Rodada 1: Teste de Hook (A1 vs A2 vs A3)
- **Por que:** Mesmo corpo, hooks diferentes
- **Metrica:** CTR
- **Duracao:** Ate significancia estatistica

### Rodada 2: Teste de Corpo (A-vencedor vs B-vencedor vs C-vencedor)
- **Por que:** Hook vencedor, corpos diferentes
- **Metrica:** CPL

### Rodada 3: Refinamento
- **Por que:** Combinar melhores elementos
- **Metrica:** ROAS

---

## Proximos Passos

### Se Hook Dor vencer:
- Criar mais variacoes de hook tipo dor
- Testar intensidades de dor
- Explorar dores secundarias

### Se Hook Resultado vencer:
- Criar mais variacoes de resultado
- Testar especificidade vs generalidade
- Explorar diferentes metricas

### Se Hook Curiosidade vencer:
- Criar mais gaps de curiosidade
- Testar diferentes "segredos"
- Explorar comparacoes

---

## Metricas por Variacao

| Variacao | Hook | Corpo | CTR | CPL | Status |
|----------|------|-------|-----|-----|--------|
| A1 | Dor | Dor | - | - | A testar |
| A2 | Resultado | Dor | - | - | A testar |
| A3 | Curiosidade | Dor | - | - | A testar |
| B1 | Dor | Aspiracao | - | - | A testar |
| B2 | Resultado | Aspiracao | - | - | A testar |
| B3 | Curiosidade | Aspiracao | - | - | A testar |
| C1 | Dor | Urgencia | - | - | A testar |
| C2 | Resultado | Urgencia | - | - | A testar |
| C3 | Curiosidade | Urgencia | - | - | A testar |
```

---

## Checklist de Qualidade

- [ ] Cada variacao tem diferenca significativa
- [ ] Hipotese clara para cada versao
- [ ] Apenas um elemento variavel por teste
- [ ] Todas versoes seguem linguagem do ICP
- [ ] Ordem de teste justificada
- [ ] Metricas de sucesso definidas
- [ ] Coerencia de tom mantida

---

## Fallbacks

- **Orcamento minimo:** Testar apenas 3 hooks, corpo fixo
- **Pouco tempo:** 2 versoes em vez de 3 por categoria
- **Sem dados anteriores:** Comecar com maior diferenca possivel
- **Teste inconclusivo:** Aumentar diferenca entre versoes

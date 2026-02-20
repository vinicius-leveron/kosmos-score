# Template: Estrutura de Diagnóstico

## Cabeçalho

```yaml
nome: "[Nome do Diagnóstico]"
versao: "1.0"
tempo_estimado: "[X] minutos"
total_perguntas: [N]
total_categorias: [N]
```

---

## Categorias

### Categoria 1: [Nome]

```yaml
id: "cat-1"
nome: "[Nome da Categoria]"
descricao: "[O que esta categoria avalia]"
peso: [X]%  # Peso na nota final
perguntas: [N]
```

#### Perguntas

| # | ID | Pergunta | Tipo | Opções | Scoring |
|---|----|---------| -----|--------|---------|
| 1 | q1-1 | [Texto da pergunta] | likert | 1-5 | 1=0, 2=25, 3=50, 4=75, 5=100 |
| 2 | q1-2 | [Texto da pergunta] | multipla | A/B/C/D | A=100, B=75, C=50, D=25 |
| 3 | q1-3 | [Texto da pergunta] | numero | [min-max] | formula: (valor-min)/(max-min)*100 |

---

### Categoria 2: [Nome]

[Repetir estrutura]

---

### Categoria 3: [Nome]

[Repetir estrutura]

---

## Sistema de Scoring

### Fórmula por Categoria

```
score_categoria = soma(pontos_perguntas) / total_perguntas_categoria
```

### Fórmula Geral

```
score_final = (cat1 * peso1) + (cat2 * peso2) + (cat3 * peso3)
```

### Níveis de Resultado

| Nível | Range | Label | Cor |
|-------|-------|-------|-----|
| 1 | 0-30 | Crítico | Vermelho |
| 2 | 31-60 | Atenção | Amarelo |
| 3 | 61-80 | Bom | Azul |
| 4 | 81-100 | Excelente | Verde |

---

## Template de Relatório

### Seção 1: Resumo Executivo

```markdown
# Seu Score: [VALOR]

## [LABEL DO NÍVEL]

[Headline do diagnóstico baseado no nível]

Você está [acima/na média/abaixo] de [benchmark].
```

### Seção 2: Detalhamento por Categoria

```markdown
## [Nome da Categoria]

**Score:** [X]/100 - [Label]

### O que isso significa:
[Texto explicativo baseado no score]

### Pontos fortes:
- [item baseado em perguntas com score alto]

### Pontos de atenção:
- [item baseado em perguntas com score baixo]
```

### Seção 3: Recomendações

```markdown
## Próximos Passos

Baseado no seu diagnóstico, recomendamos:

### Prioridade 1: [Ação]
[Descrição da ação baseada no gap principal]

### Prioridade 2: [Ação]
[Descrição]

### Prioridade 3: [Ação]
[Descrição]
```

### Seção 4: CTA

```markdown
## Quer Aprofundar?

[CTA baseado no nível do resultado]

[BOTÃO: Texto do CTA]
```

---

## Regras de Negócio

### Perguntas
- Máximo 15 perguntas total
- 2-4 perguntas por categoria
- Cada pergunta deve ser clara e sem ambiguidade
- Opções mutuamente exclusivas

### Scoring
- Todos os scores normalizados para 0-100
- Pesos das categorias devem somar 100%
- Arredondamento para inteiro no resultado final

### Relatório
- Sempre mostrar score geral primeiro
- Comparar com benchmark quando disponível
- CTA deve ser específico por nível de resultado

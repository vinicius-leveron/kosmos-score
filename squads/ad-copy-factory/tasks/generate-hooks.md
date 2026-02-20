---
name: generate-hooks
description: Gerar 15+ hooks testaveis para um lead magnet
agents: [hook-strategist]
elicit: true
---

# Task: Gerar Hooks

## Objetivo

Criar 15+ ganchos de atencao para anuncios, classificados por potencial.

---

## Input Necessario

```yaml
lead_magnet:
  nome: "[Nome do lead magnet]"
  tipo: "[diagnostico/template/calculadora/quiz]"

dor:
  principal: "[Dor principal do ICP]"
  secundarias:
    - "[Dor 2]"
    - "[Dor 3]"

beneficio:
  principal: "[O que descobre/ganha]"
  tangivel: "[Resultado concreto]"
  tempo: "[Tempo para resultado]"

icp:
  perfil: "[Tipo do ICP]"
  linguagem:
    - "[Termo 1]"
    - "[Termo 2]"
```

---

## Workflow

### Passo 1: Analise de Angulo

Identificar melhor angulo baseado no tipo de lead magnet:

| Tipo | Angulo Primario | Formulas Recomendadas |
|------|-----------------|----------------------|
| Diagnostico | Descoberta | Pergunta + Numero |
| Calculadora | Precisao | Numero + Resultado |
| Template | Facilidade | Resultado + Dor |
| Quiz | Curiosidade | Pergunta + Curiosidade |

### Passo 2: Geracao por Formula

Gerar 2-3 hooks para cada formula:

**1. Pergunta Provocativa**
```
"Voce sabe [metrica]?"
"Quantos [recurso] voce esta [problema]?"
"Ja calculou [algo]?"
```

**2. Desafio a Crenca**
```
"Esqueca o que te disseram sobre [crenca]"
"[Crenca popular] e mentira"
"O problema nao e [o que todos pensam]"
```

**3. Numero Especifico**
```
"[X]% dos [grupo] cometem esse erro"
"[X] em cada [Y] [grupo] [problema]"
"Apenas [X]% conseguem [resultado]"
```

**4. Dor Direta**
```
"Cansado de [dor]?"
"[Situacao frustrante] de novo?"
"Ainda [problema recorrente]?"
```

**5. Resultado/Transformacao**
```
"Como [grupo] estao [resultado] sem [objecao]"
"De [estado atual] para [estado desejado]"
"[Resultado] em [tempo] com [metodo]"
```

**6. Curiosidade**
```
"O que [grupo de sucesso] sabe que voce nao"
"Existe um [elemento oculto] no seu [contexto]"
"[Algo inesperado] pode [resultado]"
```

### Passo 3: Classificacao

Classificar cada hook:

**Rank A (Testar Primeiro)**
- Diferencial claro
- Hipotese forte
- Linguagem do ICP

**Rank B (Segunda Rodada)**
- Bom potencial
- Menos diferenciado
- Valido para teste

**Rank C (Backup)**
- Seguro mas generico
- Usar se A/B falharem

---

## Output

```markdown
# Hooks para {lead_magnet.nome}

## Briefing
- **Lead Magnet:** {nome}
- **Tipo:** {tipo}
- **Dor:** {dor.principal}
- **Beneficio:** {beneficio.principal}
- **Perfil:** {icp.perfil}

---

## Angulo Principal
[Descoberta/Precisao/Facilidade/Curiosidade]

---

## Hooks Rank A (Testar Primeiro)

### Pergunta Provocativa
1. "[hook 1]"
2. "[hook 2]"

### Numero Especifico
3. "[hook 3]"
4. "[hook 4]"

### Dor Direta
5. "[hook 5]"

---

## Hooks Rank B (Segunda Rodada)

### Desafio a Crenca
6. "[hook 6]"
7. "[hook 7]"

### Resultado
8. "[hook 8]"
9. "[hook 9]"

### Curiosidade
10. "[hook 10]"

---

## Hooks Rank C (Backup)

11. "[hook 11]"
12. "[hook 12]"
13. "[hook 13]"
14. "[hook 14]"
15. "[hook 15]"

---

## Recomendacao de Teste

### Fase 1: Validacao
Testar hooks #1, #3, #5 (um de cada formula top)
Por que: Maior diferenca entre abordagens

### Fase 2: Otimizacao
Pegar vencedor e testar variacoes da mesma formula
Por que: Refinar o angulo que funcionou

### Fase 3: Expansao
Testar Rank B com orcamento menor
Por que: Descobrir novos angulos

---

## Metricas de Sucesso

| Metrica | Meta | Excelente |
|---------|------|-----------|
| CTR | >1% | >2% |
| Hook Rate | >3s | >5s |
| Thumb Stop | >25% | >40% |

---

## Handoff para ad-copywriter

```
Hooks selecionados: [#1, #3, #5]
Angulo principal: [dor/resultado/curiosidade]
Tom: [urgente/empoderador/provocativo]
```
```

---

## Checklist de Qualidade

- [ ] 15+ hooks gerados
- [ ] Todas as 6 formulas usadas
- [ ] Classificacao A/B/C clara
- [ ] Max 15 palavras cada
- [ ] Sem clickbait
- [ ] Linguagem do ICP
- [ ] Gera curiosidade genuina
- [ ] Funciona sem contexto visual

---

## Fallbacks

- **Sem dados especificos:** Usar "maioria", "poucos" em vez de %
- **LM generico:** Focar na transformacao
- **Sem linguagem de ICP:** Usar dores universais de creators
- **Precisa de mais hooks:** Combinar formulas (ex: pergunta + numero)

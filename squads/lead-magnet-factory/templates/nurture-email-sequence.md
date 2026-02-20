# Template: Sequência de Nurture

## Informações da Sequência

```yaml
lead_magnet: "[Nome]"
objetivo_final: "[call/compra/etc]"
total_emails: [N]
duracao_dias: [N]
perfil_alvo: "[Tipo do ICP]"
```

---

## Timeline

| Dia | Email | Objetivo | Subject (preview) |
|-----|-------|----------|-------------------|
| 0 | Welcome | Entregar LM | "[...]" |
| 1 | Contexto | Situar | "[...]" |
| 3 | Educação 1 | Aprofundar | "[...]" |
| 5 | Prova Social | Credibilidade | "[...]" |
| 7 | Educação 2 | Objeção | "[...]" |
| 10 | CTA | Conversão | "[...]" |
| 14 | Re-engage | Última chance | "[...]" |

---

## Email 1: Welcome

**Timing:** Imediato
**Objetivo:** Entregar LM + criar expectativa

```yaml
subject: "[Confirmação + Curiosidade]"
preview: "[Complemento do subject]"
```

---

**Corpo:**

Oi [NOME],

[1 linha confirmando o que pediu]

[Link/botão para acessar o LM]

**O que fazer agora:**
1. [Instrução 1]
2. [Instrução 2]
3. [Instrução 3]

Nos próximos dias, vou te mandar [o que vem].

[Assinatura]

---

## Email 2: Contexto

**Timing:** Dia 1
**Objetivo:** Situar o problema maior

```yaml
subject: "[Curiosidade sobre o resultado/problema]"
preview: "[...]"
```

---

**Corpo:**

[NOME],

[Pergunta ou afirmação que abre o email]

[2-3 parágrafos contextualizando o problema maior]

[Transição para o que vem no próximo email]

[Assinatura]

PS: [Reforço ou pergunta]

---

## Email 3: Educação 1

**Timing:** Dia 3
**Objetivo:** Primeiro insight de valor

```yaml
subject: "[Insight ou framework]"
preview: "[...]"
```

---

**Corpo:**

[NOME],

[Hook que conecta com o email anterior]

[Insight ou framework principal]

[Exemplo ou caso]

[Transição]

[Assinatura]

---

## Email 4: Prova Social

**Timing:** Dia 5
**Objetivo:** Construir credibilidade

```yaml
subject: "[Case ou resultado]"
preview: "[...]"
```

---

**Corpo:**

[NOME],

[Introdução ao case]

**Antes:** [Situação inicial]

**Depois:** [Resultado]

**O que mudou:** [Insight]

[Transição para aplicação do lead]

[Assinatura]

---

## Email 5: Educação 2 (Objeção)

**Timing:** Dia 7
**Objetivo:** Endereçar objeção principal

```yaml
subject: "[Objeção comum]"
preview: "[...]"
```

---

**Corpo:**

[NOME],

"[Objeção na voz do lead]"

[Reconhecimento]

[Reframe]

[Evidência]

[Assinatura]

---

## Email 6: CTA

**Timing:** Dia 10
**Objetivo:** Conversão

```yaml
subject: "[Próximo passo claro]"
preview: "[...]"
```

---

**Corpo:**

[NOME],

[Resumo do que aprendeu na sequência]

[O que falta]

[CTA claro]

[Botão/Link]

[Garantia/remoção de risco]

[Assinatura]

---

## Email 7: Re-engage

**Timing:** Dia 14
**Objetivo:** Última tentativa

```yaml
subject: "[Direto/pergunta]"
preview: "[...]"
```

---

**Corpo:**

[NOME],

[Reconhecer que não respondeu - sem culpa]

[Pergunta genuína sobre o que está travando]

[CTA suave ou encerramento gracioso]

[Assinatura]

---

## Fluxo de Automação

```
[Trigger: Lead capturado]
    │
    ├── Email 1 (imediato)
    │
    ├── Wait 1 day
    │
    ├── Email 2
    │
    ├── Wait 2 days
    │
    ├── Email 3
    │
    ├── Wait 2 days
    │
    ├── Email 4
    │
    ├── Wait 2 days
    │
    ├── Email 5
    │
    ├── Wait 3 days
    │
    ├── Condition: Clicou em CTA?
    │   ├── Sim: Tag "engajado" → Sequência de conversão
    │   └── Não: Email 6
    │
    ├── Wait 4 days
    │
    ├── Condition: Converteu?
    │   ├── Sim: Remover da sequência
    │   └── Não: Email 7
    │
    └── End
```

---

## Métricas Target

| Métrica | Target | Alerta |
|---------|--------|--------|
| Open Rate | 40%+ | <30% |
| Click Rate | 5%+ | <3% |
| Unsubscribe | <2% | >5% |
| Conversion | 5%+ | <2% |

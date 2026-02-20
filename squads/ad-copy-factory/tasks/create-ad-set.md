---
name: create-ad-set
description: Criar conjunto completo de anuncios para um lead magnet
agents: [hook-strategist, ad-copywriter, cta-specialist, variant-generator]
elicit: true
---

# Task: Criar Conjunto de Anuncios

## Objetivo

Criar 5-10 anuncios estaticos completos para Meta Ads, prontos para rodar.

---

## Input Necessario

```yaml
lead_magnet:
  nome: "[Nome do lead magnet]"
  tipo: "[diagnostico/template/calculadora/quiz]"
  url: "[URL da landing page]"

proposta_valor:
  o_que_descobre: "[O que o lead descobre/ganha]"
  tempo_para_resultado: "[Ex: 3 minutos]"
  beneficio_tangivel: "[Resultado concreto]"

icp:
  perfil_primario: "[Tipo do ICP]"
  dor_principal: "[Camada de dor]"
  linguagem: "[Termos que usa]"

campanha:
  objetivo: "[awareness/consideracao/conversao]"
  quantidade_anuncios: "[5-10]"
  incluir_variacoes: "[sim/nao]"
```

---

## Workflow

### Fase 1: Geracao de Hooks (hook-strategist)

```
@hook-strategist

BRIEFING DO HOOK

Lead Magnet: {lead_magnet.nome}
Tipo: {lead_magnet.tipo}
Dor principal: {icp.dor_principal}
Resultado prometido: {proposta_valor.o_que_descobre}
Perfil alvo: {icp.perfil_primario}

Gerar 15+ hooks seguindo as formulas.
Classificar em A, B, C.
Selecionar top 5 para desenvolvimento.
```

**Output esperado:** 15+ hooks classificados, top 5 selecionados

---

### Fase 2: Desenvolvimento de Copy (ad-copywriter)

```
@ad-copywriter

Para cada hook selecionado:

BRIEFING DO ANUNCIO

Hook aprovado: "[hook do rank A]"
Lead Magnet: {lead_magnet.nome}
Tipo: {lead_magnet.tipo}
Dor principal: {icp.dor_principal}
O que o lead descobre/ganha: {proposta_valor.o_que_descobre}
CTA desejado: "[sugestao]"
Perfil alvo: {icp.perfil_primario}

Desenvolver anuncio completo usando estrutura PAS.
```

**Output esperado:** 5 anuncios completos com estrutura PAS

---

### Fase 3: Otimizacao de CTAs (cta-specialist)

```
@cta-specialist

Para cada anuncio:

CONTEXTO DO CTA

Lead Magnet: {lead_magnet.nome}
Tipo: {lead_magnet.tipo}
Acao principal: [o que o usuario faz]
Resultado: {proposta_valor.o_que_descobre}
Tom do anuncio: [empoderador/provocativo/urgente]

Gerar 3 CTAs primarios e 3 secundarios.
Incluir textos de suporte (redutores de atrito).
```

**Output esperado:** CTAs otimizados para cada anuncio

---

### Fase 4: Variacoes A/B (variant-generator) [Opcional]

```
@variant-generator

Se incluir_variacoes = sim:

Para os 2 melhores anuncios:

ANUNCIO BASE

Hook: [texto]
Corpo: [texto]
CTA: [texto]
Tom: [empoderador/provocativo/urgente]
Elementos para variar: [hook/corpo/cta/todos]

Gerar 3 variacoes de cada.
```

**Output esperado:** 6 variacoes adicionais (3 por anuncio)

---

## Output Final

```markdown
# Conjunto de Anuncios: {lead_magnet.nome}

## Resumo
- Total de anuncios: [X]
- Hooks testados: [X]
- Variacoes geradas: [X]

---

## Anuncio 1: [Nome descritivo]

### Copy Principal
---
[HOOK]

[PROBLEMA]

[AGITACAO]

[SOLUCAO]

[CTA]
---

### Elementos
- **Botao:** [texto]
- **Headline:** [texto]
- **Descricao:** [texto]

### Direcao Visual
- Tom: [...]
- Elemento principal: [...]
- Texto na imagem: [...]

---

## Anuncio 2: [Nome descritivo]
[...]

---

## Anuncio 3: [Nome descritivo]
[...]

---

## Anuncio 4: [Nome descritivo]
[...]

---

## Anuncio 5: [Nome descritivo]
[...]

---

## Variacoes (se aplicavel)

### Variacao 1.1
[...]

### Variacao 1.2
[...]

---

## Ordem de Teste Recomendada

### Rodada 1 (Validacao de Hook)
Testar anuncios #[X] vs #[Y] vs #[Z]
Metrica: CTR
Duracao: [X] dias / [X] conversoes

### Rodada 2 (Otimizacao)
Vencedor vs variacoes
Metrica: CPL

### Rodada 3 (Escala)
Top performers com orcamento aumentado

---

## Proximos Passos

1. Aprovar anuncios com equipe
2. Criar criativos visuais
3. Configurar campanha no Meta Ads
4. Rodar testes A/B
5. Analisar resultados e iterar
```

---

## Checklist de Qualidade

- [ ] Todos anuncios tem estrutura PAS completa
- [ ] Hooks sao distintos entre si
- [ ] CTAs tem acao + beneficio
- [ ] Linguagem do ICP em todos
- [ ] Sem promessas irrealistas
- [ ] Direcionamento visual definido
- [ ] Ordem de teste justificada

---

## Fallbacks

- **Sem dados de ICP:** Usar linguagem generica de creators
- **Lead magnet generico:** Focar na transformacao
- **Pouco tempo:** Criar 3 anuncios em vez de 5
- **Sem variacoes:** Pular fase 4

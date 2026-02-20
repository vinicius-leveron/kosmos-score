# Map Buyer Journey

## Purpose
Mapear a jornada de decisão completa de um lead específico ou persona, integrando Revella (5 Rings), Schwartz (níveis de consciência) e Hormozi (equação de valor).

## Prerequisites
- Perfil do lead ou persona a mapear
- Contexto do negócio/oferta
- Acesso ao documento de ICP

## Interactive Elicitation Process

### Step 1: Definir Sujeito
```
ELICIT: Quem Estamos Mapeando

1. Tipo de mapeamento:
   □ Lead específico (pessoa real)
   □ Persona/perfil geral

2. Se lead específico:
   - Nome/@: [texto]
   - O que você sabe sobre ele: [texto]

3. Se persona:
   - Qual perfil principal?
     □ Professor Preso
     □ Lançador Cansado
     □ Community Builder Frustrado
     □ Expert Técnico
     □ Creator-Empresário Travado
```

### Step 2: Contexto da Oferta
```
ELICIT: Oferta a Considerar

1. Qual oferta/produto?
   □ Consultoria/implementação (R$ 20-30k)
   □ Sala fechada (R$ 997/ano)
   □ Imersão presencial
   □ Outro: [especificar]

2. Ticket médio:
   [valor]
```

## Implementation Steps

1. **Carregar conhecimento**
   - Ler `data/icp-creator-kosmos.md`
   - Focar nas seções de jornada de decisão

2. **Analisar nível de consciência (Schwartz)**
   - Unaware: Não sabe que tem problema
   - Problem-aware: Sabe do problema
   - Solution-aware: Sabe que existem soluções
   - Product-aware: Conhece sua solução
   - Most-aware: Pronto pra comprar

3. **Aplicar 5 Rings (Revella)**
   - Priority Initiatives: Por que agora?
   - Success Factors: O que define sucesso?
   - Perceived Barriers: O que impede?
   - Buyer's Journey: Como decide?
   - Decision Criteria: Como compara?

4. **Calcular equação de valor (Hormozi)**
   - Dream Outcome: O que ele quer?
   - Perceived Likelihood: Acredita que funciona?
   - Time Delay: Quanto tempo pra resultado?
   - Effort & Sacrifice: Quanto vai custar?

5. **Mapear 6 micro-momentos**
   - Momento 1: Conteúdo é pra mim?
   - Momento 2: Sabem do que falam?
   - Momento 3: Funciona pro meu caso?
   - Momento 4: Entendem MEU problema?
   - Momento 5: Vale o risco?
   - Momento 6: O que meu conselheiro acha?

6. **Identificar touchpoints críticos**
   - Onde ele pesquisa
   - Quem ele consulta
   - O que ele compara

7. **Mapear critérios de decisão**
   - Em ordem de peso
   - Com resposta KOSMOS para cada

## Validation Checklist
- [ ] Nível de consciência identificado
- [ ] 5 Rings preenchidos
- [ ] Equação de valor calculada
- [ ] 6 micro-momentos mapeados
- [ ] Touchpoints listados
- [ ] Critérios de decisão rankeados
- [ ] Recomendações de ação geradas

## Error Handling
- Se pouca informação: usar perfil mais provável
- Se múltiplos perfis: mapear o dominante
- Se jornada atípica: documentar exceção

## Success Output
```
✅ Jornada de decisão mapeada!

👤 Perfil: [nome/tipo]
📊 Nível de consciência: [nível]

📋 Resumo da Jornada:

SCHWARTZ:
- Atual: [nível]
- Próximo: [nível]
- Como avançar: [ação]

REVELLA (5 Rings):
- Priority: [...]
- Success: [...]
- Barriers: [...]
- Journey: [...]
- Criteria: [...]

HORMOZI:
- Dream Outcome: [...]
- Likelihood: [alto/médio/baixo]
- Time Delay: [...]
- Effort: [...]

MICRO-MOMENTOS:
- Atual: Momento [N]
- Próximo: Momento [N+1]
- Como avançar: [ação]

🎯 Recomendações:
1. [Ação prioritária]
2. [Ação secundária]
3. [Ação terciária]
```

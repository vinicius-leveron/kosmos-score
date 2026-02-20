# Ad Copy Factory

Squad AIOS especializada em criar copy de anuncios estaticos para Meta Ads (Facebook/Instagram).

## Objetivo

Criar anuncios de alta conversao para divulgar lead magnets (iscas), gerando:
- Hooks que param o scroll
- Copy que conecta dor com solucao
- CTAs que convertem
- Variacoes para teste A/B

## Agentes

| Agente | Funcao |
|--------|--------|
| **hook-strategist** | Criar ganchos de atencao (1a linha) |
| **ad-copywriter** | Escrever corpo do anuncio |
| **cta-specialist** | Criar CTAs de alta conversao |
| **variant-generator** | Gerar variacoes para A/B test |

## Tasks

| Task | Input | Output |
|------|-------|--------|
| `create-ad-set` | Lead magnet + ICP | 5-10 anuncios completos |
| `generate-hooks` | Dor/beneficio | 15+ hooks testaveis |
| `create-variants` | Anuncio base | 9 variacoes (matrix 3x3) |

## Uso

```bash
# Ativar agente de hooks
@hook-strategist

# Executar task de criacao de anuncios
*create-ad-set

# Gerar variacoes de um anuncio
*create-variants
```

## Estrutura de Anuncio

```
[HOOK - 1 linha que para o scroll]

[PROBLEMA - 2-3 linhas identificando a dor]

[AGITACAO - 1-2 linhas ampliando a dor]

[SOLUCAO - 2-3 linhas apresentando o lead magnet]

[CTA - Chamada clara para acao]
```

## Integracao

```
lead-magnet-factory → briefing do LM
        ↓
icp-specialist → linguagem e dores
        ↓
ad-copy-factory → anuncios prontos
        ↓
Designer → criativo final
```

## Linguagem

### USAR
- Linguagem do ICP (creator, base engajada, previsibilidade)
- Numeros especificos
- Perguntas provocativas
- Beneficios tangíveis

### EVITAR
- "Fature 6 digitos"
- "Metodo secreto/exclusivo"
- Emojis excessivos
- CAIXA ALTA
- Promessas irrealistas

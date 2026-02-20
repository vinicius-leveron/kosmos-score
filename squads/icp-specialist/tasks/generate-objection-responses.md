# Generate Objection Responses

## Purpose
Gerar respostas preparadas para objeções específicas de um lead ou treinar equipe com as 12 objeções mapeadas do ICP KOSMOS.

## Prerequisites
- Objeção(ões) a tratar
- Contexto (se objeção específica)
- Acesso ao documento de ICP

## Interactive Elicitation Process

### Step 1: Definir Escopo
```
ELICIT: Tipo de Trabalho

1. O que você precisa?
   □ Responder objeção específica de um lead
   □ Preparar respostas para todas as 12 objeções
   □ Treinar equipe de vendas
   □ Criar FAQ de objeções
```

### Step 2: Se Objeção Específica
```
ELICIT: Detalhes da Objeção

1. Qual foi a objeção exata (nas palavras dele)?
   [texto]

2. Contexto da conversa:
   - Canal: □ DM □ Email □ Call □ WhatsApp
   - Momento: □ Primeira abordagem □ Após proposta □ Follow-up
   - Perfil do lead: [se souber]

3. Tom do lead:
   □ Curioso mas hesitante
   □ Cético/desconfiado
   □ Interessado mas com barreira
   □ Negativo/resistente
```

### Step 3: Se Preparação Geral
```
ELICIT: Configuração

1. Formato desejado:
   □ Documento de referência (todas as 12)
   □ Cards de resposta rápida
   □ Script de treinamento
   □ FAQ para site/landing

2. Nível de detalhe:
   □ Respostas curtas (DM)
   □ Respostas completas (call)
   □ Ambos
```

## Implementation Steps

1. **Carregar conhecimento**
   - Ler `data/icp-creator-kosmos.md` (seção de objeções)
   - Carregar template `templates/objection-response-template.md`

2. **Se objeção específica:**
   - Identificar qual das 12 mais se aproxima
   - Analisar o que está por trás
   - Adaptar resposta ao contexto
   - Criar variações por canal

3. **Se preparação geral:**
   - Listar todas as 12 objeções
   - Gerar resposta para cada
   - Criar versão curta e longa
   - Adicionar perguntas de follow-up

4. **Aplicar framework LAER:**
   - Listen: orientação de escuta
   - Acknowledge: frase de validação
   - Explore: pergunta de aprofundamento
   - Respond: reframe + pergunta que avança

5. **Preparar fallbacks:**
   - O que fazer se persistir
   - O que fazer se nova objeção surgir
   - Quando aceitar o "não"

## Validation Checklist
- [ ] Objeção identificada corretamente
- [ ] Motivação por trás mapeada
- [ ] Resposta valida antes de reframejar
- [ ] Não confronta nem pressiona
- [ ] Pergunta de follow-up incluída
- [ ] Variações por canal (se aplicável)
- [ ] Fallback definido

## Error Handling
- Se objeção não mapeada: criar nova entrada
- Se múltiplas objeções: tratar a mais forte primeiro
- Se objeção é "não" definitivo: aceitar graciosamente

## Success Output

### Para Objeção Específica:
```
✅ Resposta preparada!

📝 Objeção: "[texto da objeção]"
🎯 Mapeada como: Objeção [N]
💭 Por trás: [motivação]

📱 Resposta para DM:
```
[resposta curta]
```

📞 Resposta para Call:
```
[resposta completa]
```

❓ Follow-up:
"[pergunta para avançar]"

⚠️ Se persistir:
[orientação]
```

### Para Preparação Geral:
```
✅ Kit de objeções criado!

📋 Total: 12 objeções mapeadas
📝 Formatos: Curto + Completo

📄 Documento gerado: objection-responses.md

🎯 As 3 mais comuns:
1. [Objeção] - [resposta resumida]
2. [Objeção] - [resposta resumida]
3. [Objeção] - [resposta resumida]
```

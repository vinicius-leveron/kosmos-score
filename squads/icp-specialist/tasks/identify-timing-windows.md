# Identify Timing Windows

## Purpose
Analisar um lead ou lista de leads para identificar janelas de alta/baixa receptividade e recomendar momento ideal de abordagem.

## Prerequisites
- Informações do lead (perfil público, posts recentes)
- Objetivo da abordagem
- Acesso ao documento de ICP

## Interactive Elicitation Process

### Step 1: Definir Escopo
```
ELICIT: Tipo de Análise

1. O que você precisa analisar?
   □ Lead específico (individual)
   □ Lista de leads (batch)
   □ Criar critérios de timing para equipe
```

### Step 2: Se Lead Específico
```
ELICIT: Informações do Lead

1. Nome/@:
   [texto]

2. Plataforma principal:
   □ Instagram
   □ YouTube
   □ LinkedIn
   □ Outra

3. Sinais observados recentemente:
   □ Pós-lançamento (resultado bom)
   □ Pós-lançamento (resultado ruim)
   □ Stories reflexivos
   □ Sumiu/pausou postagens
   □ Celebrando conquista
   □ Reclamando de algo
   □ Perguntando sobre novos modelos
   □ Conteúdo motivacional intenso
   □ Nenhum sinal específico
   □ Outro: [especificar]

4. Último lançamento (se souber):
   □ Agora mesmo
   □ Últimos 7 dias
   □ Últimas 2-4 semanas
   □ Mais de 1 mês
   □ Não sei
```

### Step 3: Contexto da Abordagem
```
ELICIT: Objetivo

1. Qual o objetivo da abordagem?
   □ Primeira conversa (cold)
   □ Follow-up de conversa anterior
   □ Retomada de lead frio
   □ Convite para evento/conteúdo
```

## Implementation Steps

1. **Carregar conhecimento**
   - Ler `data/icp-creator-kosmos.md` (seções de timing)

2. **Analisar sinais**
   - Mapear eventos trigger identificados
   - Identificar sinais de alta/baixa receptividade
   - Calcular janela estimada

3. **Identificar micro-momento atual**
   - Em qual dos 6 micro-momentos o lead está
   - O que precisa acontecer para avançar

4. **Avaliar timing geral**
   - Dia da semana atual
   - Hora do dia
   - Contexto do mercado

5. **Gerar recomendação**
   - Abordar agora? Sim/Não/Esperar
   - Se sim: canal, horário, abordagem
   - Se não: quando reavaliar, sinais a monitorar

## Validation Checklist
- [ ] Sinais analisados corretamente
- [ ] Eventos trigger identificados
- [ ] Micro-momento atual mapeado
- [ ] Janela de receptividade calculada
- [ ] Recomendação clara gerada
- [ ] Próximos passos definidos

## Error Handling
- Se pouca informação: assumir timing neutro
- Se sinais contraditórios: listar ambos, recomendar cautela
- Se urgência incerta: priorizar não perder janela

## Success Output
```
✅ Análise de timing concluída!

👤 Lead: [nome]
📅 Data da análise: [data]

📊 Diagnóstico:

RECEPTIVIDADE: [Alta/Média/Baixa]
│
├─ Sinais positivos:
│  • [sinal 1]
│  • [sinal 2]
│
└─ Sinais negativos:
   • [sinal 1]

EVENTOS TRIGGER:
• [evento] - Janela: [período]

MICRO-MOMENTO: [N] de 6
• Atual: "[descrição]"
• Para avançar: [ação]

🎯 RECOMENDAÇÃO:

Abordar agora? [SIM/NÃO/ESPERAR]

[Se SIM]
• Canal: [...]
• Horário ideal: [...]
• Abordagem: [...]

[Se NÃO/ESPERAR]
• Reavaliar em: [período]
• Sinais a monitorar: [lista]

⚠️ Janela estimada: [datas/condições]
```

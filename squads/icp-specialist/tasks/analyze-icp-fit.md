# Analyze ICP Fit

## Purpose
Verificar se uma copy, conteúdo ou comunicação está alinhada com o ICP KOSMOS, identificando gaps e oportunidades de melhoria.

## Prerequisites
- Texto/conteúdo a ser analisado
- Contexto de uso (ad, DM, carrossel, email, etc.)
- Objetivo da comunicação

## Interactive Elicitation Process

### Step 1: Coletar Material
```
ELICIT: Material para Análise

1. Cole o texto/copy a ser analisado:
   [área de texto]

2. Qual o formato?
   □ Ad (Facebook/Instagram)
   □ DM de prospecção
   □ Carrossel Instagram
   □ Email
   □ Landing page
   □ Script de call
   □ Outro: [especificar]

3. Qual o objetivo?
   □ Atrair atenção (topo de funil)
   □ Gerar engajamento (meio de funil)
   □ Converter (fundo de funil)
   □ Reter/engajar existente
```

### Step 2: Definir Critérios
```
ELICIT: Critérios de Análise

1. Qual perfil principal você quer atingir?
   □ Professor Preso
   □ Lançador Cansado
   □ Community Builder Frustrado
   □ Expert Técnico
   □ Creator-Empresário Travado
   □ Todos (geral)

2. Qual porta emocional você quer abrir?
   □ Alívio ("Finalmente alguém entende")
   □ Inveja Estratégica ("Ele conseguiu")
   □ Esgotamento ("Não aguento mais")
   □ Não sei / preciso de recomendação
```

## Implementation Steps

1. **Carregar conhecimento**
   - Ler `data/icp-creator-kosmos.md`
   - Ler `data/perfis-icp.yaml`

2. **Analisar camadas de dor**
   - Verificar quais das 7 camadas são atingidas
   - Identificar se atinge superfície ou profundidade

3. **Analisar porta emocional**
   - Identificar qual porta está sendo ativada
   - Avaliar força da ativação

4. **Analisar linguagem**
   - Verificar uso de linguagem do ICP
   - Identificar linguagem que repele
   - Checar tom adequado ao perfil

5. **Analisar perfis**
   - Identificar quais perfis são atingidos
   - Identificar quais são excluídos

6. **Gerar score e recomendações**
   - Calcular score de alinhamento (0-100)
   - Listar pontos fortes
   - Listar gaps críticos
   - Sugerir melhorias específicas

## Validation Checklist
- [ ] Todas as 7 camadas foram avaliadas
- [ ] Porta emocional identificada
- [ ] Linguagem analisada (usar vs evitar)
- [ ] Perfis atingidos/excluídos listados
- [ ] Score calculado
- [ ] Recomendações específicas geradas

## Error Handling
- Se texto muito curto: pedir contexto adicional
- Se objetivo não claro: assumir topo de funil
- Se perfil não especificado: analisar para todos

## Success Output
```
✅ Análise de ICP concluída!

📊 Score de Alinhamento: XX/100

📋 Resumo:
- Camadas atingidas: X de 7
- Porta ativada: [nome]
- Perfis alcançados: X de 5
- Linguagem: X acertos, Y gaps

📝 Recomendações:
1. [Ação específica]
2. [Ação específica]
3. [Ação específica]
```

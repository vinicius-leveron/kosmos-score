# Task: Create Result Page Components

## Agent
raio-x-developer

## Purpose
Criar os componentes visuais do resultado do Raio-X com 4 seções.

## Prerequisites
- Edge Function retornando outputs (Task 03)
- `lib/types.ts` com tipos de output

## Steps

### Step 1: ResultScreen
`src/modules/raio-x/components/result/ResultScreen.tsx`
- Container principal com fundo #050505
- Header com nome do lead e classificação
- Renderiza 4 seções em sequência
- Botão compartilhar (copia URL)

### Step 2: ModelMapSection (Seção 1)
`src/modules/raio-x/components/result/ModelMapSection.tsx`
- Dois painéis lado a lado (desktop) / empilhados (mobile)
- Painel esquerdo (vermelho #f87171): "SEU MODELO" — fluxo ciclo fechado
- Painel direito (verde #4ade80): "MODELO CERTO" — fluxo ciclo aberto
- Frase final do Prompt 4 embaixo
- Classificação: CICLO_FECHADO / CICLO_PARCIAL / CICLO_ABERTO
- Score de dependência (0-100)

### Step 3: RevenueSection (Seção 2)
`src/modules/raio-x/components/result/RevenueSection.tsx`
- 3 números grandes em grid:
  - FATURA HOJE (neutro)
  - PODERIA FATURAR (verde)
  - RECEITA TRAVADA (vermelho/laranja)
- Feature vs Transformação do Prompt 2 (contraste visual)
- Causa/Inimigo/Narrativa do Prompt 3

### Step 4: OpportunitiesSection (Seção 3)
`src/modules/raio-x/components/result/OpportunitiesSection.tsx`
- Grid de 4 cards de oportunidade
- Cada card: título, descrição, 4 itens, valor estimado
- Cards com borda sutil #E05A30
- Tipos: RECORRÊNCIA, EVENTO, HIGH TICKET, AÇÃO IMEDIATA

### Step 5: CTASection (Seção 4)
`src/modules/raio-x/components/result/CTASection.tsx`
- Número grande: total de oportunidades somadas
- Frase de transição
- CTA condicional por classificação:
  - QUALIFICADO (12+): Botão "AGENDAR DIAGNÓSTICO GRATUITO" → https://cal.com/vinicius-kosmos
  - EM_CONSTRUCAO (6-11): Texto + lista de espera
  - INICIO (0-5): Texto + botão para conteúdo gratuito

### Step 6: ProcessingScreen
`src/modules/raio-x/components/ProcessingScreen.tsx`
- Fundo #050505
- Animação de loading (spinner ou pulse)
- Mensagens rotativas a cada 3s
- Auto-redirect quando resultado chega

## Output
- 6 componentes visuais com identidade KOSMOS

# Task: Create Quiz Flow Components

## Agent
raio-x-developer

## Purpose
Criar componentes React do fluxo de quiz: WelcomeScreen, QuestionScreen, RaioXFlow.

## Prerequisites
- `lib/questions.ts` criado (Task 02)
- Referência: `src/modules/maturity-diagnostic/components/DiagnosticFlow.tsx`

## Steps

### Step 1: EmbedContext + useEmbedMessaging
Copiar e adaptar de `src/modules/maturity-diagnostic/contexts/EmbedContext.tsx` e hooks.

### Step 2: WelcomeScreen
`src/modules/raio-x/components/WelcomeScreen.tsx`
- Campos: Nome (required), Email (required), Instagram handle (required)
- Validação com Zod
- Visual: fundo #050505, destaque #E05A30
- Título: "Raio-X KOSMOS" + subtítulo explicando o diagnóstico
- CTA: "Começar Diagnóstico"

### Step 3: QuestionScreen
`src/modules/raio-x/components/QuestionScreen.tsx`
- Renderiza pergunta atual baseado no tipo (single choice ou text)
- Progress bar mostrando bloco atual
- Navegação: Anterior / Próxima
- Validação: não avançar sem responder
- Animação de transição entre perguntas

### Step 4: RaioXFlow
`src/modules/raio-x/components/RaioXFlow.tsx`
- Orquestra: welcome → questions → processing → result
- Gerencia state de respostas
- Ao completar perguntas: chama `useProcessRaioX` e mostra ProcessingScreen
- Ao receber resultado: mostra ResultScreen

### Step 5: Pages
- `src/modules/raio-x/pages/RaioXPage.tsx` — Wrapper com EmbedProvider
- `src/modules/raio-x/pages/RaioXResultPage.tsx` — Busca resultado por ID

## Output
- Componentes funcionais do quiz flow

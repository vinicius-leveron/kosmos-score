# Task: Create Email Edge Function (Resend)

## Agent
raio-x-developer

## Purpose
Criar Edge Function que envia email com link do resultado via Resend.

## Prerequisites
- `RESEND_API_KEY` configurado como secret do Supabase
- Edge Function `raio-x-process` funcionando (Task 03)

## Steps

### Step 1: Criar Edge Function
`supabase/functions/send-raio-x-email/index.ts`

### Step 2: Implementar
1. Recebe POST com: `{ name, email, resultId, classification }`
2. Monta URL do resultado: `{APP_URL}/#/raio-x/{resultId}`
3. Gera HTML do email com identidade KOSMOS
4. Envia via Resend API: `POST https://api.resend.com/emails`
5. Retorna status

### Step 3: Template HTML
- Fundo escuro (#050505)
- Logo KOSMOS
- Saudação personalizada com nome
- Preview da classificação (badge colorido)
- Botão CTA laranja (#E05A30): "Ver Meu Raio-X Completo"
- Footer minimalista

### Step 4: Integrar com raio-x-process
Adicionar chamada ao `send-raio-x-email` no final do fluxo do `raio-x-process`.

## Output
- Edge Function de email funcional

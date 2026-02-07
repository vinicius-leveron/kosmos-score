

# Auditoria de Lucro Oculto KOSMOS

## Visão Geral
Ferramenta diagnóstica interativa com 10 perguntas que gera o **KOSMOS Asset Score** e calcula o Lucro Oculto anual do participante. Design clean e corporativo com visual de relatório de consultoria premium.

---

## Fluxo do Usuário

### 1. Tela de Boas-Vindas + Coleta de Email
- Headline impactante: "Descubra quanto dinheiro está dormindo na sua base"
- Campo de email obrigatório
- Botão "Iniciar Auditoria" em laranja queimado
- Tempo estimado: 3 minutos

### 2. Auditoria (10 Perguntas)
- **Bloco A (Perguntas 1-4):** Dados Quantitativos
  - Tamanho da base, ticket médio, número de ofertas, frequência de comunicação
- **Bloco B (Perguntas 5-10):** Diagnóstico dos 3 Pilares
  - Causa (P5-P6), Cultura (P7-P8), Economia (P9-P10)
- Barra de progresso visual
- Uma pergunta por tela (navegação fluida)
- Design com cards elegantes em tons de preto

### 3. Tela de Resultado
- **KOSMOS Asset Score** (0-100) com classificação visual
  - 🔴 Inquilino do Algoritmo (0-25)
  - 🟠 Gerente de Audiência (26-50)
  - 🟡 Arquiteto de Comunidade (51-75)
  - 🟢 Dono de Ecossistema (76-100)
- **Diagnóstico por Pilar** (Causa, Cultura, Economia)
- **Lucro Oculto Anual** em destaque (valor em R$)
- Botões de ação:
  - 📄 Baixar PDF do Relatório
  - 📲 Compartilhar Score (sem valor financeiro)
  - ▶ Entrar no Grupo do Workshop (CTA principal)

### 4. Modo Iniciante (automático)
- Ativado se base < 500 ou score < 20
- Tom muda para "potencial" em vez de "perda"
- Mensagem motivacional de vantagem competitiva

---

## Design Visual

### Paleta de Cores
- **Fundo:** Preto (#0A0A0A) com gradientes para preto mais claro (#1A1A1A, #2A2A2A)
- **Destaque:** Laranja queimado (#D4621B)
- **Texto:** Branco (#FFFFFF) e cinza claro (#A0A0A0)
- **Cards:** Preto translúcido com bordas sutis

### Estilo
- Tipografia moderna e legível
- Cards com sombras suaves
- Animações sutis de transição
- Visual de relatório executivo/consultoria

---

## Backend (Lovable Cloud)

### Banco de Dados
- Tabela `audit_results` para armazenar:
  - Email do participante
  - Respostas das 10 perguntas
  - Score por pilar
  - KOSMOS Asset Score total
  - Lucro Oculto calculado
  - Data/hora da auditoria

### Funcionalidades
- Salvar automaticamente ao completar
- Geração de PDF do relatório

---

## Lógica de Cálculo (conforme especificação)

### KOSMOS Asset Score
- Causa (30%): média P5 + P6
- Cultura (30%): média P7 + P8
- Economia (40%): média P9 + P10

### Lucro Oculto
- Fórmula conservadora baseada em: Base × Ticket × Multiplicadores × Gap de Conversão × 4 ciclos/ano


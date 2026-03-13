# Raio-X KOSMOS — Implementation Checklist

## Database
- [ ] Migration criada com tipo `raio-x-kosmos`
- [ ] Constraint atualizada (preservando tipos existentes)
- [ ] Trigger `sync_lead_magnet_to_contact()` atualizado
- [ ] Mapeamento de score → pipeline stage correto

## Quiz Flow
- [ ] WelcomeScreen captura nome + email + instagram
- [ ] 13 perguntas renderizam corretamente
- [ ] Perguntas abertas (P4, P10, P11, P12) aceitam texto
- [ ] Navegação anterior/próxima funciona
- [ ] Progress bar mostra progresso correto
- [ ] Validação impede avançar sem responder

## AI Processing
- [ ] Edge Function recebe e valida respostas
- [ ] Lead score calculado corretamente server-side
- [ ] 4 prompts executam em paralelo
- [ ] Respostas Claude parseadas como JSON
- [ ] Fallback para perguntas abertas vazias
- [ ] Rate limit implementado (5/email/dia)
- [ ] Timeout 30s com fallback

## Resultado
- [ ] Seção 1 (Mapa do Modelo) renderiza com painéis
- [ ] Seção 2 (Contraste de Receita) mostra 3 números
- [ ] Seção 3 (Oportunidades) mostra 4 cards
- [ ] Seção 4 (CTA) condicional por classificação
- [ ] CTA QUALIFICADO aponta para cal.com/vinicius-kosmos
- [ ] URL compartilhável funciona (/raio-x/:id)
- [ ] Responsivo (desktop + mobile)

## Integração
- [ ] Rotas adicionadas em App.tsx
- [ ] Lead magnet visível no dashboard admin
- [ ] Stats hook retorna dados do raio-x
- [ ] Contato criado no CRM após submissão
- [ ] Email enviado com link do resultado (Resend)

## Qualidade
- [ ] Testes unitários de scoring passando
- [ ] Build sem erros
- [ ] Componentes < 200 linhas
- [ ] Identidade visual KOSMOS aplicada
- [ ] aria-labels em botões de ícone

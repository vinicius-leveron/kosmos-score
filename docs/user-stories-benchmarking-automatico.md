# User Stories - Benchmarking Automático KOSMOS Score

## Contexto

O KOSMOS Score é um diagnóstico gratuito (lead magnet) que avalia ativos digitais em 3 pilares: **Causa** (identidade), **Cultura** (retenção) e **Economia** (monetização), gerando um score de 0-100 com classificação em 4 níveis (Inquilino, Gerente, Arquiteto, Dono).

**Problema atual:** O módulo de benchmarking existente é 100% manual. O admin precisa preencher manualmente médias de mercado, percentis, thresholds do top 10% e insights qualitativos para cada cliente. Isso não escala.

**Proposta:** Automatizar o benchmarking usando a base acumulada de `audit_results` como dataset de mercado, calculando automaticamente onde cada cliente se posiciona em relação ao ecossistema.

---

## Personas

| Persona | Descrição |
|---------|-----------|
| **Lead** | Pessoa que fez o diagnóstico KOSMOS Score (gratuito, não é cliente ainda) |
| **Cliente** | Líder de comunidade que usa a plataforma KOSMOS (pagante) |
| **Admin KOSMOS** | Equipe interna que gerencia a plataforma e o serviço de consultoria |

---

## Epic 1: Segmentação Inteligente do Dataset

> Enriquecer os dados de audit_results com segmentos que permitam comparações relevantes (comparar "iguais com iguais").

### US-1.1 — Coleta de segmento/nicho no diagnóstico

**Como** Lead que está fazendo o diagnóstico,
**Quero** informar meu nicho/segmento de atuação (ex: fitness, educação, finanças, saúde, negócios, tecnologia, lifestyle),
**Para que** meu resultado possa ser comparado com comunidades do mesmo segmento.

**Critérios de aceite:**
- [ ] Nova pergunta adicionada ao fluxo do diagnóstico (após email, antes das perguntas existentes)
- [ ] Lista de segmentos pré-definidos + opção "Outro" com campo livre
- [ ] Segmento é salvo na tabela `audit_results` (nova coluna `segment`)
- [ ] Campo não é obrigatório (backward compatible com resultados antigos que não terão segmento)
- [ ] Não aumenta friction significativa no fluxo (máximo 1 tela adicional)

### US-1.2 — Classificação automática por faixa de maturidade

**Como** sistema,
**Quero** classificar automaticamente cada audit_result em faixas de maturidade baseadas no `base_value` e `kosmos_asset_score`,
**Para que** benchmarks comparem comunidades em estágios similares.

**Critérios de aceite:**
- [ ] Faixas de maturidade definidas:
  - **Iniciante**: base_value < 1.000 OU kosmos_asset_score < 25
  - **Em crescimento**: base_value 1.000-5.000 E kosmos_asset_score 25-50
  - **Estabelecido**: base_value 5.000-10.000 E kosmos_asset_score 50-75
  - **Avançado**: base_value > 10.000 E kosmos_asset_score > 75
- [ ] Coluna `maturity_tier` calculada automaticamente (pode ser generated column ou trigger)
- [ ] Resultados existentes são classificados via migration

### US-1.3 — Classificação automática por faixa de ticket

**Como** sistema,
**Quero** classificar cada audit_result por faixa de ticket médio,
**Para que** benchmarks financeiros comparem negócios com tickets similares.

**Critérios de aceite:**
- [ ] Faixas de ticket definidas:
  - **Low ticket**: ticket_value < 200
  - **Mid ticket**: ticket_value 200-1.000
  - **High ticket**: ticket_value 1.000-5.000
  - **Premium**: ticket_value > 5.000
- [ ] Coluna `ticket_tier` calculada automaticamente
- [ ] Resultados existentes são classificados via migration

---

## Epic 2: Motor de Cálculo Automático de Benchmarks

> Calcular automaticamente médias de mercado, percentis e thresholds a partir do dataset de audit_results.

### US-2.1 — Cálculo automático de médias de mercado por pilar

**Como** Admin KOSMOS,
**Quero** que o sistema calcule automaticamente as médias de mercado (score_causa, score_cultura, score_economia, kosmos_asset_score) a partir de todos os audit_results,
**Para que** eu não precise preencher manualmente esses valores ao criar um benchmark.

**Critérios de aceite:**
- [ ] Função/view no banco que calcula: média, mediana, desvio padrão para cada pilar
- [ ] Cálculos disponíveis de forma global e segmentada (por segment, maturity_tier, ticket_tier)
- [ ] Resultados cacheados (materialized view ou tabela de cache) com refresh periódico
- [ ] Outliers (scores = 0 ou dados incompletos) são excluídos do cálculo
- [ ] Mínimo de 30 registros em um segmento para gerar benchmark segmentado (senão usa global)

### US-2.2 — Cálculo automático de percentis

**Como** sistema,
**Quero** calcular automaticamente em qual percentil cada resultado se encontra (por pilar e score total),
**Para que** o cliente saiba exatamente onde está posicionado em relação ao mercado.

**Critérios de aceite:**
- [ ] Percentis calculados: P10, P25, P50 (mediana), P75, P90 para cada pilar e score total
- [ ] Percentil individual de cada audit_result calculado (ex: "Você está no percentil 73")
- [ ] Cálculos disponíveis globais e por segmento
- [ ] Função `calculate_percentile(score, pilar, segment?)` disponível no banco

### US-2.3 — Cálculo automático de thresholds do Top 10%

**Como** sistema,
**Quero** identificar automaticamente os thresholds de score para estar no Top 10% em cada pilar,
**Para que** o cliente tenha uma meta clara de onde precisa chegar.

**Critérios de aceite:**
- [ ] Threshold = valor do percentil 90 de cada pilar
- [ ] Calculado globalmente e por segmento
- [ ] Atualizado junto com o refresh de médias (US-2.1)
- [ ] Disponível via API/query para uso nos dashboards

### US-2.4 — Agendamento de recálculo dos benchmarks

**Como** Admin KOSMOS,
**Quero** que os benchmarks de mercado sejam recalculados automaticamente em um intervalo configurável,
**Para que** os dados estejam sempre atualizados conforme novos diagnósticos são feitos.

**Critérios de aceite:**
- [ ] Recálculo automático via cron/scheduled function (sugestão: diário à meia-noite)
- [ ] Possibilidade de trigger manual pelo admin ("Recalcular agora")
- [ ] Log de cada recálculo (timestamp, qtd de registros processados, duração)
- [ ] Notificação no admin se o recálculo falhar

---

## Epic 3: Geração Automática de Benchmarks para Clientes

> Quando um cliente faz o diagnóstico ou é associado à plataforma, gerar automaticamente seu benchmark comparativo.

### US-3.1 — Benchmark automático no resultado do diagnóstico (Lead)

**Como** Lead que acabou de completar o diagnóstico,
**Quero** ver automaticamente como meu score se compara com o mercado,
**Para que** eu entenda se estou acima ou abaixo da média e onde posso melhorar.

**Critérios de aceite:**
- [ ] Na tela de resultado (ResultScreen), exibir seção "Como você se compara"
- [ ] Mostrar para cada pilar: "Seu score" vs "Média do mercado" (barra comparativa)
- [ ] Mostrar percentil geral: "Você está à frente de X% das comunidades analisadas"
- [ ] Se segmento foi informado, comparar com o segmento; senão, usar global
- [ ] Dados de benchmark carregados via query (não calculados no frontend)
- [ ] Se dataset insuficiente (< 30 resultados no segmento), mostrar benchmark global com nota explicativa

### US-3.2 — Benchmark automático no PDF do diagnóstico

**Como** Lead que baixou o PDF do diagnóstico,
**Quero** que o relatório inclua a seção de benchmarking,
**Para que** eu tenha o comparativo completo no material que vou compartilhar/consultar.

**Critérios de aceite:**
- [ ] Nova seção no PDF: "Benchmarking de Mercado"
- [ ] Gráfico de barras: 3 pilares (Seu Score vs Média vs Top 10%)
- [ ] Texto: "Você está no percentil X — à frente de Y% das comunidades"
- [ ] Contexto do segmento quando disponível: "Comparado com comunidades de [segmento]"
- [ ] Layout consistente com o restante do PDF

### US-3.3 — Geração automática de benchmark para clientes pagantes

**Como** Cliente KOSMOS (pagante),
**Quero** que meu benchmark seja gerado automaticamente ao me cadastrar na plataforma,
**Para que** eu tenha acesso imediato ao meu comparativo sem esperar uma análise manual do admin.

**Critérios de aceite:**
- [ ] Quando um contact_org é criado com score (vindo do audit_results), gerar benchmark automaticamente
- [ ] Benchmark gerado com status "published" (visível imediatamente)
- [ ] Campos auto-preenchidos: scores do cliente, médias de mercado, percentis, top 10%
- [ ] Campos financeiros auto-preenchidos: ticket_medio, lucro_oculto (do audit_result)
- [ ] LTV estimado calculado: ticket_value × ofertas_multiplier × 12 (recorrência anual)
- [ ] Insights gerados automaticamente (ver Epic 4)

### US-3.4 — Re-benchmark automático após novo diagnóstico

**Como** Cliente que refez o diagnóstico KOSMOS Score,
**Quero** que meu benchmark seja atualizado automaticamente com os novos scores,
**Para que** eu veja minha evolução em relação ao mercado.

**Critérios de aceite:**
- [ ] Detectar quando um email já tem audit_result anterior
- [ ] Gerar novo benchmark (não sobrescrever o anterior)
- [ ] Marcar benchmark anterior como "archived"
- [ ] Na view do cliente, mostrar histórico de benchmarks com evolução
- [ ] Comparação "antes vs agora" nos scores e percentis

---

## Epic 4: Geração Automática de Insights

> Gerar análises qualitativas automaticamente baseadas nos dados, sem intervenção manual do admin.

### US-4.1 — Identificação automática de pontos fortes

**Como** sistema,
**Quero** identificar automaticamente os pontos fortes de cada cliente comparado ao mercado,
**Para que** os insights de benchmarking não dependam de input manual.

**Critérios de aceite:**
- [ ] Regras de identificação:
  - Pilar com score acima do percentil 75 do mercado → ponto forte
  - Pilar com score acima do Top 10% → ponto forte excepcional
  - Score total acima da média do segmento → destaque geral
- [ ] Textos gerados automaticamente baseados em templates:
  - Ex: "Seu pilar Causa (78.5) está acima de 82% do mercado — sua comunidade tem uma identidade forte"
  - Ex: "Você está no Top 10% em Economia — sua monetização é referência no segmento"
- [ ] Mínimo 1, máximo 3 pontos fortes identificados

### US-4.2 — Identificação automática de oportunidades

**Como** sistema,
**Quero** identificar automaticamente as maiores oportunidades de melhoria,
**Para que** o cliente receba direcionamento prático.

**Critérios de aceite:**
- [ ] Regras de identificação:
  - Pilar com score abaixo da média do mercado → oportunidade
  - Pilar com maior gap entre score atual e Top 10% → oportunidade principal
  - Lucro oculto significativo (> R$50k/ano) → oportunidade financeira
- [ ] Textos gerados com templates contextuais:
  - Ex: "Seu pilar Cultura (32.0) está abaixo da média de mercado (48.5) — investir em rituais e autonomia da comunidade pode gerar ganhos significativos"
  - Ex: "Existe um lucro oculto estimado de R$125.000/ano — focar em Economia pode destravar essa receita"
- [ ] Mínimo 1, máximo 3 oportunidades identificadas

### US-4.3 — Identificação automática de riscos

**Como** sistema,
**Quero** identificar automaticamente riscos baseados no perfil do cliente,
**Para que** o benchmark tenha valor consultivo.

**Critérios de aceite:**
- [ ] Regras de identificação:
  - Classificação "Inquilino" → risco de dependência de plataforma
  - Score Cultura < 30 → risco de churn alto
  - Score Economia < 30 → risco de sustentabilidade financeira
  - is_beginner = true E ticket_value alto → risco de expectativa vs realidade
  - Nenhum pilar acima de 50 → risco de estagnação
- [ ] Textos gerados com templates contextuais e tom construtivo (não alarmista)
- [ ] Máximo 2 riscos identificados

### US-4.4 — Geração automática de plano de ação priorizado

**Como** sistema,
**Quero** gerar automaticamente um plano de ação com 3-5 ações priorizadas,
**Para que** o cliente tenha next steps claros.

**Critérios de aceite:**
- [ ] Ações geradas baseadas no gap analysis (pilar com maior distância para a média/top10)
- [ ] Cada ação tem: descrição, impacto esperado (alto/médio/baixo), prioridade (1-5)
- [ ] Template de ações por pilar:
  - **Causa**: "Definir manifesto da comunidade", "Criar ritual de identidade", "Documentar 'por que' dos membros"
  - **Cultura**: "Implementar 3 rituais recorrentes", "Criar programa de líderes internos", "Mapear jornada do membro"
  - **Economia**: "Criar oferta de ascensão", "Implementar modelo recorrente", "Lançar programa de afiliados"
- [ ] Ações ordenadas por impacto × facilidade de implementação

### US-4.5 — Geração de análise qualitativa resumida

**Como** sistema,
**Quero** gerar automaticamente um parágrafo de análise qualitativa que sintetize o benchmark,
**Para que** o cliente tenha uma visão narrative do seu posicionamento.

**Critérios de aceite:**
- [ ] Texto de 3-5 frases gerado via templates compostos:
  - Abertura: classificação + posição no mercado
  - Destaque: pilar mais forte
  - Oportunidade: pilar com maior gap
  - Fechamento: projeção de impacto se melhorar
- [ ] Exemplo: "Sua comunidade está classificada como Gerente, posicionada no percentil 45 do mercado. Seu pilar Causa é o mais forte (65.0), demonstrando boa identidade de marca. O maior potencial de crescimento está em Economia (28.0), onde comunidades similares alcançam em média 52.3. Fechar esse gap pode destravar até R$85.000/ano em lucro oculto."
- [ ] Tom profissional, construtivo e orientado a ação

---

## Epic 5: Dashboard de Benchmarking do Cliente

> Visualizações comparativas para o cliente entender seu posicionamento.

### US-5.1 — Radar chart comparativo (Cliente vs Mercado vs Top 10%)

**Como** Cliente,
**Quero** ver um gráfico radar comparando meus 3 pilares com a média do mercado e o Top 10%,
**Para que** eu visualize rapidamente onde estou forte e onde posso melhorar.

**Critérios de aceite:**
- [ ] Radar chart com 3 eixos (Causa, Cultura, Economia)
- [ ] 3 linhas sobrepostas: "Você" (laranja), "Média do Mercado" (cinza), "Top 10%" (verde tracejado)
- [ ] Legenda clara
- [ ] Tooltip ao hover com valores exatos
- [ ] Componente reutiliza o `PillarComparisonChart` existente

### US-5.2 — Barras de percentil por pilar

**Como** Cliente,
**Quero** ver barras de percentil mostrando minha posição em cada pilar,
**Para que** eu saiba exatamente onde estou no ranking.

**Critérios de aceite:**
- [ ] Barra horizontal para cada pilar (0-100%)
- [ ] Marcador na posição do percentil do cliente
- [ ] Marcadores de referência: P25, P50 (mediana), P75
- [ ] Reutilizar componente `PercentileBar` existente
- [ ] Cores por pilar consistentes com design system (Causa: laranja, Cultura: roxo, Economia: azul)

### US-5.3 — Card de score comparativo

**Como** Cliente,
**Quero** ver cards comparando meu score em cada pilar vs a média do mercado,
**Para que** eu tenha a informação de forma direta e clara.

**Critérios de aceite:**
- [ ] 3 cards (um por pilar) com:
  - Nome do pilar + ícone
  - "Seu score: X.X"
  - "Média do mercado: Y.Y"
  - Indicador visual: seta para cima (verde) se acima da média, seta para baixo (vermelho) se abaixo
  - Diferença: "+12.3 acima da média" ou "-8.5 abaixo da média"
- [ ] Card de score total com percentil geral

### US-5.4 — Seção de insights e plano de ação

**Como** Cliente,
**Quero** ver os insights gerados automaticamente (pontos fortes, oportunidades, riscos, plano de ação),
**Para que** eu tenha clareza sobre meu posicionamento e próximos passos.

**Critérios de aceite:**
- [ ] Seção organizada em acordeões ou tabs:
  - Pontos Fortes (ícone verde)
  - Oportunidades (ícone amarelo)
  - Riscos (ícone vermelho)
  - Plano de Ação (ícone azul, checklist)
- [ ] Análise qualitativa em destaque no topo
- [ ] Plano de ação com checkboxes visuais (não interativos nesta versão)
- [ ] Reutilizar componente `InsightsSection` existente

### US-5.5 — Histórico de evolução dos benchmarks

**Como** Cliente que já fez mais de um diagnóstico,
**Quero** ver como meu posicionamento no mercado evoluiu ao longo do tempo,
**Para que** eu acompanhe meu progresso.

**Critérios de aceite:**
- [ ] Timeline/lista de benchmarks ordenados por data
- [ ] Para cada benchmark: score total, percentil, classificação
- [ ] Gráfico de linha mostrando evolução do score total e percentil
- [ ] Indicadores de "melhorou" / "piorou" / "manteve" entre benchmarks consecutivos
- [ ] Comparação detalhada entre dois benchmarks selecionados (side-by-side)

---

## Epic 6: Benchmarking na Tela de Resultado (Lead)

> Adicionar comparativos de mercado diretamente na experiência do lead magnet.

### US-6.1 — Seção "Como você se compara" no resultado

**Como** Lead que acabou o diagnóstico,
**Quero** ver uma seção comparativa no meu resultado mostrando onde me posiciono em relação a outros líderes de comunidade,
**Para que** eu tenha mais contexto sobre meu score e perceba valor no diagnóstico.

**Critérios de aceite:**
- [ ] Nova seção na `ResultScreen` abaixo do score principal
- [ ] Título: "Como você se compara"
- [ ] Barra visual: "Você está à frente de X% das comunidades analisadas"
- [ ] Mini comparativo: 3 barras horizontais (1 por pilar) com marcador "você" e "média"
- [ ] Número total de comunidades na base: "Baseado em X comunidades analisadas"
- [ ] Se segmento informado: "Comparado com comunidades de [segmento]"
- [ ] Design leve e não-intrusivo (não pode ofuscar o resultado principal)

### US-6.2 — Teaser de benchmarking premium no resultado

**Como** Lead que viu o comparativo básico,
**Quero** ver um preview do que o benchmarking premium oferece,
**Para que** eu entenda o valor de me tornar cliente KOSMOS.

**Critérios de aceite:**
- [ ] Card de CTA abaixo da seção comparativa
- [ ] Preview borrado (blur) de: radar chart completo, insights detalhados, plano de ação
- [ ] Copy: "Desbloqueie seu Benchmarking Completo" com benefícios listados
- [ ] CTA: botão que leva para página de conversão / WhatsApp
- [ ] Não bloquear ou degradar a experiência do resultado gratuito

---

## Epic 7: Painel Admin de Benchmarking

> Ferramentas para o admin KOSMOS gerenciar, monitorar e ajustar o sistema de benchmarking automático.

### US-7.1 — Dashboard de saúde do dataset de benchmarking

**Como** Admin KOSMOS,
**Quero** ver métricas sobre a qualidade e volume do dataset usado para benchmarks,
**Para que** eu saiba se os benchmarks são estatisticamente confiáveis.

**Critérios de aceite:**
- [ ] Cards de KPI:
  - Total de registros no dataset
  - Registros por segmento (com alerta se < 30)
  - Registros por faixa de maturidade
  - Registros por faixa de ticket
  - Data do último recálculo
- [ ] Alerta visual se algum segmento tem < 30 registros (benchmark não confiável)
- [ ] Distribuição de scores em histograma
- [ ] Botão "Recalcular agora" com confirmação

### US-7.2 — Visualização das médias e percentis calculados

**Como** Admin KOSMOS,
**Quero** ver todas as médias de mercado e percentis calculados automaticamente,
**Para que** eu possa validar se os números fazem sentido antes de serem expostos aos clientes.

**Critérios de aceite:**
- [ ] Tabela: Segmento × Pilar × (Média, Mediana, P25, P50, P75, P90, Desvio Padrão)
- [ ] Filtros por segmento, maturidade, ticket
- [ ] Comparação global vs segmentado
- [ ] Destaque de valores anômalos (ex: média muito diferente da mediana → distribuição enviesada)
- [ ] Exportar dados em CSV

### US-7.3 — Override manual de benchmarks automáticos

**Como** Admin KOSMOS,
**Quero** poder ajustar manualmente qualquer valor de benchmark gerado automaticamente,
**Para que** eu possa corrigir distorções ou adicionar análise consultiva personalizada.

**Critérios de aceite:**
- [ ] No formulário de benchmark (AdminBenchmarkFormPage), mostrar valores auto-calculados como default
- [ ] Permitir override de qualquer campo (médias, percentis, top 10%, insights)
- [ ] Indicador visual de "valor automático" vs "valor manual"
- [ ] Log de quem fez o override e quando
- [ ] Opção de "restaurar valor automático" para cada campo

### US-7.4 — Configuração de segmentos de benchmarking

**Como** Admin KOSMOS,
**Quero** gerenciar os segmentos disponíveis para benchmarking (adicionar, editar, desativar),
**Para que** a segmentação evolua conforme a base cresce.

**Critérios de aceite:**
- [ ] CRUD de segmentos (nome, descrição, ativo/inativo)
- [ ] Regras de merge: vincular segmentos com poucos dados a segmentos maiores
- [ ] Preview: quantos registros cairiam em cada segmento
- [ ] Não permitir deletar segmento que tem benchmarks publicados (apenas desativar)

---

## Epic 8: Benchmarking Financeiro Automático

> Calcular métricas financeiras comparativas automaticamente.

### US-8.1 — Cálculo automático de ticket médio benchmark por segmento

**Como** sistema,
**Quero** calcular automaticamente o ticket médio de referência por segmento/maturidade,
**Para que** o cliente saiba se seu ticket está adequado ao mercado.

**Critérios de aceite:**
- [ ] Cálculo: média e mediana de `ticket_value` por segmento
- [ ] Faixas de referência: "Seu ticket está X% acima/abaixo da média do segmento"
- [ ] Correlação ticket vs score_economia (insight: "Comunidades com ticket similar têm score Economia médio de X")

### US-8.2 — Cálculo automático de LTV estimado e benchmark

**Como** sistema,
**Quero** calcular automaticamente o LTV estimado do cliente e compará-lo com o benchmark do segmento,
**Para que** o cliente entenda seu potencial de lifetime value.

**Critérios de aceite:**
- [ ] LTV estimado = ticket_value × ofertas_multiplier × comunicacao_multiplier × 12 × (score_economia / 100)
- [ ] LTV benchmark = média do LTV estimado no segmento
- [ ] Exibir: "Seu LTV estimado: R$X | Benchmark do segmento: R$Y"
- [ ] Gap analysis: "Potencial de aumento de LTV: R$Z (se atingir a média do segmento em Economia)"

### US-8.3 — Projeção de crescimento baseada em benchmark

**Como** sistema,
**Quero** calcular automaticamente uma projeção de crescimento caso o cliente atinja a média do mercado nos pilares abaixo da média,
**Para que** o benchmark tenha impacto financeiro tangível.

**Critérios de aceite:**
- [ ] Para cada pilar abaixo da média: calcular impacto no lucro_oculto se atingisse a média
- [ ] Projeção total = soma dos impactos de todos os pilares
- [ ] Projeção conservadora (atingir média) e otimista (atingir P75)
- [ ] Exibir como: "Se melhorar Cultura para a média do mercado: +R$X/ano estimado"

---

## Epic 9: Notificações e Engajamento

> Manter clientes engajados com seu benchmarking.

### US-9.1 — Notificação de benchmark disponível

**Como** Cliente,
**Quero** ser notificado quando meu benchmark for gerado ou atualizado,
**Para que** eu acesse os resultados rapidamente.

**Critérios de aceite:**
- [ ] Email enviado ao cliente quando benchmark é publicado (automático ou manual)
- [ ] Email contém: score total, percentil, classificação, link para dashboard
- [ ] Template de email com branding KOSMOS
- [ ] Opção de opt-out de notificações

### US-9.2 — Notificação de mudança significativa no mercado

**Como** Cliente com benchmark publicado,
**Quero** ser notificado se minha posição relativa no mercado mudar significativamente (> 5 percentis),
**Para que** eu esteja ciente de mudanças no cenário competitivo.

**Critérios de aceite:**
- [ ] Após cada recálculo, comparar percentis atuais com anteriores
- [ ] Se variação > 5 pontos percentuais em qualquer pilar: gerar notificação
- [ ] Notificação explica: "Seu percentil em Cultura mudou de 65 para 58 — novas comunidades estão investindo mais em rituais"
- [ ] Frequência máxima: 1 notificação por mês
- [ ] Disponível como notificação in-app e email (configurável)

---

## Epic 10: Exportação e Compartilhamento

> Permitir que clientes exportem e compartilhem seus benchmarks.

### US-10.1 — Exportar benchmark completo em PDF

**Como** Cliente,
**Quero** exportar meu benchmark completo como PDF,
**Para que** eu possa compartilhar com minha equipe ou usar em apresentações.

**Critérios de aceite:**
- [ ] PDF contém: score comparativo, radar chart, percentis, métricas financeiras, insights, plano de ação
- [ ] Layout profissional com branding KOSMOS
- [ ] Dados do cliente e data do benchmark no cabeçalho
- [ ] Nota de rodapé: "Baseado em X comunidades analisadas em [data]"
- [ ] Reutilizar infraestrutura do `pdfGenerator.ts` existente

### US-10.2 — Compartilhar resultado comparativo em redes sociais

**Como** Lead que fez o diagnóstico e viu o comparativo,
**Quero** compartilhar minha posição no ranking em redes sociais,
**Para que** eu divulgue meu resultado e gere tráfego orgânico para o KOSMOS Score.

**Critérios de aceite:**
- [ ] Botão "Compartilhar" gera imagem/card com:
  - Score total + classificação
  - "Top X% das comunidades" (percentil)
  - Branding KOSMOS Score
- [ ] Formatos: imagem para download, link com OG tags para preview
- [ ] Copy sugerida para compartilhamento
- [ ] Link de compartilhamento rastreável (UTM params)

---

## Priorização Sugerida

### Fase 1 — MVP (Foundation)
| # | User Story | Valor |
|---|-----------|-------|
| 1 | US-2.1 | Motor de cálculo de médias (base de tudo) |
| 2 | US-2.2 | Cálculo de percentis |
| 3 | US-2.3 | Thresholds Top 10% |
| 4 | US-3.1 | Benchmark na tela de resultado do lead |
| 5 | US-6.1 | Seção "Como você se compara" |
| 6 | US-4.5 | Análise qualitativa automática |

> **Entrega:** Lead faz diagnóstico → vê comparativo com mercado automaticamente.

### Fase 2 — Automação Completa
| # | User Story | Valor |
|---|-----------|-------|
| 7 | US-1.1 | Coleta de segmento |
| 8 | US-1.2 | Classificação por maturidade |
| 9 | US-1.3 | Classificação por ticket |
| 10 | US-4.1 | Insights: pontos fortes |
| 11 | US-4.2 | Insights: oportunidades |
| 12 | US-4.3 | Insights: riscos |
| 13 | US-4.4 | Plano de ação automático |
| 14 | US-3.3 | Benchmark auto para clientes pagantes |
| 15 | US-2.4 | Agendamento de recálculo |

> **Entrega:** Benchmarks segmentados + insights automáticos + auto-geração para clientes.

### Fase 3 — Premium & Engajamento
| # | User Story | Valor |
|---|-----------|-------|
| 16 | US-5.1 a US-5.4 | Dashboard completo do cliente |
| 17 | US-8.1 a US-8.3 | Benchmarking financeiro |
| 18 | US-3.2 | Benchmark no PDF |
| 19 | US-6.2 | Teaser premium |
| 20 | US-7.1 a US-7.4 | Painel admin |

> **Entrega:** Dashboard premium + financeiro + admin tools.

### Fase 4 — Evolução & Growth
| # | User Story | Valor |
|---|-----------|-------|
| 21 | US-3.4 | Re-benchmark automático |
| 22 | US-5.5 | Histórico de evolução |
| 23 | US-9.1 a US-9.2 | Notificações |
| 24 | US-10.1 a US-10.2 | Exportação e compartilhamento |
| 25 | US-7.3 | Override manual |

> **Entrega:** Ciclo contínuo de re-benchmark + engajamento + growth loops.

---

## Dependências Técnicas

| Dependência | Impacto | Epics |
|-------------|---------|-------|
| Materialized views no Supabase | Cálculos performáticos | Epic 2 |
| Edge Functions ou pg_cron | Agendamento de recálculo | US-2.4 |
| Nova coluna `segment` em `audit_results` | Segmentação | Epic 1 |
| Novas colunas `maturity_tier`, `ticket_tier` | Classificação automática | US-1.2, US-1.3 |
| Templates de texto para insights | Geração de insights | Epic 4 |
| Supabase Realtime ou polling | Notificações | Epic 9 |
| OG image generation (Satori/similar) | Share cards | US-10.2 |

---

## Métricas de Sucesso

| Métrica | Baseline | Meta |
|---------|----------|------|
| Tempo para gerar benchmark de cliente | ~30 min (manual) | < 1 seg (automático) |
| % de leads que veem comparativo | 0% | 100% |
| Engajamento na tela de resultado (scroll depth) | A medir | +30% |
| Conversão lead → cliente (atribuída ao benchmark) | A medir | +15% |
| NPS do serviço de benchmarking | A medir | > 50 |
| Compartilhamentos sociais do resultado | ~0 | > 5% dos leads |

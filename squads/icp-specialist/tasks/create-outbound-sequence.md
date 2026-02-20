# Create Outbound Sequence

## Purpose
Criar uma cadência de outbound (DM, email, WhatsApp) personalizada para um lead específico, usando a linguagem exata do ICP KOSMOS.

## Prerequisites
- Informações sobre o lead (perfil, nicho, base)
- Canal de abordagem definido
- Acesso ao documento de ICP

## Interactive Elicitation Process

### Step 1: Briefing do Lead
```
ELICIT: Informações do Lead

1. Nome/@ do lead:
   [texto]

2. Nicho:
   □ Educação/Ensino
   □ Marketing Digital
   □ Saúde/Fitness
   □ Desenvolvimento Pessoal
   □ Negócios/Empreendedorismo
   □ Finanças
   □ Tech/Programação
   □ Outro: [especificar]

3. Tamanho estimado da base:
   □ 1.000-5.000
   □ 5.000-10.000
   □ 10.000-50.000
   □ 50.000+

4. Modelo atual (se souber):
   □ Cursos low ticket
   □ Lançamentos
   □ Mentoria 1:1
   □ Comunidade existente
   □ Não sei
```

### Step 2: Definir Canal e Estratégia
```
ELICIT: Configuração da Cadência

1. Canal de abordagem:
   □ DM Instagram
   □ Email
   □ WhatsApp
   □ LinkedIn

2. Sinais observados (marque todos que aplicam):
   □ Pós-lançamento recente
   □ Stories reflexivos
   □ Reclamando de algo
   □ Perguntando sobre novos modelos
   □ Nenhum sinal específico

3. Perfil provável:
   □ Professor Preso
   □ Lançador Cansado
   □ Community Builder Frustrado
   □ Expert Técnico
   □ Creator-Empresário Travado
   □ Não sei / preciso de sugestão
```

## Implementation Steps

1. **Carregar conhecimento**
   - Ler `data/icp-creator-kosmos.md`
   - Ler `data/perfis-icp.yaml`

2. **Identificar perfil** (se não informado)
   - Analisar sinais do nicho
   - Inferir perfil mais provável
   - Definir tom e abordagem

3. **Selecionar template base**
   - Buscar template do perfil em `templates/outbound-dm-template.md`
   - Adaptar para canal específico

4. **Personalizar mensagens**
   - Inserir nome e referências específicas
   - Adaptar exemplos para o nicho
   - Ajustar tom conforme perfil

5. **Definir cadência**
   - Dia 0: Primeira abordagem
   - Dia 3: Follow-up valor
   - Dia 7: Social proof
   - Dia 14: Reengajamento
   - Dia 21: Break-up

6. **Mapear objeções prováveis**
   - Listar 2-3 objeções do perfil
   - Preparar respostas curtas

## Validation Checklist
- [ ] Nome do lead usado corretamente
- [ ] Referência específica ao trabalho dele
- [ ] Linguagem do ICP utilizada
- [ ] Linguagem que repele evitada
- [ ] Tom adequado ao perfil
- [ ] Todas as 5 mensagens criadas
- [ ] Objeções mapeadas

## Error Handling
- Se perfil incerto: criar versão genérica + variações
- Se canal não especificado: assumir DM Instagram
- Se pouca informação: criar cadência de discovery primeiro

## Success Output
```
✅ Cadência de outbound criada!

👤 Lead: [nome]
📱 Canal: [canal]
🎯 Perfil: [tipo]
📅 Duração: 21 dias

📝 Mensagens:
- Dia 0: ✓ Primeira abordagem
- Dia 3: ✓ Follow-up valor
- Dia 7: ✓ Social proof
- Dia 14: ✓ Reengajamento
- Dia 21: ✓ Break-up

⚠️ Objeções preparadas: [N]

💡 Dica: Aborde entre Terça-Quinta, 9h-11h ou 14h-16h
```

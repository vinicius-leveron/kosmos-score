-- ============================================================================
-- KOSMOS Platform - Update: Formulário de Aplicação KOSMOS
-- ============================================================================
-- Atualiza o formulário de aplicação:
-- - Combina nome, email, whatsapp na mesma tela
-- - Adiciona Instagram
-- - Remove nicho e cargo
-- - Muda para faturamento anual e mensal
-- - Atualiza texto da welcome screen
-- ============================================================================

DO $$
DECLARE
  v_form_id UUID;
  v_block1_id UUID;
  v_block2_id UUID;
  v_block3_id UUID;
  v_block4_id UUID;
BEGIN
  -- Buscar o form existente
  SELECT id INTO v_form_id FROM public.forms WHERE slug = 'aplicacao-kosmos';

  IF v_form_id IS NULL THEN
    RAISE EXCEPTION 'Formulário aplicacao-kosmos não encontrado';
  END IF;

  -- ============================================================================
  -- 1. ATUALIZAR WELCOME SCREEN E SETTINGS
  -- ============================================================================
  UPDATE public.forms
  SET
    welcome_screen = '{
      "enabled": true,
      "title": "Aplicação KOSMOS",
      "description": "Queremos entender melhor o seu negócio para validar se faz sentido trabalharmos juntos.",
      "buttonText": "Começar",
      "collectEmail": false,
      "emailRequired": false
    }'::jsonb,
    updated_at = now()
  WHERE id = v_form_id;

  -- ============================================================================
  -- 2. DELETAR CAMPOS E BLOCOS ANTIGOS
  -- ============================================================================
  DELETE FROM public.form_fields WHERE form_id = v_form_id;
  DELETE FROM public.form_blocks WHERE form_id = v_form_id;

  -- ============================================================================
  -- 3. CRIAR NOVOS BLOCOS
  -- ============================================================================

  -- Bloco 1: Dados de Contato (nome, email, whatsapp juntos)
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Dados de Contato', NULL, false, 0)
  RETURNING id INTO v_block1_id;

  -- Bloco 2: Redes Sociais (Instagram)
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Redes Sociais', NULL, false, 1)
  RETURNING id INTO v_block2_id;

  -- Bloco 3: Faturamento
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Faturamento', NULL, false, 2)
  RETURNING id INTO v_block3_id;

  -- Bloco 4: Contexto (opcional)
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Contexto', NULL, false, 3)
  RETURNING id INTO v_block4_id;

  -- ============================================================================
  -- 4. CRIAR NOVOS CAMPOS
  -- ============================================================================

  -- -------------------------
  -- BLOCO 1: DADOS DE CONTATO (mesma tela)
  -- Usando position sequencial para aparecerem juntos
  -- -------------------------

  -- Campo 1: Nome completo
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block1_id, 'text', 'nome',
    'Nome completo',
    'Seu nome',
    NULL,
    true,
    '{"minLength": 3, "maxLength": 100}'::jsonb,
    '[]'::jsonb,
    0
  );

  -- Campo 2: Email
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block1_id, 'email', 'email',
    'Email',
    'seu@email.com',
    NULL,
    true,
    '{}'::jsonb,
    '[]'::jsonb,
    1
  );

  -- Campo 3: WhatsApp
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block1_id, 'phone', 'whatsapp',
    'WhatsApp',
    '(11) 99999-9999',
    NULL,
    true,
    '{}'::jsonb,
    '[]'::jsonb,
    2
  );

  -- -------------------------
  -- BLOCO 2: REDES SOCIAIS
  -- -------------------------

  -- Campo 4: Instagram
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block2_id, 'text', 'instagram',
    'Qual é o seu Instagram?',
    '@seuusuario',
    NULL,
    true,
    '{"minLength": 2, "maxLength": 50}'::jsonb,
    '[]'::jsonb,
    3
  );

  -- -------------------------
  -- BLOCO 3: FATURAMENTO
  -- -------------------------

  -- Campo 5: Faturamento Anual
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block3_id, 'radio', 'faturamento_anual',
    'Qual é a faixa de faturamento anual do seu negócio?',
    NULL,
    NULL,
    true,
    '{}'::jsonb,
    '[
      {"label": "Até R$120.000", "value": "ate_120k"},
      {"label": "R$120.000 a R$600.000", "value": "120k_600k"},
      {"label": "R$600.000 a R$1.200.000", "value": "600k_1m2"},
      {"label": "R$1.200.000 a R$6.000.000", "value": "1m2_6m"},
      {"label": "Mais de R$6.000.000", "value": "mais_6m"}
    ]'::jsonb,
    4
  );

  -- Campo 6: Faturamento Mensal
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block3_id, 'radio', 'faturamento_mensal',
    'E qual é a faixa de faturamento mensal?',
    NULL,
    NULL,
    true,
    '{}'::jsonb,
    '[
      {"label": "Até R$10.000", "value": "ate_10k"},
      {"label": "R$10.000 a R$50.000", "value": "10k_50k"},
      {"label": "R$50.000 a R$100.000", "value": "50k_100k"},
      {"label": "R$100.000 a R$500.000", "value": "100k_500k"},
      {"label": "Mais de R$500.000", "value": "mais_500k"}
    ]'::jsonb,
    5
  );

  -- -------------------------
  -- BLOCO 4: CONTEXTO (opcional)
  -- -------------------------

  -- Campo 7: Principal desafio
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block4_id, 'long_text', 'desafio',
    'Qual é o seu principal desafio atual?',
    'Conte um pouco sobre o que você está enfrentando...',
    'Opcional',
    false,
    '{"maxLength": 1000}'::jsonb,
    '[]'::jsonb,
    6
  );

  RAISE NOTICE 'Formulário de Aplicação KOSMOS atualizado com sucesso!';

END $$;

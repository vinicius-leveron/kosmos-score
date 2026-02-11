-- ============================================================================
-- KOSMOS Platform - Seed: Formulário de Aplicação KOSMOS
-- ============================================================================
-- Cria o formulário de aplicação para clientes KOSMOS (lead magnet)
-- URL: /f/aplicacao-kosmos
-- Estilo: Typeform (pergunta por vez), dark mode KOSMOS
-- ============================================================================

-- Organization ID KOSMOS
DO $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_form_id UUID;
  v_block1_id UUID;
  v_block2_id UUID;
  v_block3_id UUID;
  v_block4_id UUID;
BEGIN
  -- ============================================================================
  -- CRIAR O FORMULÁRIO
  -- ============================================================================
  INSERT INTO public.forms (
    id,
    organization_id,
    name,
    slug,
    description,
    status,
    settings,
    theme,
    scoring_enabled,
    welcome_screen,
    thank_you_screen,
    crm_config,
    published_at
  ) VALUES (
    gen_random_uuid(),
    v_kosmos_org_id,
    'Aplicação KOSMOS',
    'aplicacao-kosmos',
    'Formulário de aplicação para validar fit com clientes KOSMOS',
    'published',
    -- settings (typeform-style)
    '{
      "showProgressBar": true,
      "allowBack": true,
      "saveProgress": true,
      "progressExpireDays": 7,
      "showQuestionNumbers": false,
      "submitButtonText": "Enviar Aplicação",
      "requiredFieldIndicator": "*"
    }'::jsonb,
    -- theme (dark mode KOSMOS)
    '{
      "primaryColor": "#F97316",
      "backgroundColor": "#0D0D0D",
      "textColor": "#FFFFFF",
      "logoUrl": null,
      "fontFamily": "Space Grotesk"
    }'::jsonb,
    false, -- scoring_enabled
    -- welcome_screen
    '{
      "enabled": true,
      "title": "Aplicação KOSMOS",
      "description": "Preencha para validarmos se temos fit para trabalhar juntos.\n\nLeva menos de 2 minutos.",
      "buttonText": "Começar",
      "collectEmail": false,
      "emailRequired": false
    }'::jsonb,
    -- thank_you_screen
    '{
      "enabled": true,
      "title": "Aplicação Recebida!",
      "description": "Obrigado por se inscrever.\n\nNossa equipe vai analisar sua aplicação e entrar em contato em breve.",
      "showScore": false,
      "showClassification": false,
      "ctaButton": null
    }'::jsonb,
    -- crm_config
    '{
      "createContact": true,
      "emailFieldKey": "email",
      "nameFieldKey": "nome",
      "phoneFieldKey": "whatsapp",
      "defaultJourneyStage": null
    }'::jsonb,
    now() -- published_at
  )
  RETURNING id INTO v_form_id;

  -- ============================================================================
  -- CRIAR BLOCOS
  -- ============================================================================

  -- Bloco 1: Dados Pessoais
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Dados Pessoais', NULL, false, 0)
  RETURNING id INTO v_block1_id;

  -- Bloco 2: Sobre a Empresa
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Sobre a Empresa', NULL, false, 1)
  RETURNING id INTO v_block2_id;

  -- Bloco 3: Qualificação
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Qualificação', NULL, false, 2)
  RETURNING id INTO v_block3_id;

  -- Bloco 4: Contexto
  INSERT INTO public.form_blocks (id, form_id, name, description, show_title, position)
  VALUES (gen_random_uuid(), v_form_id, 'Contexto', NULL, false, 3)
  RETURNING id INTO v_block4_id;

  -- ============================================================================
  -- CRIAR CAMPOS
  -- ============================================================================

  -- -------------------------
  -- BLOCO 1: DADOS PESSOAIS
  -- -------------------------

  -- Campo 1: Nome completo
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block1_id, 'text', 'nome',
    'Qual é o seu nome completo?',
    'Ex: João Silva',
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
    'Qual é o seu melhor email?',
    'seu@email.com',
    'Usaremos para entrar em contato.',
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
    'Qual é o seu WhatsApp?',
    '(11) 99999-9999',
    'Com DDD. Preferimos WhatsApp para agilidade.',
    true,
    '{}'::jsonb,
    '[]'::jsonb,
    2
  );

  -- -------------------------
  -- BLOCO 2: SOBRE A EMPRESA
  -- -------------------------

  -- Campo 4: Nome da empresa
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block2_id, 'text', 'empresa',
    'Qual é o nome da sua empresa ou projeto?',
    'Ex: Empresa XYZ',
    NULL,
    true,
    '{"minLength": 2, "maxLength": 100}'::jsonb,
    '[]'::jsonb,
    3
  );

  -- Campo 5: Cargo
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block2_id, 'text', 'cargo',
    'Qual é o seu cargo ou função?',
    'Ex: CEO, Fundador, Head de Marketing',
    NULL,
    true,
    '{"minLength": 2, "maxLength": 100}'::jsonb,
    '[]'::jsonb,
    4
  );

  -- Campo 6: Nicho
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block2_id, 'text', 'nicho',
    'Qual é o nicho ou mercado de atuação?',
    'Ex: Educação, Saúde, Finanças, Tecnologia',
    NULL,
    true,
    '{"minLength": 2, "maxLength": 100}'::jsonb,
    '[]'::jsonb,
    5
  );

  -- -------------------------
  -- BLOCO 3: QUALIFICAÇÃO
  -- -------------------------

  -- Campo 7: Faturamento
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block3_id, 'radio', 'faturamento',
    'Qual é a faixa de faturamento mensal do seu negócio?',
    NULL,
    'Considere a média dos últimos 3 meses.',
    true,
    '{}'::jsonb,
    '[
      {"label": "Até R$10.000", "value": "ate_10k"},
      {"label": "R$10.000 a R$50.000", "value": "10k_50k"},
      {"label": "R$50.000 a R$100.000", "value": "50k_100k"},
      {"label": "R$100.000 a R$500.000", "value": "100k_500k"},
      {"label": "Mais de R$500.000", "value": "mais_500k"}
    ]'::jsonb,
    6
  );

  -- Campo 8: Tamanho da comunidade
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block3_id, 'radio', 'tamanho_comunidade',
    'Qual é o tamanho da sua comunidade ou lista de contatos?',
    NULL,
    'Considere seguidores ativos, lista de email, membros de comunidade.',
    true,
    '{}'::jsonb,
    '[
      {"label": "Até 1.000 pessoas", "value": "ate_1k"},
      {"label": "1.000 a 5.000 pessoas", "value": "1k_5k"},
      {"label": "5.000 a 20.000 pessoas", "value": "5k_20k"},
      {"label": "20.000 a 100.000 pessoas", "value": "20k_100k"},
      {"label": "Mais de 100.000 pessoas", "value": "mais_100k"}
    ]'::jsonb,
    7
  );

  -- -------------------------
  -- BLOCO 4: CONTEXTO
  -- -------------------------

  -- Campo 9: Principal desafio (opcional)
  INSERT INTO public.form_fields (
    form_id, block_id, type, key, label, placeholder, help_text,
    required, validation, options, position
  ) VALUES (
    v_form_id, v_block4_id, 'long_text', 'desafio',
    'Qual é o seu principal desafio atual?',
    'Conte um pouco sobre o que você está enfrentando...',
    'Opcional, mas nos ajuda a entender melhor o seu contexto.',
    false,
    '{"maxLength": 1000}'::jsonb,
    '[]'::jsonb,
    8
  );

  -- Log de sucesso
  RAISE NOTICE 'Formulário de Aplicação KOSMOS criado com sucesso! ID: %', v_form_id;

END $$;

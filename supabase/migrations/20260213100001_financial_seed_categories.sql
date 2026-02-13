-- 20260213100001_financial_seed_categories.sql
-- Função para semear categorias financeiras padrão brasileiras para uma organização

CREATE OR REPLACE FUNCTION public.seed_financial_categories(p_organization_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id UUID;
BEGIN
  -- Skip if categories already exist for this org
  IF EXISTS (
    SELECT 1 FROM financial_categories WHERE organization_id = p_organization_id AND is_system = true LIMIT 1
  ) THEN
    RETURN;
  END IF;

  -- =========================================================================
  -- RECEITA BRUTA
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position)
  VALUES (p_organization_id, 'Receita de Serviços', 'revenue', 'receita_bruta', '#10B981', 'briefcase', true, 1)
  RETURNING id INTO v_parent_id;

  INSERT INTO financial_categories (organization_id, parent_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, v_parent_id, 'Consultoria', 'revenue', 'receita_bruta', '#10B981', 'users', true, 1),
    (p_organization_id, v_parent_id, 'Projetos', 'revenue', 'receita_bruta', '#10B981', 'folder', true, 2),
    (p_organization_id, v_parent_id, 'Treinamentos', 'revenue', 'receita_bruta', '#10B981', 'graduation-cap', true, 3);

  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position)
  VALUES (p_organization_id, 'Receita de Produtos', 'revenue', 'receita_bruta', '#059669', 'package', true, 2)
  RETURNING id INTO v_parent_id;

  INSERT INTO financial_categories (organization_id, parent_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, v_parent_id, 'Produtos Digitais', 'revenue', 'receita_bruta', '#059669', 'download', true, 1),
    (p_organization_id, v_parent_id, 'Licenças', 'revenue', 'receita_bruta', '#059669', 'key', true, 2);

  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position)
  VALUES (p_organization_id, 'Assinaturas e Recorrência', 'revenue', 'receita_bruta', '#047857', 'repeat', true, 3)
  RETURNING id INTO v_parent_id;

  INSERT INTO financial_categories (organization_id, parent_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, v_parent_id, 'Mensalidades', 'revenue', 'receita_bruta', '#047857', 'calendar', true, 1),
    (p_organization_id, v_parent_id, 'Anuidades', 'revenue', 'receita_bruta', '#047857', 'calendar', true, 2);

  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position)
  VALUES (p_organization_id, 'Outras Receitas Operacionais', 'revenue', 'receita_bruta', '#34D399', 'plus-circle', true, 4);

  -- =========================================================================
  -- DEDUÇÕES
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Impostos sobre Receita', 'expense', 'deducoes', '#F59E0B', 'receipt', true, 1),
    (p_organization_id, 'Devoluções', 'expense', 'deducoes', '#F59E0B', 'undo', true, 2),
    (p_organization_id, 'Descontos Concedidos', 'expense', 'deducoes', '#F59E0B', 'percent', true, 3);

  -- =========================================================================
  -- CUSTOS
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position)
  VALUES (p_organization_id, 'Custo dos Serviços Prestados', 'cost', 'custos', '#EF4444', 'tool', true, 1)
  RETURNING id INTO v_parent_id;

  INSERT INTO financial_categories (organization_id, parent_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, v_parent_id, 'Mão de Obra Direta', 'cost', 'custos', '#EF4444', 'users', true, 1),
    (p_organization_id, v_parent_id, 'Ferramentas e Softwares', 'cost', 'custos', '#EF4444', 'wrench', true, 2),
    (p_organization_id, v_parent_id, 'Infraestrutura', 'cost', 'custos', '#EF4444', 'server', true, 3);

  -- =========================================================================
  -- DESPESAS ADMINISTRATIVAS
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Aluguel e Condomínio', 'expense', 'despesas_administrativas', '#8B5CF6', 'home', true, 1),
    (p_organization_id, 'Energia, Internet e Telefone', 'expense', 'despesas_administrativas', '#8B5CF6', 'zap', true, 2),
    (p_organization_id, 'Contabilidade e Jurídico', 'expense', 'despesas_administrativas', '#8B5CF6', 'scale', true, 3),
    (p_organization_id, 'Material de Escritório', 'expense', 'despesas_administrativas', '#8B5CF6', 'paperclip', true, 4),
    (p_organization_id, 'SaaS e Assinaturas', 'expense', 'despesas_administrativas', '#8B5CF6', 'cloud', true, 5),
    (p_organization_id, 'Outras Despesas Admin', 'expense', 'despesas_administrativas', '#8B5CF6', 'folder', true, 6);

  -- =========================================================================
  -- DESPESAS COMERCIAIS
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Marketing Digital', 'expense', 'despesas_comerciais', '#EC4899', 'megaphone', true, 1),
    (p_organization_id, 'Eventos e Networking', 'expense', 'despesas_comerciais', '#EC4899', 'calendar', true, 2),
    (p_organization_id, 'Comissões de Vendas', 'expense', 'despesas_comerciais', '#EC4899', 'percent', true, 3),
    (p_organization_id, 'Brindes e Materiais', 'expense', 'despesas_comerciais', '#EC4899', 'gift', true, 4);

  -- =========================================================================
  -- DESPESAS COM PESSOAL
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Salários e Pró-labore', 'expense', 'despesas_pessoal', '#F97316', 'user', true, 1),
    (p_organization_id, 'Benefícios', 'expense', 'despesas_pessoal', '#F97316', 'heart', true, 2),
    (p_organization_id, 'FGTS, INSS e Encargos', 'expense', 'despesas_pessoal', '#F97316', 'shield', true, 3),
    (p_organization_id, 'Freelancers e Terceirizados', 'expense', 'despesas_pessoal', '#F97316', 'user-plus', true, 4);

  -- =========================================================================
  -- DEPRECIAÇÃO E AMORTIZAÇÃO
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Depreciação de Equipamentos', 'expense', 'depreciacao_amortizacao', '#6B7280', 'trending-down', true, 1),
    (p_organization_id, 'Amortização de Intangíveis', 'expense', 'depreciacao_amortizacao', '#6B7280', 'trending-down', true, 2);

  -- =========================================================================
  -- RESULTADO FINANCEIRO
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Juros Pagos', 'expense', 'resultado_financeiro', '#DC2626', 'trending-down', true, 1),
    (p_organization_id, 'Taxas Bancárias', 'expense', 'resultado_financeiro', '#DC2626', 'credit-card', true, 2),
    (p_organization_id, 'Juros Recebidos', 'revenue', 'resultado_financeiro', '#16A34A', 'trending-up', true, 3),
    (p_organization_id, 'Rendimentos de Aplicações', 'revenue', 'resultado_financeiro', '#16A34A', 'bar-chart', true, 4),
    (p_organization_id, 'Multas e Juros Recebidos', 'revenue', 'resultado_financeiro', '#16A34A', 'alert-circle', true, 5);

  -- =========================================================================
  -- IMPOSTOS SOBRE LUCRO
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'IRPJ', 'expense', 'impostos', '#991B1B', 'file-text', true, 1),
    (p_organization_id, 'CSLL', 'expense', 'impostos', '#991B1B', 'file-text', true, 2),
    (p_organization_id, 'Simples Nacional', 'expense', 'impostos', '#991B1B', 'file-text', true, 3);

  -- =========================================================================
  -- OUTRAS RECEITAS / DESPESAS (não operacionais)
  -- =========================================================================
  INSERT INTO financial_categories (organization_id, name, type, dre_group, color, icon, is_system, position) VALUES
    (p_organization_id, 'Outras Receitas', 'revenue', 'outras_receitas', '#6EE7B7', 'plus', true, 1),
    (p_organization_id, 'Outras Despesas', 'expense', 'outras_despesas', '#FCA5A5', 'minus', true, 1);

END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_financial_categories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_financial_categories(UUID) TO service_role;

import type { DreLineItem, DreReport, DreGroupTotal } from '../types/dre';
import type { DreGroup } from '../types/category';
import { DRE_GROUP_LABELS } from './formatters';

function buildGroupTotal(group: DreGroup, items: DreLineItem[]): DreGroupTotal {
  const groupItems = items.filter(i => i.dre_group_name === group);
  return {
    group,
    label: DRE_GROUP_LABELS[group] || group,
    items: groupItems,
    total: groupItems.reduce((sum, i) => sum + i.total_amount, 0),
  };
}

export function calculateDre(items: DreLineItem[]): DreReport {
  const receita_bruta = buildGroupTotal('receita_bruta', items);
  const deducoes = buildGroupTotal('deducoes', items);
  const receita_liquida = receita_bruta.total - deducoes.total;

  const custos = buildGroupTotal('custos', items);
  const lucro_bruto = receita_liquida - custos.total;

  const despesas_administrativas = buildGroupTotal('despesas_administrativas', items);
  const despesas_comerciais = buildGroupTotal('despesas_comerciais', items);
  const despesas_pessoal = buildGroupTotal('despesas_pessoal', items);
  const despesas_outras = buildGroupTotal('despesas_outras', items);

  const total_despesas_operacionais =
    despesas_administrativas.total +
    despesas_comerciais.total +
    despesas_pessoal.total +
    despesas_outras.total;

  const ebitda = lucro_bruto - total_despesas_operacionais;

  const depreciacao_amortizacao = buildGroupTotal('depreciacao_amortizacao', items);
  const ebit = ebitda - depreciacao_amortizacao.total;

  const resultado_financeiro = buildGroupTotal('resultado_financeiro', items);
  // Resultado financeiro: receitas financeiras - despesas financeiras
  const resultado_financeiro_net = resultado_financeiro.items.reduce((sum, i) => {
    // Items with revenue type add, expense type subtract
    const item = items.find(orig => orig.category_id === i.category_id);
    if (item) return sum + i.total_amount;
    return sum;
  }, 0);

  const lucro_antes_ir = ebit + resultado_financeiro_net;

  const impostos = buildGroupTotal('impostos', items);
  const lucro_liquido = lucro_antes_ir - impostos.total;

  const outras_receitas = buildGroupTotal('outras_receitas', items);
  const outras_despesas = buildGroupTotal('outras_despesas', items);

  return {
    receita_bruta,
    deducoes,
    receita_liquida,
    custos,
    lucro_bruto,
    despesas_administrativas,
    despesas_comerciais,
    despesas_pessoal,
    despesas_outras,
    ebitda,
    depreciacao_amortizacao,
    ebit,
    resultado_financeiro,
    lucro_antes_ir,
    impostos,
    lucro_liquido,
    outras_receitas,
    outras_despesas,
  };
}

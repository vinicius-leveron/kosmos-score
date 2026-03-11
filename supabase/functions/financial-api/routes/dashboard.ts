/**
 * Dashboard Routes
 *
 * GET /v1/dashboard - Dashboard metrics
 * GET /v1/cashflow - Cashflow projection
 * GET /v1/dre - DRE (income statement)
 */

import { getSupabaseAdmin } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, DashboardMetrics, CashFlowPeriod, DreReport } from '../types.ts';

export async function handleDashboard(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const resource = pathParts[0];

  if (req.method !== 'GET') {
    return errorResponse(errors.methodNotAllowed(req.method, `/v1/${resource}`), corsHeaders);
  }

  if (resource === 'dashboard') {
    return getDashboardMetrics(req, auth, corsHeaders);
  }

  if (resource === 'cashflow') {
    return getCashflow(req, auth, corsHeaders);
  }

  if (resource === 'dre') {
    return getDre(req, auth, corsHeaders);
  }

  return errorResponse(errors.notFound(`Endpoint /v1/${resource}`), corsHeaders);
}

// GET /v1/dashboard
async function getDashboardMetrics(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  // Default to current month
  const monthParam = url.searchParams.get('month');
  const month = monthParam || new Date().toISOString().slice(0, 7) + '-01';

  const { data, error } = await supabase.rpc('get_financial_dashboard_metrics', {
    p_organization_id: auth.organizationId,
    p_month: month,
  });

  if (error) {
    console.error('Dashboard metrics error:', error);
    return errorResponse(errors.internalError('Failed to fetch dashboard metrics'), corsHeaders);
  }

  const metrics: DashboardMetrics = data || {
    revenue_month: 0,
    expenses_month: 0,
    profit_month: 0,
    receivables_pending: 0,
    receivables_overdue: 0,
    receivables_overdue_count: 0,
    payables_pending: 0,
    payables_overdue: 0,
    payables_overdue_count: 0,
  };

  return new Response(JSON.stringify({ data: metrics }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// GET /v1/cashflow
async function getCashflow(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  const startDate = url.searchParams.get('start');
  const endDate = url.searchParams.get('end');
  const granularity = url.searchParams.get('granularity') || 'daily';

  if (!startDate || !endDate) {
    return errorResponse(
      errors.badRequest('start and end query parameters are required'),
      corsHeaders
    );
  }

  if (!['daily', 'weekly', 'monthly'].includes(granularity)) {
    return errorResponse(
      errors.badRequest('granularity must be daily, weekly, or monthly'),
      corsHeaders
    );
  }

  const { data, error } = await supabase.rpc('get_cashflow_projection', {
    p_organization_id: auth.organizationId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_granularity: granularity,
  });

  if (error) {
    console.error('Cashflow error:', error);
    return errorResponse(errors.internalError('Failed to fetch cashflow projection'), corsHeaders);
  }

  const periods: CashFlowPeriod[] = (data || []).map((row: Record<string, unknown>) => ({
    period_date: row.period_date as string,
    receivables: Number(row.receivables) || 0,
    payables: Number(row.payables) || 0,
    net: Number(row.net) || 0,
    cumulative_balance: Number(row.cumulative_balance) || 0,
  }));

  return new Response(JSON.stringify({ data: periods }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// GET /v1/dre
async function getDre(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  const startDate = url.searchParams.get('start');
  const endDate = url.searchParams.get('end');
  const useCompetence = url.searchParams.get('use_competence') !== 'false';

  if (!startDate || !endDate) {
    return errorResponse(
      errors.badRequest('start and end query parameters are required'),
      corsHeaders
    );
  }

  const { data, error } = await supabase.rpc('get_dre_report', {
    p_organization_id: auth.organizationId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_use_competence: useCompetence,
  });

  if (error) {
    console.error('DRE error:', error);
    return errorResponse(errors.internalError('Failed to fetch DRE report'), corsHeaders);
  }

  // Transform raw data into DRE structure
  const dreGroups: Record<string, { total: number; items: Array<{ category_id: string; category_name: string; total: number }> }> = {};

  for (const row of data || []) {
    const group = row.dre_group as string;
    if (!dreGroups[group]) {
      dreGroups[group] = { total: 0, items: [] };
    }
    dreGroups[group].total += Number(row.total) || 0;
    dreGroups[group].items.push({
      category_id: row.category_id,
      category_name: row.category_name,
      total: Number(row.total) || 0,
    });
  }

  const getGroup = (name: string) => dreGroups[name] || { total: 0, items: [] };

  const receitaBruta = getGroup('receita_bruta').total;
  const deducoes = getGroup('deducoes').total;
  const receitaLiquida = receitaBruta - deducoes;
  const custos = getGroup('custos').total;
  const lucroBruto = receitaLiquida - custos;

  const despAdm = getGroup('despesas_administrativas').total;
  const despCom = getGroup('despesas_comerciais').total;
  const despPes = getGroup('despesas_pessoal').total;
  const despOutras = getGroup('despesas_outras').total;
  const totalDespesas = despAdm + despCom + despPes + despOutras;

  const ebitda = lucroBruto - totalDespesas;
  const deprec = getGroup('depreciacao_amortizacao').total;
  const ebit = ebitda - deprec;
  const resultFin = getGroup('resultado_financeiro').total;
  const lucroAntesIr = ebit + resultFin;
  const impostos = getGroup('impostos').total;
  const lucroLiquido = lucroAntesIr - impostos;

  const dre: DreReport = {
    receita_bruta: getGroup('receita_bruta'),
    deducoes: getGroup('deducoes'),
    receita_liquida: receitaLiquida,
    custos: getGroup('custos'),
    lucro_bruto: lucroBruto,
    despesas_administrativas: getGroup('despesas_administrativas'),
    despesas_comerciais: getGroup('despesas_comerciais'),
    despesas_pessoal: getGroup('despesas_pessoal'),
    despesas_outras: getGroup('despesas_outras'),
    ebitda,
    depreciacao_amortizacao: getGroup('depreciacao_amortizacao'),
    ebit,
    resultado_financeiro: getGroup('resultado_financeiro'),
    lucro_antes_ir: lucroAntesIr,
    impostos: getGroup('impostos'),
    lucro_liquido: lucroLiquido,
  };

  return new Response(JSON.stringify({ data: dre }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Raio-X KOSMOS - Edge Function
 *
 * Processes quiz answers through Claude AI to generate a comprehensive
 * digital ecosystem diagnostic (Raio-X).
 *
 * Flow:
 * 1. Receive POST with quiz answers + contact info
 * 2. Validate input and check rate limits
 * 3. Calculate lead score server-side
 * 4. Call Claude API with 4 parallel prompts
 * 5. Save result to lead_magnet_results table
 * 6. Return the result
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =============================================================================
// CORS
// =============================================================================

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// =============================================================================
// CONSTANTS
// =============================================================================

const KOSMOS_ORG_ID = 'c0000000-0000-0000-0000-000000000001'
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MAX_SUBMISSIONS_PER_DAY = 5

// =============================================================================
// TYPES
// =============================================================================

interface QuizAnswer {
  type: 'single' | 'text'
  value: string
  numericValue?: number
}

interface QuizInput {
  name: string
  email: string
  instagram?: string
  answers: Record<string, QuizAnswer>
}

interface ScoreBreakdown {
  total: number
  maxPossible: number
  classification: 'INICIO' | 'EM_CONSTRUCAO' | 'QUALIFICADO'
  breakdown: Record<string, number>
}

// =============================================================================
// SCORING LOGIC
// =============================================================================

const SCORABLE_QUESTIONS: Record<string, number> = {
  p2: 5,  // faturamento
  p3: 4,  // base
  p5: 2,  // receita
  p8: 3,  // teste 30 dias
  p9: 3,  // atividade base
  p13: 3, // conexao
}

function calculateScore(answers: Record<string, QuizAnswer>): ScoreBreakdown {
  const breakdown: Record<string, number> = {}
  let total = 0

  for (const [key, maxScore] of Object.entries(SCORABLE_QUESTIONS)) {
    const answer = answers[key]
    const value = answer?.numericValue ?? 0
    const clamped = Math.max(0, Math.min(value, maxScore))
    breakdown[key] = clamped
    total += clamped
  }

  const maxPossible = Object.values(SCORABLE_QUESTIONS).reduce((a, b) => a + b, 0) // 20

  let classification: ScoreBreakdown['classification']
  if (total <= 5) {
    classification = 'INICIO'
  } else if (total <= 11) {
    classification = 'EM_CONSTRUCAO'
  } else {
    classification = 'QUALIFICADO'
  }

  return { total, maxPossible, classification, breakdown }
}

// =============================================================================
// HELPERS
// =============================================================================

function getAnswerValue(answers: Record<string, QuizAnswer>, key: string, fallback: string): string {
  const answer = answers[key]
  if (!answer || !answer.value || answer.value.trim() === '') {
    return fallback
  }
  return answer.value.trim()
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status)
}

// =============================================================================
// CLAUDE API CALLS
// =============================================================================

async function callClaude(prompt: string, apiKey: string): Promise<unknown> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  const text = result.content?.[0]?.text ?? ''

  // Parse JSON from response, handling potential markdown code blocks
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    console.error('Failed to parse Claude response as JSON:', text)
    return { raw_response: text, parse_error: true }
  }
}

// =============================================================================
// PROMPTS
// =============================================================================

function buildPrompt1(answers: Record<string, QuizAnswer>): string {
  const p1 = getAnswerValue(answers, 'p1', 'negocio_digital')
  const p2 = getAnswerValue(answers, 'p2', 'nao_informado')
  const p3 = getAnswerValue(answers, 'p3', 'nao_informado')
  const p4 = getAnswerValue(answers, 'p4', `1 produto baseado no tipo de negocio (${p1})`)
  const p5 = getAnswerValue(answers, 'p5', 'nao_informado')
  const p13 = getAnswerValue(answers, 'p13', 'nao_informado')

  return `Voce e um consultor senior de ecossistemas digitais. Analise a esteira de produtos deste negocio.

DADOS DO NEGOCIO:
- Tipo: ${p1}
- Faturamento mensal: ${p2}
- Tamanho da base: ${p3}
- Produtos atuais: ${p4}
- Modelo de receita: ${p5}
- Conexao entre membros: ${p13}

TAREFA:
1. Liste os produtos que o negocio JA TEM (extraia de P4 com nome e preco).
2. Calcule o LTV atual estimado.
3. Identifique GAPS na esteira — quais categorias faltam? (RECORRENCIA, EVENTO PRESENCIAL, HIGH TICKET, ATIVACAO DE BASE, CERTIFICACAO)
4. Para cada oportunidade, calcule potencial de receita conservador.
5. Calcule "PODERIA FATURAR" e "RECEITA TRAVADA".

FORMATO DE RESPOSTA (JSON apenas, sem markdown):
{"produtos_atuais":[{"nome":"...","preco":0}],"ltv_atual":0,"oportunidades":[{"tipo":"RECORRENCIA|EVENTO|HIGH_TICKET|ATIVACAO|CERTIFICACAO","titulo":"...","descricao":"...","itens":["..."],"valor_estimado":"R$ X","calculo":"..."}],"fatura_hoje":"R$ X/mes","poderia_faturar":"R$ X/mes","receita_travada":"R$ X/mes","total_oportunidades":"R$ X"}

REGRAS: Nao sugira o que ja tem. Maximo 4 oportunidades. Numeros conservadores.`
}

function buildPrompt2(answers: Record<string, QuizAnswer>): string {
  const p1 = getAnswerValue(answers, 'p1', 'negocio_digital')
  const p4 = getAnswerValue(answers, 'p4', `1 produto baseado no tipo de negocio (${p1})`)
  const p10 = getAnswerValue(answers, 'p10', `Negocio de ${p1}`)
  const p11 = getAnswerValue(answers, 'p11', '')

  const p11Section = p11
    ? `- Melhor resultado de aluno: "${p11}"`
    : '- Melhor resultado de aluno: nao informado (gere uma transformacao generica baseada no tipo de negocio)'

  return `Voce e um especialista em posicionamento de negocios digitais. Revele o contraste entre feature e transformacao.

DADOS:
- Tipo: ${p1}
- Produtos: ${p4}
- Como descreve o que faz: "${p10}"
${p11Section}

TAREFA: Extraia a FEATURE (funcional) e a TRANSFORMACAO REAL (emocional/identitario).

FORMATO (JSON apenas): {"feature":"...","transformacao":"..."}

REGRAS: Feature deve parecer "normal". Transformacao deve criar um "caralho, e isso". NAO use linguagem de coach. Use linguagem concreta e real.`
}

function buildPrompt3(answers: Record<string, QuizAnswer>): string {
  const p1 = getAnswerValue(answers, 'p1', 'negocio_digital')
  const p10 = getAnswerValue(answers, 'p10', `Negocio de ${p1}`)
  const p12 = getAnswerValue(answers, 'p12', '')

  if (!p12) {
    // Skip causa/inimigo analysis, return defaults
    return `Voce e um estrategista de narrativa. Crie uma causa, inimigo, narrativa e movimento generico para um negocio digital do tipo "${p1}" que se descreve como "${p10}".

TAREFA: Crie causa, inimigo, narrativa condensada e movimento possivel baseado no tipo de negocio.

FORMATO (JSON apenas): {"causa":"...","inimigo":"...","narrativa":"...","movimento":"..."}

REGRAS: Linguagem de rua, nao corporativa. Inimigo e padrao/mentalidade, nao pessoa. Movimento cabe numa camiseta.`
  }

  return `Voce e um estrategista de narrativa. Analise a historia de origem deste fundador.

DADOS:
- Tipo: ${p1}
- O que faz: "${p10}"
- Por que comecou: "${p12}"

TAREFA: Extraia causa, inimigo, narrativa condensada e movimento possivel.

FORMATO (JSON apenas): {"causa":"...","inimigo":"...","narrativa":"...","movimento":"..."}

REGRAS: Linguagem de rua, nao corporativa. Inimigo e padrao/mentalidade, nao pessoa. Movimento cabe numa camiseta.`
}

function buildPrompt4(answers: Record<string, QuizAnswer>): string {
  const p5 = getAnswerValue(answers, 'p5', 'nao_informado')
  const p6 = getAnswerValue(answers, 'p6', 'nao_informado')
  const p7 = getAnswerValue(answers, 'p7', 'nao_informado')
  const p8 = getAnswerValue(answers, 'p8', 'nao_informado')
  const p9 = getAnswerValue(answers, 'p9', 'nao_informado')
  const p13 = getAnswerValue(answers, 'p13', 'nao_informado')

  return `Voce e um analista de modelos de negocio digital. Determine se e ciclo fechado, parcial ou aberto.

DADOS:
- Modelo receita: ${p5}
- Canal aquisicao: ${p6}
- Equipe: ${p7}
- Teste 30 dias: ${p8}
- Atividade base: ${p9}
- Conexao membros: ${p13}

TAREFA:
1. Classifique: CICLO_FECHADO, CICLO_PARCIAL ou CICLO_ABERTO
2. Score dependencia 0-100
3. 3 maiores riscos (max 10 palavras cada)
4. Frase final descrevendo a realidade

FORMATO (JSON apenas): {"modelo":"CICLO_FECHADO|CICLO_PARCIAL|CICLO_ABERTO","dependencia_score":0,"riscos":["...","...","..."],"frase_final":"..."}

REGRAS: Maioria e CICLO_FECHADO. Se P8="Tudo para" → CICLO_FECHADO. Frase direta, sem eufemismo.`
}

// =============================================================================
// RATE LIMITING
// =============================================================================

async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('lead_magnet_results')
    .select('id', { count: 'exact', head: true })
    .eq('respondent_email', email.toLowerCase().trim())
    .eq('lead_magnet_type', 'raio-x-kosmos')
    .gte('created_at', today.toISOString())

  if (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request (fail open)
    return true
  }

  return (count ?? 0) < MAX_SUBMISSIONS_PER_DAY
}

// =============================================================================
// INPUT VALIDATION
// =============================================================================

function validateInput(body: unknown): { valid: true; data: QuizInput } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' }
  }

  const input = body as Record<string, unknown>

  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    return { valid: false, error: 'Field "name" is required' }
  }

  if (!input.email || typeof input.email !== 'string' || !input.email.includes('@')) {
    return { valid: false, error: 'Field "email" must be a valid email address' }
  }

  if (!input.answers || typeof input.answers !== 'object') {
    return { valid: false, error: 'Field "answers" is required and must be an object' }
  }

  return {
    valid: true,
    data: {
      name: input.name as string,
      email: input.email as string,
      instagram: (input.instagram as string) ?? '',
      answers: input.answers as Record<string, QuizAnswer>,
    },
  }
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed. Use POST.', 405)
  }

  const startTime = Date.now()

  try {
    // -------------------------------------------------------------------------
    // 1. Parse and validate input
    // -------------------------------------------------------------------------
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON in request body', 400)
    }

    const validation = validateInput(body)
    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const { name, email, instagram, answers } = validation.data

    // -------------------------------------------------------------------------
    // 2. Initialize Supabase client (service role for inserts)
    // -------------------------------------------------------------------------
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return errorResponse('Server configuration error', 500)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // -------------------------------------------------------------------------
    // 3. Rate limiting
    // -------------------------------------------------------------------------
    const withinLimit = await checkRateLimit(supabase, email)
    if (!withinLimit) {
      return errorResponse(
        `Rate limit exceeded. Maximum ${MAX_SUBMISSIONS_PER_DAY} submissions per day per email.`,
        429
      )
    }

    // -------------------------------------------------------------------------
    // 4. Calculate score server-side
    // -------------------------------------------------------------------------
    const scoreBreakdown = calculateScore(answers)

    // -------------------------------------------------------------------------
    // 5. Call Claude API with 4 parallel prompts (or simulate if no API key)
    // -------------------------------------------------------------------------
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const isSimulation = !anthropicApiKey

    if (isSimulation) {
      console.warn('[raio-x-process] ANTHROPIC_API_KEY not set — running in SIMULATION mode')
    }

    let prompt1_opportunities: unknown
    let prompt2_transformation: unknown
    let prompt3_narrative: unknown
    let prompt4_model: unknown

    if (isSimulation) {
      // Generate realistic mock responses based on actual answers
      const p1 = getAnswerValue(answers, 'p1', 'negocio_digital')
      const p2 = getAnswerValue(answers, 'p2', 'ate_10k')
      const p4 = getAnswerValue(answers, 'p4', 'Curso online')

      prompt1_opportunities = {
        produtos_atuais: [{ nome: p4 || 'Produto principal', preco: 497 }],
        ltv_atual: 497,
        oportunidades: [
          {
            tipo: 'RECORRENCIA',
            titulo: 'Comunidade com assinatura mensal',
            descricao: `Criar uma comunidade paga para alunos e interessados no seu nicho de ${p1}`,
            itens: ['Grupo exclusivo', 'Conteudo mensal', 'Lives semanais', 'Networking'],
            valor_estimado: 'R$ 15.000/mes',
            calculo: '100 membros x R$ 150/mes',
          },
          {
            tipo: 'EVENTO',
            titulo: 'Imersao presencial trimestral',
            descricao: 'Evento de 2 dias com experiencia premium e networking avancado',
            itens: ['Workshops praticos', 'Mentoria em grupo', 'Certificado'],
            valor_estimado: 'R$ 30.000/trimestre',
            calculo: '30 participantes x R$ 1.000',
          },
          {
            tipo: 'HIGH_TICKET',
            titulo: 'Mentoria individual premium',
            descricao: 'Acompanhamento 1:1 para clientes avancados por 3 meses',
            itens: ['Calls semanais', 'Suporte via WhatsApp', 'Plano personalizado'],
            valor_estimado: 'R$ 24.000/mes',
            calculo: '4 mentorados x R$ 6.000/trimestre',
          },
          {
            tipo: 'ATIVACAO',
            titulo: 'Desafio de 21 dias para base fria',
            descricao: 'Reativar leads antigos com desafio gratuito que converte para oferta paga',
            itens: ['Email sequence', 'Grupo temporario', 'Oferta exclusiva no final'],
            valor_estimado: 'R$ 8.000/mes',
            calculo: '5% de conversao da base reativada',
          },
        ],
        fatura_hoje: p2.includes('50k') ? 'R$ 50.000/mes' : p2.includes('30k') ? 'R$ 30.000/mes' : 'R$ 10.000/mes',
        poderia_faturar: 'R$ 77.000/mes',
        receita_travada: 'R$ 67.000/mes',
        total_oportunidades: 'R$ 77.000',
      }

      prompt2_transformation = {
        feature: `Ensina tecnicas e estrategias de ${p1}`,
        transformacao: `Tira pessoas de uma vida no piloto automatico e coloca elas no controle do proprio destino — com resultados reais, nao promessas de guru`,
      }

      prompt3_narrative = {
        causa: 'Acabar com o mito de que voce precisa de permissao pra comecar',
        inimigo: 'A mentalidade de "primeiro eu preciso estar pronto"',
        narrativa: 'Comecou do zero, sem audiencia, sem equipe, sem capital. Provou que acao imperfeita vence planejamento perfeito.',
        movimento: 'Comeca imperfeito, mas comeca',
      }

      prompt4_model = {
        modelo: scoreBreakdown.total <= 5 ? 'CICLO_FECHADO' : scoreBreakdown.total <= 11 ? 'CICLO_PARCIAL' : 'CICLO_ABERTO',
        dependencia_score: scoreBreakdown.total <= 5 ? 85 : scoreBreakdown.total <= 11 ? 55 : 25,
        riscos: [
          'Receita depende 100% de lancamentos',
          'Base parada entre lancamentos',
          'Sem receita recorrente previsivel',
        ],
        frase_final: scoreBreakdown.total <= 5
          ? 'Seu negocio so fatura quando voce trabalha. Se voce parar, tudo para.'
          : scoreBreakdown.total <= 11
            ? 'Voce ja tem pistas de um ecossistema, mas ainda depende demais de um unico canal.'
            : 'Voce tem as pecas — so falta montar o quebra-cabeca de um ecossistema que funciona sem voce.',
      }
    } else {
      const prompt1 = buildPrompt1(answers)
      const prompt2 = buildPrompt2(answers)
      const prompt3 = buildPrompt3(answers)
      const prompt4 = buildPrompt4(answers)

      try {
        const [r1, r2, r3, r4] = await Promise.all([
          callClaude(prompt1, anthropicApiKey),
          callClaude(prompt2, anthropicApiKey),
          callClaude(prompt3, anthropicApiKey),
          callClaude(prompt4, anthropicApiKey),
        ])

        prompt1_opportunities = r1
        prompt2_transformation = r2
        prompt3_narrative = r3
        prompt4_model = r4
      } catch (err) {
        console.error('Claude API call failed:', err)
        return errorResponse(
          'AI processing failed. Please try again in a few moments.',
          502
        )
      }
    }

    // -------------------------------------------------------------------------
    // 6. Save to Supabase
    // -------------------------------------------------------------------------
    const { data, error } = await supabase
      .from('lead_magnet_results')
      .insert({
        lead_magnet_type: 'raio-x-kosmos',
        respondent_name: name.trim(),
        respondent_email: email.toLowerCase().trim(),
        inputs: {
          answers,
          contact: { name, email, instagram },
        },
        outputs: {
          prompt1_opportunities,
          prompt2_transformation,
          prompt3_narrative,
          prompt4_model,
        },
        total_score: scoreBreakdown.total,
        score_level: scoreBreakdown.classification,
        score_breakdown: scoreBreakdown,
        organization_id: KOSMOS_ORG_ID,
        source: 'raio-x-quiz',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return errorResponse('Failed to save results. Please try again.', 500)
    }

    // -------------------------------------------------------------------------
    // 7. Send result email via Resend (fire-and-forget)
    // -------------------------------------------------------------------------
    try {
      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-raio-x-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            resultId: data.id,
            classification: scoreBreakdown.classification,
          }),
        }
      )
      if (!emailResponse.ok) {
        console.warn('[raio-x-process] Email send failed:', await emailResponse.text())
      }
    } catch (emailErr) {
      console.warn('[raio-x-process] Email send error (non-blocking):', emailErr)
    }

    // -------------------------------------------------------------------------
    // 8. Return result
    // -------------------------------------------------------------------------
    const processingTimeMs = Date.now() - startTime

    return jsonResponse({
      id: data.id,
      classification: scoreBreakdown.classification,
      outputs: {
        prompt1_opportunities,
        prompt2_transformation,
        prompt3_narrative,
        prompt4_model,
      },
      score: {
        p2_score: scoreBreakdown.breakdown['p2'] ?? 0,
        p3_score: scoreBreakdown.breakdown['p3'] ?? 0,
        p5_score: scoreBreakdown.breakdown['p5'] ?? 0,
        p8_score: scoreBreakdown.breakdown['p8'] ?? 0,
        p9_score: scoreBreakdown.breakdown['p9'] ?? 0,
        p13_score: scoreBreakdown.breakdown['p13'] ?? 0,
        total: scoreBreakdown.total,
        classification: scoreBreakdown.classification,
      },
      meta: {
        processingTimeMs,
        model: isSimulation ? 'simulation' : CLAUDE_MODEL,
        simulation: isSimulation,
      },
    })
  } catch (err) {
    console.error('Unexpected error in raio-x-process:', err)
    return errorResponse(
      'An unexpected error occurred. Please try again.',
      500
    )
  }
})

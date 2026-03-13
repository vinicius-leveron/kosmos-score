import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  name: string
  email: string
  resultId: string
  classification: 'INICIO' | 'EM_CONSTRUCAO' | 'QUALIFICADO'
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  INICIO: 'Início',
  EM_CONSTRUCAO: 'Em Construção',
  QUALIFICADO: 'Qualificado',
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  INICIO: '#fbbf24',
  EM_CONSTRUCAO: '#E05A30',
  QUALIFICADO: '#4ade80',
}

function buildEmailHtml(name: string, resultUrl: string, classification: string): string {
  const label = CLASSIFICATION_LABELS[classification] || classification
  const color = CLASSIFICATION_COLORS[classification] || '#E05A30'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#0c0c0c;border-radius:12px;border:1px solid #1a1a1a;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <span style="color:#E05A30;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">
                RAIO-X KOSMOS
              </span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px;">
              <h1 style="color:#F5F0E8;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;">
                ${name}, seu Raio-X está pronto!
              </h1>
              <p style="color:#A09A92;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Analisamos seu modelo de negócio e geramos um diagnóstico personalizado com recomendações de crescimento.
              </p>
              <!-- Classification Badge -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:${color}15;border:1px solid ${color}33;border-radius:20px;padding:8px 16px;">
                    <span style="color:${color};font-size:13px;font-weight:600;">
                      Classificação: ${label}
                    </span>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <a href="${resultUrl}" style="display:inline-block;background-color:#E05A30;color:#ffffff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                      Ver Meu Raio-X Completo →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #1a1a1a;text-align:center;">
              <p style="color:#6B665F;font-size:12px;margin:0;">
                Powered by KOSMOS Ecossistemas
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.warn('[send-raio-x-email] RESEND_API_KEY not configured, skipping email')
      return new Response(
        JSON.stringify({ success: false, message: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const { name, email, resultId, classification } = await req.json() as EmailRequest

    if (!email || !resultId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, resultId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://kosmosecossistemas.com'
    const resultUrl = `${appUrl}/#/raio-x/${resultId}`

    const html = buildEmailHtml(name || 'Empreendedor', resultUrl, classification)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KOSMOS <raio-x@kosmosecossistemas.com>',
        to: [email],
        subject: `${name || 'Empreendedor'}, seu Raio-X KOSMOS está pronto!`,
        html,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('[send-raio-x-email] Resend error:', result)
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[send-raio-x-email] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

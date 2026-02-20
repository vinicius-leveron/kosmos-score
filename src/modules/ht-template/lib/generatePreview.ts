import { TemplateData, TEMPLATE_SECTIONS } from './sections';

/**
 * Gera um preview formatado da oferta high ticket
 */
export function generatePreview(data: TemplateData): string {
  const sections: string[] = [];

  // Header
  const stack = data.stack_valor || {};
  if (stack.headline_oferta) {
    sections.push(`# ${stack.headline_oferta}`);
    if (stack.subheadline) {
      sections.push(`*${stack.subheadline}*`);
    }
    sections.push('');
  }

  // Transformação
  const transformacao = data.transformacao || {};
  if (transformacao.estado_atual || transformacao.estado_desejado) {
    sections.push('## A Transformação');
    sections.push('');
    if (transformacao.estado_atual) {
      sections.push('**ANTES:**');
      sections.push(String(transformacao.estado_atual));
      sections.push('');
    }
    if (transformacao.estado_desejado) {
      sections.push('**DEPOIS:**');
      sections.push(String(transformacao.estado_desejado));
      sections.push('');
    }
    if (transformacao.tempo_transformacao) {
      const tempos: Record<string, string> = {
        '30dias': '30 dias',
        '60dias': '60 dias',
        '90dias': '90 dias',
        '6meses': '6 meses',
        '12meses': '12 meses',
      };
      sections.push(`*Prazo: ${tempos[String(transformacao.tempo_transformacao)] || transformacao.tempo_transformacao}*`);
      sections.push('');
    }
  }

  // Método
  const mecanismo = data.mecanismo || {};
  if (mecanismo.nome_metodo) {
    sections.push(`## O Método: ${mecanismo.nome_metodo}`);
    sections.push('');
    if (Array.isArray(mecanismo.etapas) && mecanismo.etapas.length > 0) {
      mecanismo.etapas.forEach((etapa, i) => {
        sections.push(`${i + 1}. ${etapa}`);
      });
      sections.push('');
    }
    if (mecanismo.diferencial) {
      sections.push(`*${mecanismo.diferencial}*`);
      sections.push('');
    }
  }

  // Entregáveis
  const entregaveis = data.entregaveis || {};
  if (entregaveis.entregavel_principal) {
    sections.push(`## O Que Você Recebe: ${entregaveis.entregavel_principal}`);
    sections.push('');
    if (Array.isArray(entregaveis.componentes) && entregaveis.componentes.length > 0) {
      entregaveis.componentes.forEach((item) => {
        sections.push(`✓ ${item}`);
      });
      sections.push('');
    }
    if (Array.isArray(entregaveis.bonus) && entregaveis.bonus.length > 0) {
      sections.push('**BÔNUS:**');
      entregaveis.bonus.forEach((item) => {
        sections.push(`🎁 ${item}`);
      });
      sections.push('');
    }
  }

  // Garantia
  const garantias = data.garantias || {};
  if (garantias.tipo_garantia && garantias.tipo_garantia !== 'nenhuma') {
    sections.push('## Garantia');
    sections.push('');
    if (garantias.descricao_garantia) {
      sections.push(String(garantias.descricao_garantia));
      sections.push('');
    }
    if (garantias.risk_reversal) {
      sections.push(String(garantias.risk_reversal));
      sections.push('');
    }
  }

  // Investimento
  const pricing = data.pricing || {};
  if (pricing.investimento) {
    sections.push('## Investimento');
    sections.push('');
    if (pricing.ancora_valor) {
      sections.push(`~~Valor real: R$ ${Number(pricing.ancora_valor).toLocaleString('pt-BR')}~~`);
    }
    sections.push(`**R$ ${Number(pricing.investimento).toLocaleString('pt-BR')}**`);
    if (pricing.parcelas) {
      sections.push(`ou ${pricing.parcelas}`);
    }
    sections.push('');
    if (pricing.justificativa_preco) {
      sections.push(`*${pricing.justificativa_preco}*`);
      sections.push('');
    }
  }

  // Para Quem É
  if (stack.publico_ideal) {
    sections.push('## Para Quem É');
    sections.push('');
    sections.push(String(stack.publico_ideal));
    sections.push('');
  }

  // CTA
  if (stack.cta_principal) {
    sections.push('---');
    sections.push('');
    sections.push(`**[${stack.cta_principal}]**`);
  }

  return sections.join('\n');
}

/**
 * Calcula a completude do template
 */
export function calculateCompleteness(data: TemplateData): number {
  let totalFields = 0;
  let filledFields = 0;

  TEMPLATE_SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.required) {
        totalFields++;
        const sectionData = data[section.id];
        if (sectionData) {
          const value = sectionData[field.id];
          if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim())) {
            filledFields++;
          }
        }
      }
    });
  });

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

import { BlueprintData, ECOSYSTEM_LAYERS, calculateOverallScore, LayerScore } from './layers';

/**
 * Gera um preview formatado do blueprint de ecossistema
 */
export function generateBlueprintPreview(data: BlueprintData): string {
  const sections: string[] = [];
  const { layerScores, overallStatus, averageScore } = calculateOverallScore(data);

  // Header
  sections.push('# Blueprint de Ecossistema');
  sections.push(`**Status Geral:** ${overallStatus} (${averageScore.toFixed(1)}/5)`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Each layer
  ECOSYSTEM_LAYERS.forEach((layer, index) => {
    const layerData = data[layer.id] || {};
    const score = layerScores[index];

    sections.push(`## ${layer.emoji} ${layer.name} - ${layer.headline}`);
    sections.push(`*Status: ${getStatusLabel(score.status)} (${score.score}/5)*`);
    sections.push('');

    layer.questions.forEach((question) => {
      if (question.type === 'assessment') {
        const value = layerData[question.id] as number;
        if (value) {
          const option = question.assessmentOptions?.find((o) => o.value === value);
          sections.push(`**Autoavaliacao:** ${option?.label || value}`);
          sections.push('');
        }
        return;
      }

      const value = layerData[question.id];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        sections.push(`**${question.question}**`);
        sections.push('*Nao preenchido*');
        sections.push('');
        return;
      }

      sections.push(`**${question.question}**`);
      if (Array.isArray(value)) {
        const filteredList = value.filter((item) => item.trim() !== '');
        if (filteredList.length > 0) {
          filteredList.forEach((item) => {
            sections.push(`- ${item}`);
          });
        } else {
          sections.push('*Nao preenchido*');
        }
      } else {
        sections.push(String(value));
      }
      sections.push('');
    });

    sections.push('---');
    sections.push('');
  });

  // Summary
  sections.push('## Resumo');
  sections.push('');
  sections.push('| Camada | Status | Score |');
  sections.push('|--------|--------|-------|');
  ECOSYSTEM_LAYERS.forEach((layer, index) => {
    const score = layerScores[index];
    sections.push(`| ${layer.emoji} ${layer.name} | ${getStatusLabel(score.status)} | ${score.score}/5 |`);
  });
  sections.push('');

  // Recommendations
  const weakLayers = layerScores.filter((s) => s.score <= 2);
  if (weakLayers.length > 0) {
    sections.push('## Proximos Passos');
    sections.push('');
    sections.push('Camadas que precisam de atencao:');
    sections.push('');
    weakLayers.forEach((score) => {
      const layer = ECOSYSTEM_LAYERS.find((l) => l.id === score.layerId);
      if (layer) {
        sections.push(`- **${layer.emoji} ${layer.name}:** ${getRecommendation(score.layerId)}`);
      }
    });
  }

  return sections.join('\n');
}

function getStatusLabel(status: LayerScore['status']): string {
  const labels: Record<LayerScore['status'], string> = {
    vazio: 'Vazio',
    iniciando: 'Iniciando',
    construindo: 'Construindo',
    maduro: 'Maduro',
    autonomo: 'Autonomo',
  };
  return labels[status];
}

function getRecommendation(layerId: string): string {
  const recommendations: Record<string, string> = {
    raiz: 'Defina seu manifesto e valores inegociaveis. Sem raiz clara, membros nao se identificam.',
    estrutura: 'Crie rituais recorrentes e documente seu onboarding. Previsibilidade gera habito.',
    cultura: 'Incentive conexoes entre membros. Crie linguagem compartilhada e espacos de co-criacao.',
    crescimento: 'Facilite indicacoes e celebre quem traz novos membros. Ative seus embaixadores.',
    autonomia: 'Comece a delegar. Identifique lideres emergentes e de a eles responsabilidades.',
  };
  return recommendations[layerId] || 'Preencha mais informacoes desta camada.';
}

/**
 * Calcula a completude do blueprint
 */
export function calculateBlueprintCompleteness(data: BlueprintData): number {
  let totalFields = 0;
  let filledFields = 0;

  ECOSYSTEM_LAYERS.forEach((layer) => {
    const layerData = data[layer.id] || {};

    layer.questions.forEach((question) => {
      // Skip assessment questions for completeness
      if (question.type === 'assessment') return;

      totalFields++;
      const value = layerData[question.id];

      if (question.type === 'list') {
        const list = (value as string[]) || [];
        if (list.length > 0 && list.some((item) => item.trim() !== '')) {
          filledFields++;
        }
      } else if (value && String(value).trim() !== '') {
        filledFields++;
      }
    });
  });

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

/**
 * Returns recommendations based on overall ecosystem status
 */
export function getOverallRecommendations(overallStatus: string): string[] {
  const recommendations: Record<string, string[]> = {
    Audiencia: [
      'Voce ainda esta no estagio de audiencia - consumidores passivos.',
      'Comece pela RAIZ: defina uma transformacao clara que una as pessoas.',
      'Crie um primeiro ritual simples e recorrente para gerar interacao.',
      'Foque em transformar seguidores em participantes ativos.',
    ],
    Comunidade: [
      'Voce ja tem uma comunidade ativa, mas ela depende muito de voce.',
      'Foque na ESTRUTURA: documente processos e crie rituais que funcionem sozinhos.',
      'Comece a identificar membros que podem se tornar facilitadores.',
      'O proximo passo e incentivar conexoes entre os membros (CULTURA).',
    ],
    Ecossistema: [
      'Voce ja tem um ecossistema funcional - membros se conectam entre si.',
      'Agora foque no CRESCIMENTO: ative indicacoes e embaixadores.',
      'Celebre e de visibilidade para quem contribui com o ecossistema.',
      'Comece a testar o que funciona sem sua presenca direta.',
    ],
    Movimento: [
      'Voce esta construindo um movimento - membros propagam a mensagem.',
      'Foque na AUTONOMIA: distribua lideranca e responsabilidades.',
      'Documente tudo para que o ecossistema possa crescer sem voce.',
      'Prepare-se para dar um passo atras e observar o movimento proprio.',
    ],
    Legado: [
      'Parabens! Voce construiu um legado - o ecossistema tem vida propria.',
      'Continue nutrindo os lideres emergentes e facilitadores.',
      'Seu papel agora e visao e direcao, nao operacao.',
      'Considere como escalar ou replicar este modelo.',
    ],
  };

  return recommendations[overallStatus] || [];
}

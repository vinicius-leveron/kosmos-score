import {
  AuditResult,
  getProfileInfo,
  getPillarDiagnosis,
  getStageMessage,
  getLucroLabel,
  WORKSHOP_DATE,
} from './auditQuestionsV2';

export function generatePDF(result: AuditResult) {
  const profileInfo = getProfileInfo(result.resultProfile);
  const movimentoDiagnosis = getPillarDiagnosis('movimento', result.scoreMovimento);
  const estruturaDiagnosis = getPillarDiagnosis('estrutura', result.scoreEstrutura);
  const economiaDiagnosis = getPillarDiagnosis('economia', result.scoreEconomia);
  const lucroLabel = getLucroLabel(result.stage);
  const stageMessage = getStageMessage(result.stage);

  const getScoreColor = (score: number) => {
    if (score <= 25) return '#EF4444';
    if (score <= 50) return '#F97316';
    if (score <= 75) return '#EAB308';
    return '#22C55E';
  };

  const getPillarColor = (score: number) => {
    if (score < 40) return '#EF4444';
    if (score < 70) return '#EAB308';
    return '#22C55E';
  };

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Auditoria de Lucro Oculto KOSMOS</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #0A0A0A;
          color: #FFFFFF;
          padding: 40px;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #D4621B;
        }
        .header h1 {
          color: #D4621B;
          font-size: 14px;
          letter-spacing: 4px;
          margin-bottom: 10px;
        }
        .header h2 {
          font-size: 24px;
          font-weight: normal;
          color: #A0A0A0;
        }
        .score-section {
          text-align: center;
          background: #1A1A1A;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .score-label {
          color: #A0A0A0;
          font-size: 12px;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }
        .score-value {
          font-size: 72px;
          font-weight: bold;
          color: ${getScoreColor(result.kosmosAssetScore)};
        }
        .score-max {
          font-size: 24px;
          color: #A0A0A0;
        }
        .classification {
          font-size: 20px;
          font-weight: bold;
          margin-top: 20px;
          color: ${getScoreColor(result.kosmosAssetScore)};
        }
        .classification-desc {
          color: #A0A0A0;
          margin-top: 10px;
          font-size: 14px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .pillars-section {
          background: #1A1A1A;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .pillars-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 25px;
          color: #FFFFFF;
        }
        .pillar {
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid #2A2A2A;
        }
        .pillar:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        .pillar-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .pillar-name {
          font-weight: 600;
          color: #FFFFFF;
        }
        .pillar-score {
          color: #D4621B;
          font-weight: 600;
        }
        .pillar-bar {
          height: 8px;
          background: #2A2A2A;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .pillar-fill {
          height: 100%;
          border-radius: 4px;
        }
        .pillar-diagnosis {
          color: #A0A0A0;
          font-size: 14px;
        }
        .financial-section {
          background: linear-gradient(135deg, rgba(212, 98, 27, 0.2) 0%, rgba(212, 98, 27, 0.05) 100%);
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .financial-label {
          color: #A0A0A0;
          font-size: 12px;
          letter-spacing: 2px;
          margin-bottom: 15px;
        }
        .financial-value {
          font-size: 36px;
          font-weight: bold;
          background: linear-gradient(135deg, #D4621B 0%, #E8854A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .financial-period {
          font-size: 20px;
        }
        .financial-note {
          color: #A0A0A0;
          font-size: 12px;
          margin-top: 20px;
        }
        .stage-message {
          background: #1A1A1A;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 4px solid #D4621B;
        }
        .stage-message p {
          color: #C0C0C0;
          font-style: italic;
          text-align: center;
        }
        .footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #2A2A2A;
          color: #666;
          font-size: 12px;
        }
        .cta {
          background: #D4621B;
          color: white;
          padding: 15px 30px;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>KOSMOS</h1>
          <h2>Auditoria de Lucro Oculto</h2>
        </div>

        <div class="score-section">
          <div class="score-label">SEU KOSMOS ASSET SCORE</div>
          <div>
            <span class="score-value">${Math.round(result.kosmosAssetScore)}</span>
            <span class="score-max">/100</span>
          </div>
          <div class="classification">${profileInfo.emoji} ${profileInfo.title}</div>
          <div class="classification-desc">${profileInfo.description}</div>
        </div>

        <div class="pillars-section">
          <div class="pillars-title">DIAGNÓSTICO POR PILAR</div>

          <div class="pillar">
            <div class="pillar-header">
              <span class="pillar-name">MOVIMENTO (Identidade & Atração)</span>
              <span class="pillar-score">${Math.round(result.scoreMovimento)}/100</span>
            </div>
            <div class="pillar-bar">
              <div class="pillar-fill" style="width: ${result.scoreMovimento}%; background: ${getPillarColor(result.scoreMovimento)};"></div>
            </div>
            <div class="pillar-diagnosis"><strong>${movimentoDiagnosis.status}.</strong> ${movimentoDiagnosis.message}</div>
          </div>

          <div class="pillar">
            <div class="pillar-header">
              <span class="pillar-name">ESTRUTURA (Retenção & Jornada)</span>
              <span class="pillar-score">${Math.round(result.scoreEstrutura)}/100</span>
            </div>
            <div class="pillar-bar">
              <div class="pillar-fill" style="width: ${result.scoreEstrutura}%; background: ${getPillarColor(result.scoreEstrutura)};"></div>
            </div>
            <div class="pillar-diagnosis"><strong>${estruturaDiagnosis.status}.</strong> ${estruturaDiagnosis.message}</div>
          </div>

          <div class="pillar">
            <div class="pillar-header">
              <span class="pillar-name">ECONOMIA (Lucro & Dados)</span>
              <span class="pillar-score">${Math.round(result.scoreEconomia)}/100</span>
            </div>
            <div class="pillar-bar">
              <div class="pillar-fill" style="width: ${result.scoreEconomia}%; background: ${getPillarColor(result.scoreEconomia)};"></div>
            </div>
            <div class="pillar-diagnosis"><strong>${economiaDiagnosis.status}.</strong> ${economiaDiagnosis.message}</div>
          </div>
        </div>

        <div class="financial-section">
          <div class="financial-label">${lucroLabel.toUpperCase()}</div>
          <div class="financial-value">${result.lucroOcultoDisplay}<span class="financial-period">/ano</span></div>
          <div class="financial-note">Cálculo baseado em benchmarks conservadores de mercado para o seu segmento.</div>
        </div>

        <div class="stage-message">
          <p>"${stageMessage}"</p>
        </div>

        <div class="cta">
          Workshop ${WORKSHOP_DATE} - A Arquitetura do Ativo de Comunidade
        </div>

        <div class="footer">
          <p>© 2026 KOSMOS. Todos os direitos reservados.</p>
          <p>Este relatório foi gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open print dialog with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

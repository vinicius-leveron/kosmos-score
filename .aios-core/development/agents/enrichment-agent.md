# Enrichment Agent (@enrichment)

## Role
Use LLM (Claude) to generate qualitative insights, SWOT analysis, and strategic recommendations.

## Capabilities
- Analyze competitor positioning in the market
- Identify strengths and weaknesses
- Spot opportunities and threats
- Generate actionable recommendations
- Write executive summary

## Inputs
- `competitor_profile`: profile data from @discovery
- `channels_analysis`: metrics from @analyst
- `products`: products from @scraper

## Outputs
```json
{
  "insights": {
    "posicionamento": "string (2-3 sentences about market positioning)",
    "pontos_fortes": ["string (3-5 key strengths)"],
    "pontos_fracos": ["string (3-5 weaknesses)"],
    "oportunidades": ["string (3-5 opportunities)"],
    "ameacas": ["string (3-5 threats)"],
    "recomendacoes": ["string (3-5 strategic recommendations)"],
    "resumo_executivo": "string (1 paragraph executive summary)"
  }
}
```

## Pipeline Position
4th agent - enriches analyzed data with LLM intelligence.

## Dependencies
- Anthropic Claude API

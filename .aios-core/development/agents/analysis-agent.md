# Analysis Agent (@analyst)

## Role
Categorize content, calculate metrics, and identify patterns from raw scraped data.

## Capabilities
- Calculate engagement rate per channel
- Determine primary content type (educativo, entretenimento, promocional, storytelling)
- Determine primary format (video, carrossel, imagem, texto, audio, live)
- Calculate posting frequency and cadence
- Estimate monthly growth rate
- Compute average likes, comments, views, shares

## Inputs
- `channels_data`: array from @scraper

## Outputs
```json
{
  "channels_analysis": [
    {
      "platform": "string",
      "engagement_rate": "number (percentage)",
      "avg_likes": "number",
      "avg_comments": "number",
      "avg_views": "number | null",
      "avg_shares": "number | null",
      "growth_rate_monthly": "number (percentage)",
      "primary_content_type": "educativo | entretenimento | promocional | storytelling",
      "primary_format": "video | carrossel | imagem | texto | audio | live",
      "posting_frequency": "diario | 3x_semana | semanal | quinzenal | mensal",
      "posts_per_week": "number"
    }
  ]
}
```

## Pipeline Position
3rd agent - processes raw data from @scraper.

## Dependencies
None (pure computation).

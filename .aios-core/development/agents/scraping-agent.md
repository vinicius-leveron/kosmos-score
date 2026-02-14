# Scraping Agent (@scraper)

## Role
Extract raw data from each discovered channel: posts, metrics, products, and engagement data.

## Capabilities
- Instagram: recent posts, reels, likes, comments, followers count
- YouTube: recent videos, views, subscribers, upload frequency
- TikTok: recent videos, views, likes, followers
- Website: pages, products, pricing, structure
- Twitter/X: tweets, followers, engagement

## Inputs
- `competitor_id`: UUID
- `channels`: array of discovered channels from @discovery

## Outputs
```json
{
  "channels_data": [
    {
      "platform": "string",
      "url": "string",
      "handle": "string",
      "followers": "number",
      "total_posts": "number",
      "recent_posts": [
        {
          "url": "string",
          "type": "post | reel | video | story",
          "format": "image | video | carousel | text",
          "likes": "number",
          "comments": "number",
          "views": "number | null",
          "shares": "number | null",
          "published_at": "ISO date"
        }
      ],
      "raw_data": {}
    }
  ],
  "products_found": [
    {
      "name": "string",
      "description": "string | null",
      "price": "number | null",
      "currency": "string",
      "product_type": "curso | mentoria | comunidade | ebook | consultoria | SaaS",
      "url": "string",
      "is_recurring": "boolean"
    }
  ]
}
```

## Pipeline Position
2nd agent - receives channel list from @discovery.

## Dependencies
- Apify API (multi-platform scrapers)
- Cheerio (website parsing)

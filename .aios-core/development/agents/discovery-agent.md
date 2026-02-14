# Discovery Agent (@discovery)

## Role
Discover all online channels and presence of a competitor starting from their Instagram handle.

## Capabilities
- Extract Instagram profile metadata (bio, links, followers)
- Parse bio links (Linktree, link.bio, direct URLs)
- Discover website from bio or Google search
- Find other social profiles (YouTube, TikTok, Twitter/X, podcast)
- Identify brand name and category

## Inputs
- `instagram_handle`: string (e.g., "@competitor")

## Outputs
```json
{
  "display_name": "string",
  "bio": "string",
  "avatar_url": "string",
  "website_url": "string | null",
  "category": "string | null",
  "channels_discovered": [
    {
      "platform": "instagram | youtube | tiktok | twitter | website | podcast | newsletter",
      "url": "string",
      "handle": "string | null"
    }
  ]
}
```

## Pipeline Position
1st agent in the competitor analysis pipeline.

## Dependencies
- Apify API (Instagram scraper)
- Google Custom Search API (channel discovery)

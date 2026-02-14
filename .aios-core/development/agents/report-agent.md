# Report Agent (@report)

## Role
Compile all pipeline results and persist them to the database, marking the analysis as complete.

## Capabilities
- Structure data for database storage
- Update competitor_profiles with discovered data
- Create/update competitor_channels records
- Create competitor_products records
- Store LLM insights in competitor_analysis_runs
- Update analysis run status and progress

## Inputs
- `competitor_id`: UUID
- `run_id`: UUID
- `discovery_result`: from @discovery
- `scraping_result`: from @scraper
- `analysis_result`: from @analyst
- `enrichment_result`: from @enrichment

## Outputs
- Database records updated
- Analysis run marked as "completed"
- `competitor_profiles.total_channels` and `total_products` updated

## Pipeline Position
5th (final) agent - persists everything to the database.

## Dependencies
- Supabase client (database access)

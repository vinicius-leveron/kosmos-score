-- Add missing columns to pipelines table
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE pipelines ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pipelines_organization_active ON pipelines(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pipelines_position ON pipelines(position);

-- Ensure organization_id is required
ALTER TABLE pipelines ALTER COLUMN organization_id SET NOT NULL;

-- Update existing pipelines to have positions
UPDATE pipelines 
SET position = (
  SELECT COUNT(*) 
  FROM pipelines p2 
  WHERE p2.organization_id = pipelines.organization_id 
  AND p2.created_at < pipelines.created_at
)
WHERE position IS NULL OR position = 0;
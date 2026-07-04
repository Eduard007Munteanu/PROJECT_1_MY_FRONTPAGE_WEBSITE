ALTER TABLE IF EXISTS link
ALTER COLUMN description TYPE TEXT;

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

ALTER TABLE IF EXISTS link
ADD COLUMN IF NOT EXISTS project_summary TEXT;

UPDATE link
SET project_summary = description
WHERE project_summary IS NULL OR BTRIM(project_summary) = '';

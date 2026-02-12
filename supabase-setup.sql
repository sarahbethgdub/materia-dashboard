-- Run this in your Supabase SQL Editor (one time)
-- It creates the single table that stores your dashboard state.

CREATE TABLE materia_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the initial empty row
INSERT INTO materia_state (id, data) VALUES ('default', '{}');

-- Allow the dashboard to read and write this table
ALTER TABLE materia_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON materia_state
  FOR ALL USING (true) WITH CHECK (true);

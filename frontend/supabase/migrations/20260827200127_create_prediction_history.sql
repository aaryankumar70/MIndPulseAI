/*
# Create prediction_history table for MindPulse

1. New Tables
- `prediction_history`
  - `id` (uuid, primary key)
  - `age` (int, student age 10-100)
  - `gender` (text, Male/Female)
  - `country` (text, student country)
  - `academic_level` (text, High School/Undergraduate/Graduate)
  - `most_used_platform` (text, social platform)
  - `purpose_of_use` (text, Networking/Education/Entertainment/News)
  - `avg_daily_usage_hours` (float, 0-24)
  - `daily_unlocks` (int, phone unlocks per day)
  - `study_hours` (float, 0-24)
  - `physical_activity_hours` (float, 0-24)
  - `sleep_hours_per_night` (float, 0-24)
  - `stress_level` (text, Low/Medium/High/Very High)
  - `predicted_score` (float, 0-10 mental health score)
  - `created_at` (timestamptz, when prediction was made)

2. Security
- Enable RLS on `prediction_history`.
- Single-tenant app (no sign-in): allow anon + authenticated full CRUD since all data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS prediction_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age int NOT NULL,
  gender text NOT NULL,
  country text NOT NULL,
  academic_level text NOT NULL,
  most_used_platform text NOT NULL,
  purpose_of_use text NOT NULL,
  avg_daily_usage_hours float NOT NULL,
  daily_unlocks int NOT NULL,
  study_hours float NOT NULL,
  physical_activity_hours float NOT NULL,
  sleep_hours_per_night float NOT NULL,
  stress_level text NOT NULL,
  predicted_score float NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_history" ON prediction_history;
CREATE POLICY "anon_select_history" ON prediction_history FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_history" ON prediction_history;
CREATE POLICY "anon_insert_history" ON prediction_history FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_history" ON prediction_history;
CREATE POLICY "anon_delete_history" ON prediction_history FOR DELETE
TO anon, authenticated USING (true);
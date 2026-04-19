-- Migrate start_date and due_date from DATE to TIMESTAMPTZ
-- so tasks can be scheduled to a specific time, not just a day.
-- Existing DATE values are cast to midnight UTC (harmless for new installs).

ALTER TABLE tasks
  ALTER COLUMN start_date TYPE TIMESTAMPTZ USING start_date::TIMESTAMPTZ,
  ALTER COLUMN due_date   TYPE TIMESTAMPTZ USING due_date::TIMESTAMPTZ;

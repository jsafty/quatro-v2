-- Handles two cases:
-- 1. start_date/due_date are still DATE type → convert to TIMESTAMPTZ at 8am Denver
-- 2. Already TIMESTAMPTZ but stored as midnight UTC → shift to 8am Denver

DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'tasks' AND column_name = 'start_date';

  IF col_type = 'date' THEN
    ALTER TABLE tasks
      ALTER COLUMN start_date TYPE TIMESTAMPTZ
      USING (start_date::timestamp + INTERVAL '8 hours') AT TIME ZONE 'America/Denver';
    ALTER TABLE tasks
      ALTER COLUMN due_date TYPE TIMESTAMPTZ
      USING (due_date::timestamp + INTERVAL '8 hours') AT TIME ZONE 'America/Denver';
  ELSE
    UPDATE tasks
    SET start_date = (start_date::date::timestamp + INTERVAL '8 hours') AT TIME ZONE 'America/Denver'
    WHERE start_date IS NOT NULL
      AND start_date::time = '00:00:00';

    UPDATE tasks
    SET due_date = (due_date::date::timestamp + INTERVAL '8 hours') AT TIME ZONE 'America/Denver'
    WHERE due_date IS NOT NULL
      AND due_date::time = '00:00:00';
  END IF;
END $$;

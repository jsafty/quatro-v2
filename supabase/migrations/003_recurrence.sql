-- Add recurrence support to tasks.
-- Valid values mirror the UI options; NULL means no recurrence.

ALTER TABLE tasks
  ADD COLUMN recurrence TEXT
  CHECK (recurrence IN ('daily', 'weekday', 'weekly', 'biweekly', 'monthly'));

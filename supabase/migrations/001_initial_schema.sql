-- ============================================================
-- Quatro v2 — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  impact          SMALLINT CHECK (impact BETWEEN 1 AND 5),
  effort          SMALLINT CHECK (effort BETWEEN 1 AND 5),
  start_date      DATE,
  due_date        DATE,
  blocked_by      UUID REFERENCES tasks(id) ON DELETE SET NULL,
  completed_at    TIMESTAMPTZ,
  manual_priority INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX tasks_user_id_idx        ON tasks (user_id);
CREATE INDEX tasks_completed_at_idx   ON tasks (user_id, completed_at);
CREATE INDEX tasks_start_date_idx     ON tasks (user_id, start_date);
CREATE INDEX tasks_manual_priority_idx ON tasks (user_id, manual_priority ASC NULLS LAST);
CREATE INDEX tags_user_id_idx         ON tags (user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Tasks: full access to own rows only
CREATE POLICY "tasks: select own" ON tasks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tasks: insert own" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks: update own" ON tasks
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks: delete own" ON tasks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Tags: full access to own rows only
CREATE POLICY "tags: select own" ON tags
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tags: insert own" ON tags
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tags: update own" ON tags
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tags: delete own" ON tags
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Task tags: access controlled via task ownership
CREATE POLICY "task_tags: select own" ON task_tags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "task_tags: insert own" ON task_tags
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "task_tags: delete own" ON task_tags
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
        AND tasks.user_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME
-- Enables live task updates across browser tabs
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

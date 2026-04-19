"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { sortTasks } from "@/lib/priority";
import { computeNextOccurrence } from "@/lib/recurrence";
import type { Task } from "@/types/task";
import type { Tag } from "@/types/tag";

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  blockedBy?: string | null;
  recurrence?: string | null;
  tagIds?: string[];
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  blockedBy?: string | null;
  manualPriority?: number | null;
  recurrence?: string | null;
};

type TaskContextValue = {
  tasks: Task[];
  loading: boolean;
  top4: Task[];
  backlog: Task[];
  scheduledTasks: Task[];
  blockedTasks: Task[];
  completedTasks: Task[];
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
  addTagToTask: (taskId: string, tagId: string) => Promise<void>;
  removeTagFromTask: (taskId: string, tagId: string) => Promise<void>;
};

function mapRow(row: Record<string, unknown>): Task {
  const tagRows = (row.task_tags as Array<{ tags: Record<string, unknown> }>) ?? [];
  const tags: Tag[] = tagRows
    .filter((tt) => tt.tags)
    .map((tt) => ({
      id: tt.tags.id as string,
      userId: tt.tags.user_id as string,
      name: tt.tags.name as string,
      color: tt.tags.color as string,
      createdAt: tt.tags.created_at as string,
    }));

  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    impact: (row.impact as number | null) ?? null,
    effort: (row.effort as number | null) ?? null,
    startDate: (row.start_date as string | null) ?? null,
    dueDate: (row.due_date as string | null) ?? null,
    blockedBy: (row.blocked_by as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    manualPriority: (row.manual_priority as number | null) ?? null,
    recurrence: (row.recurrence as string | null) ?? null,
    createdAt: row.created_at as string,
    tags,
  };
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("fetchTasks: not authenticated", authError);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("*, task_tags(tags(*))")
      .eq("user_id", user.id)
      .order("manual_priority", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("fetchTasks: query failed", fetchError);
    } else if (data) {
      setTasks(data.map(mapRow));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        fetchTasks
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, supabase]);

  // Section filtering
  const isScheduled = (t: Task) =>
    !!t.startDate && new Date(t.startDate) > new Date();

  const isBlocked = (t: Task) => {
    if (!t.blockedBy) return false;
    const blocker = tasks.find((b) => b.id === t.blockedBy);
    return !!blocker && !blocker.completedAt;
  };

  const isCompleted = (t: Task) => !!t.completedAt;

  const isActionable = (t: Task) =>
    !isScheduled(t) && !isBlocked(t) && !isCompleted(t);

  const actionable = sortTasks(tasks.filter(isActionable));
  const top4 = actionable.slice(0, 4);
  const backlog = actionable.slice(4);
  const scheduledTasks = tasks.filter(isScheduled);
  const blockedTasks = tasks.filter((t) => !isCompleted(t) && isBlocked(t));
  const completedTasks = [...tasks.filter(isCompleted)].sort(
    (a, b) =>
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );

  // CRUD
  async function createTask(input: CreateTaskInput) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("createTask: not authenticated", authError);
      return;
    }

    const newId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("tasks").insert({
      id: newId,
      user_id: user.id,
      title: input.title,
      description: input.description ?? null,
      start_date: input.startDate ?? null,
      due_date: input.dueDate ?? null,
      blocked_by: input.blockedBy ?? null,
      recurrence: input.recurrence ?? null,
      completed_at: null,
      manual_priority: null,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("createTask: insert failed", insertError);
      toast.error("Failed to add task.");
      return;
    }

    if (input.tagIds && input.tagIds.length > 0) {
      await supabase.from("task_tags").insert(
        input.tagIds.map((tagId) => ({ task_id: newId, tag_id: tagId }))
      );
    }

    await fetchTasks();
    toast.success("Task added.");
  }

  async function updateTask(id: string, input: UpdateTaskInput) {
    const update: Record<string, unknown> = {};

    if ("title" in input) update.title = input.title;
    if ("description" in input) update.description = input.description ?? null;
    if ("startDate" in input) update.start_date = input.startDate ?? null;
    if ("dueDate" in input) update.due_date = input.dueDate ?? null;
    if ("blockedBy" in input) update.blocked_by = input.blockedBy ?? null;
    if ("manualPriority" in input) update.manual_priority = input.manualPriority ?? null;
    if ("recurrence" in input) update.recurrence = input.recurrence ?? null;

    const { error } = await supabase.from("tasks").update(update).eq("id", id);
    if (error) {
      toast.error("Failed to save changes.");
    } else {
      toast.success("Task updated.");
    }
    await fetchTasks();
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete task.");
    } else {
      toast.success("Task deleted.");
    }
    await fetchTasks();
  }

  async function completeTask(id: string) {
    const task = tasks.find((t) => t.id === id);

    const { error } = await supabase
      .from("tasks")
      .update({ completed_at: new Date().toISOString(), manual_priority: null })
      .eq("id", id);
    if (error) {
      toast.error("Failed to complete task.");
      await fetchTasks();
      return;
    }

    // Spawn next occurrence for recurring tasks
    if (task?.recurrence && task.startDate) {
      const nextStart = computeNextOccurrence(task.startDate, task.recurrence);
      const newId = crypto.randomUUID();

      await supabase.from("tasks").insert({
        id: newId,
        user_id: task.userId,
        title: task.title,
        description: task.description ?? null,
        start_date: nextStart,
        due_date: null,
        blocked_by: null,
        recurrence: task.recurrence,
        completed_at: null,
        manual_priority: null,
        created_at: new Date().toISOString(),
      });

      // Copy tags to new instance
      if (task.tags.length > 0) {
        await supabase.from("task_tags").insert(
          task.tags.map((tag) => ({ task_id: newId, tag_id: tag.id }))
        );
      }
    }

    await fetchTasks();
  }

  async function uncompleteTask(id: string) {
    const { error } = await supabase
      .from("tasks")
      .update({ completed_at: null })
      .eq("id", id);
    if (error) toast.error("Failed to reopen task.");
    await fetchTasks();
  }

  async function reorderTasks(orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from("tasks")
          .update({ manual_priority: index + 1 })
          .eq("id", id)
      )
    );
    await fetchTasks();
  }

  async function addTagToTask(taskId: string, tagId: string) {
    await supabase.from("task_tags").insert({ task_id: taskId, tag_id: tagId });
    await fetchTasks();
  }

  async function removeTagFromTask(taskId: string, tagId: string) {
    await supabase
      .from("task_tags")
      .delete()
      .eq("task_id", taskId)
      .eq("tag_id", tagId);
    await fetchTasks();
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        top4,
        backlog,
        scheduledTasks,
        blockedTasks,
        completedTasks,
        createTask,
        updateTask,
        deleteTask,
        completeTask,
        uncompleteTask,
        reorderTasks,
        addTagToTask,
        removeTagFromTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within a TaskProvider");
  return ctx;
}

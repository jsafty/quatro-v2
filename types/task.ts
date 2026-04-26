import type { Tag } from "./tag";
import type { Subtask } from "./subtask";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  impact: number | null;
  effort: number | null;
  startDate: string | null;
  dueDate: string | null;
  blockedBy: string | null;
  completedAt: string | null;
  manualPriority: number | null;
  recurrence: string | null;
  createdAt: string;
  tags: Tag[];
  subtasks: Subtask[];
}

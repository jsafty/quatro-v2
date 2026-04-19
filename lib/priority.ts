import type { Task } from "@/types/task";

export function computePriority(task: Task): number {
  let urgency = 0.3;

  if (task.dueDate) {
    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    urgency = daysUntilDue < 0 ? 1.2 : Math.max(0, 1 - daysUntilDue / 30);
  }

  const impact = task.impact ?? 3;
  const effort = task.effort ?? 3;
  const ratio = impact / effort;

  return urgency * 0.7 + (ratio / 5) * 0.3;
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.manualPriority !== null && b.manualPriority !== null) {
      return a.manualPriority - b.manualPriority;
    }
    if (a.manualPriority !== null) return -1;
    if (b.manualPriority !== null) return 1;
    const diff = computePriority(b) - computePriority(a);
    if (diff !== 0) return diff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

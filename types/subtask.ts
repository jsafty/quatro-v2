export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completedAt: string | null;
  position: number;
  createdAt: string;
}

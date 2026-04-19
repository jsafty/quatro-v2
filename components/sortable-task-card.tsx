"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/components/task-card";
import type { Task } from "@/types/task";

interface SortableTaskCardProps {
  task: Task;
  rank?: number;
  completed?: boolean;
  startLabel?: string;
  blockerTitle?: string;
}

export function SortableTaskCard({ task, ...props }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} {...props} />
    </div>
  );
}

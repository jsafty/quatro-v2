"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, GripVertical } from "lucide-react";
import { useTasks } from "@/context/task-context";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import type { Task } from "@/types/task";

function rankBorderColor(rank?: number): string {
  if (!rank || rank > 4) return "var(--muted-foreground)";
  if (rank === 1) return "var(--primary)";
  if (rank <= 3) return "var(--quatro-blue)";
  return "var(--quatro-sky)";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T00:00:00") < today;
}

interface TaskCardProps {
  task: Task;
  rank?: number;
  completed?: boolean;
  startLabel?: string;
  blockerTitle?: string;
}

export function TaskCard({
  task,
  rank,
  completed = false,
  startLabel,
  blockerTitle,
}: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const { completeTask, uncompleteTask } = useTasks();

  function handleCompleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    completed ? uncompleteTask(task.id) : completeTask(task.id);
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={() => setEditOpen(true)}
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 p-4 flex gap-3 cursor-pointer"
        style={{ borderLeftColor: rankBorderColor(rank) }}
      >
        {/* Drag handle — wired up in drag-and-drop phase */}
        <GripVertical
          size={16}
          className="shrink-0 mt-0.5 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Complete / uncomplete */}
        <button
          onClick={handleCompleteClick}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            completed
              ? "bg-quatro-blue border-quatro-blue text-white"
              : "border-muted-foreground hover:border-quatro-blue hover:bg-quatro-blue/10"
          }`}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          {completed && <Check size={10} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-bold text-base leading-snug ${
              completed ? "line-through text-muted-foreground" : "text-primary"
            }`}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}

          {blockerTitle && (
            <p className="text-xs text-muted-foreground mt-1">
              Waiting on: <span className="font-semibold">{blockerTitle}</span>
            </p>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: tag.color + "33",
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}

            {startLabel && (
              <span className="text-xs font-medium text-quatro-blue">
                Starts {startLabel}
              </span>
            )}

            {task.dueDate && (
              <span
                className={`ml-auto text-xs font-medium ${
                  isOverdue(task.dueDate) ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {isOverdue(task.dueDate) ? "Overdue · " : "Due "}
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <EditTaskDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

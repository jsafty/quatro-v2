"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Repeat, Trash2 } from "lucide-react";
import { useTasks } from "@/context/task-context";
import { useCompletion } from "@/context/completion-context";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { DateTimePicker } from "@/components/date-time-picker";
import { SubtaskList } from "@/components/subtask-list";
import type { Task } from "@/types/task";

const RECURRENCE_LABELS: Record<string, string> = {
  daily:    "Daily",
  weekday:  "Weekdays",
  weekly:   "Weekly",
  biweekly: "Every 2 weeks",
  monthly:  "Monthly",
};

function rankBorderColor(rank?: number): string {
  if (!rank || rank > 4) return "var(--muted-foreground)";
  if (rank === 1) return "var(--primary)";
  if (rank <= 3) return "var(--quatro-blue)";
  return "var(--quatro-sky)";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

function linkifyDescription(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="underline hover:opacity-70 transition-opacity break-all"
        style={{ color: "var(--quatro-blue)" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
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
  const { uncompleteTask, updateTask, deleteTask, toggleSubtask, deleteSubtask } = useTasks();
  const { startCompletion } = useCompletion();

  function handleCompleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (completed) { uncompleteTask(task.id); return; }
    startCompletion(task.id);
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
        className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 p-4 flex gap-3 cursor-pointer w-full min-w-0 overflow-hidden box-border"
        style={{ borderLeftColor: rankBorderColor(rank) }}
      >
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
          {completed && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Hover actions — desktop only */}
        <div
          className="absolute top-2 right-2 hidden md:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DateTimePicker
            iconOnly
            value={task.startDate}
            onChange={(v) => updateTask(task.id, { startDate: v })}
          />
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-normal text-base leading-snug break-words min-w-0 ${
              completed ? "line-through text-muted-foreground" : "text-primary"
            }`}
          >
            {task.title}
          </p>

          {task.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {linkifyDescription(task.description)}
            </p>
          )}

          {blockerTitle && (
            <p className="text-xs text-muted-foreground mt-1">
              Waiting on: <span className="font-semibold">{blockerTitle}</span>
            </p>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                {task.subtasks.filter((s) => s.completedAt).length}/{task.subtasks.length} subtasks
              </p>
              <SubtaskList
                subtasks={task.subtasks}
                onToggle={toggleSubtask}
                onDelete={deleteSubtask}
                maxVisible={5}
              />
            </div>
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

            {task.recurrence && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Repeat size={11} />
                {RECURRENCE_LABELS[task.recurrence] ?? task.recurrence}
              </span>
            )}

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

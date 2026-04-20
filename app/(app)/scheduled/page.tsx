"use client";

import { AnimatePresence } from "framer-motion";
import { useTasks } from "@/context/task-context";
import { useTags } from "@/context/tag-context";
import { TaskCard } from "@/components/task-card";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TagFilterBar } from "@/components/tag-filter-bar";
import { MobileFilterTrigger, MobileFilterPills } from "@/components/mobile-filter-sheet";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}

export default function ScheduledPage() {
  const { scheduledTasks, loading } = useTasks();
  const { selectedTagIds } = useTags();

  const sorted = [...scheduledTasks].sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const tasks = selectedTagIds.length === 0
    ? sorted
    : sorted.filter((t) => t.tags.some((tag) => selectedTagIds.includes(tag.id)));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight" style={{ letterSpacing: "-0.025em" }}>
              Scheduled
            </h1>
            <MobileFilterTrigger />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tasks with a future start date.
          </p>
        </div>
        <AddTaskDialog />
      </div>

      <MobileFilterPills />
      <TagFilterBar />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                startLabel={task.startDate ? formatDate(task.startDate) : undefined}
              />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-primary">
                {selectedTagIds.length > 0 ? "No tasks match this filter." : "No tasks on the horizon."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedTagIds.length > 0 ? "Try selecting a different tag." : "Add a task with a future start date to schedule it."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

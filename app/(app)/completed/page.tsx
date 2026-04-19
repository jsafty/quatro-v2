"use client";

import { AnimatePresence } from "framer-motion";
import { useTasks } from "@/context/task-context";
import { useTags } from "@/context/tag-context";
import { TaskCard } from "@/components/task-card";
import { TagFilterBar } from "@/components/tag-filter-bar";

export default function CompletedPage() {
  const { completedTasks, loading } = useTasks();
  const { selectedTagIds } = useTags();

  const tasks = selectedTagIds.length === 0
    ? completedTasks
    : completedTasks.filter((t) => t.tags.some((tag) => selectedTagIds.includes(tag.id)));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Completed
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tasks you&apos;ve finished.
        </p>
      </div>

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
              <TaskCard key={task.id} task={task} completed />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl font-bold text-primary">
                {selectedTagIds.length > 0 ? "No tasks match this filter." : "Nothing done yet — but that's okay."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedTagIds.length > 0 ? "Try selecting a different tag." : "Completed tasks will appear here."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTasks } from "@/context/task-context";
import { useTags } from "@/context/tag-context";
import { SortableTaskCard } from "@/components/sortable-task-card";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TagFilterBar } from "@/components/tag-filter-bar";

export default function TasksPage() {
  const { top4, backlog, loading, reorderTasks } = useTasks();
  const { selectedTagIds } = useTags();
  const [backlogOpen, setBacklogOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Full ordered list — used by dnd-kit for correct index calculations
  const allActionable = [...top4, ...backlog];
  const allIds = allActionable.map((t) => t.id);

  // Apply tag filter then re-split into Top 4 / Backlog
  const filteredActionable =
    selectedTagIds.length === 0
      ? allActionable
      : allActionable.filter((t) => t.tags.some((tag) => selectedTagIds.includes(tag.id)));

  const filteredTop4 = filteredActionable.slice(0, 4);
  const filteredBacklog = filteredActionable.slice(4);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allIds.indexOf(active.id as string);
    const newIndex = allIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    reorderTasks(arrayMove(allIds, oldIndex, newIndex));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-extrabold text-primary tracking-tight"
            style={{ letterSpacing: "-0.025em" }}
          >
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your top 4 priorities and everything else.
          </p>
        </div>
        <AddTaskDialog />
      </div>

      <TagFilterBar />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allIds} strategy={verticalListSortingStrategy}>

            {/* ── Top 4 section ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Top 4
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredTop4.map((task, i) => (
                    <SortableTaskCard key={task.id} task={task} rank={i + 1} />
                  ))}
                </AnimatePresence>

                {filteredTop4.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-lg font-bold text-primary">
                      {selectedTagIds.length > 0
                        ? "No matching tasks."
                        : "You're all caught up."}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTagIds.length > 0
                        ? "Try a different filter."
                        : "Add a task to get started."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ── Backlog section ── */}
            {allActionable.length > 4 && (
              <section className="mt-8">
                <button
                  onClick={() => setBacklogOpen((o) => !o)}
                  className="flex items-center gap-2 mb-3 w-full group"
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                    Backlog
                  </h2>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                    {backlog.length}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  {backlogOpen ? (
                    <ChevronUp
                      size={14}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  ) : (
                    <ChevronDown
                      size={14}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {backlogOpen && (
                    <motion.div
                      key="backlog-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pb-1">
                        <AnimatePresence initial={false}>
                          {filteredBacklog.map((task, i) => (
                            <SortableTaskCard
                              key={task.id}
                              task={task}
                              rank={top4.length + i + 1}
                            />
                          ))}
                        </AnimatePresence>

                        {filteredBacklog.length === 0 && selectedTagIds.length > 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No backlog tasks match this filter.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

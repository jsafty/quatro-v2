"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/context/task-context";

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [blockedBy, setBlockedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { createTask, tasks } = useTasks();
  const incompleteTasks = tasks.filter((t) => !t.completedAt);

  function reset() {
    setTitle("");
    setDescription("");
    setStartDate("");
    setDueDate("");
    setBlockedBy("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    await createTask({
      title: title.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      blockedBy: blockedBy || null,
    });
    setOpen(false);
    reset();
    setSubmitting(false);
  }

  const inputClass = "bg-muted border-0 focus-visible:ring-1 focus-visible:ring-quatro-blue rounded-lg text-sm";
  const labelClass = "text-sm font-semibold text-primary";

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger className="inline-flex items-center gap-2 bg-primary hover:bg-quatro-blue text-white font-bold rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer">
        <Plus size={16} />
        Add task
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl font-bold">New task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className={labelClass}>
              Summary <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              required
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc" className={labelClass}>Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional context…"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-start" className={labelClass}>Start date</Label>
              <Input
                id="task-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due" className={labelClass}>Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-blocked" className={labelClass}>Blocked by</Label>
            <select
              id="task-blocked"
              value={blockedBy}
              onChange={(e) => setBlockedBy(e.target.value)}
              className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-quatro-blue"
            >
              <option value="">None</option>
              {incompleteTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-4 py-2 text-sm font-bold bg-primary hover:bg-quatro-blue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

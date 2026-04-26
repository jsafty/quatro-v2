"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "@/components/tag-selector";
import { DateTimePicker } from "@/components/date-time-picker";
import { RecurrencePicker } from "@/components/recurrence-picker";
import { useTasks } from "@/context/task-context";
import { TaskSearchSelect } from "@/components/task-search-select";
import type { Task } from "@/types/task";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [startDate, setStartDate] = useState(task.startDate ?? "");

  const [blockedBy, setBlockedBy] = useState(task.blockedBy ?? "");
  const [recurrence, setRecurrence] = useState(task.recurrence ?? "");
  const [submitting, setSubmitting] = useState(false);

  const { updateTask, deleteTask, addTagToTask, removeTagFromTask, tasks } = useTasks();

  const incompleteTasks = tasks.filter((t) => !t.completedAt && t.id !== task.id);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStartDate(task.startDate ?? "");

      setBlockedBy(task.blockedBy ?? "");
      setRecurrence(task.recurrence ?? "");
    }
  }, [open, task]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      dueDate: null,
      blockedBy: blockedBy || null,
      recurrence: recurrence || null,
    });
    onOpenChange(false);
    setSubmitting(false);
  }

  async function handleDelete() {
    await deleteTask(task.id);
    onOpenChange(false);
  }

  const inputClass =
    "bg-muted border-0 focus-visible:ring-1 focus-visible:ring-quatro-blue rounded-lg text-sm";
  const labelClass = "text-sm font-semibold text-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-auto sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto box-border">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl font-bold">
            Edit task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className={labelClass}>
              Summary <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5 min-w-0 overflow-hidden">
            <Label htmlFor="edit-desc" className={labelClass}>Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional context…"
              rows={2}
              className={`${inputClass} resize-none w-full max-w-full break-all whitespace-pre-wrap box-border`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Start date</Label>
            <DateTimePicker
              value={startDate || null}
              onChange={(v) => { setStartDate(v ?? ""); if (!v) setRecurrence(""); }}
              placeholder="Not scheduled"
            />
            {startDate && (
              <select
                value={new Date(startDate).getHours()}
                onChange={(e) => {
                  const d = new Date(startDate);
                  d.setHours(Number(e.target.value), 0, 0, 0);
                  setStartDate(d.toISOString());
                }}
                className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-quatro-blue"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
                  const ampm = i < 12 ? "AM" : "PM";
                  return <option key={i} value={i}>{h12}:00 {ampm}</option>;
                })}
              </select>
            )}
            <RecurrencePicker
              value={recurrence}
              onChange={setRecurrence}
              disabled={!startDate}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-blocked" className={labelClass}>Blocked by</Label>
            <TaskSearchSelect
              id="edit-blocked"
              tasks={incompleteTasks}
              value={blockedBy}
              onChange={setBlockedBy}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Tags</Label>
            <TagSelector
              task={task}
              onAdd={(tagId) => addTagToTask(task.id, tagId)}
              onRemove={(tagId) => removeTagFromTask(task.id, tagId)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              Delete task
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="px-4 py-2 text-sm font-bold bg-primary hover:bg-quatro-blue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

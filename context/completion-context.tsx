"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useTasks } from "@/context/task-context";

type Phase =
  | { type: "idle" }
  | { type: "pending"; taskId: string }
  | { type: "undoing"; taskId: string };

type CompletionContextValue = {
  phase: Phase;
  startCompletion: (taskId: string) => void;
  undo: () => void;
};

const CompletionContext = createContext<CompletionContextValue | null>(null);

const TOAST_MS = 4000;
const UNDO_ANIM_MS = 500;

export function CompletionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>({ type: "idle" });
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIdRef = useRef<string | null>(null);

  const { completeTask } = useTasks();
  // Keep a stable ref so timeout closures always call the latest completeTask
  const completeTaskRef = useRef(completeTask);
  useEffect(() => { completeTaskRef.current = completeTask; }, [completeTask]);

  const clearTimers = useCallback(() => {
    if (commitTimerRef.current) { clearTimeout(commitTimerRef.current); commitTimerRef.current = null; }
    if (undoTimerRef.current)   { clearTimeout(undoTimerRef.current);   undoTimerRef.current = null; }
  }, []);

  const startCompletion = useCallback((taskId: string) => {
    // Commit any in-flight task immediately before starting a new one
    if (pendingIdRef.current && pendingIdRef.current !== taskId) {
      clearTimers();
      completeTaskRef.current(pendingIdRef.current);
    }
    clearTimers();
    pendingIdRef.current = taskId;
    setPhase({ type: "pending", taskId });

    commitTimerRef.current = setTimeout(() => {
      const id = pendingIdRef.current;
      if (!id) return;
      pendingIdRef.current = null;
      setPhase({ type: "idle" });
      completeTaskRef.current(id);
    }, TOAST_MS);
  }, [clearTimers]);

  const undo = useCallback(() => {
    const taskId = pendingIdRef.current;
    if (!taskId) return;
    clearTimers();
    pendingIdRef.current = null;
    setPhase({ type: "undoing", taskId });
    undoTimerRef.current = setTimeout(() => setPhase({ type: "idle" }), UNDO_ANIM_MS);
  }, [clearTimers]);

  return (
    <CompletionContext.Provider value={{ phase, startCompletion, undo }}>
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletion() {
  const ctx = useContext(CompletionContext);
  if (!ctx) throw new Error("useCompletion must be used within CompletionProvider");
  return ctx;
}

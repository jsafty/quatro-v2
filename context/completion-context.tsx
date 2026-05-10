"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasks } from "@/context/task-context";
import { triggerMilestoneFirework, triggerMilestoneOverlay } from "@/lib/milestone-animations";

type Phase =
  | { type: "idle" }
  | { type: "pending"; taskId: string };

type CompletionContextValue = {
  phase: Phase;
  completingTaskId: string | null;
  startCompletion: (taskId: string) => void;
  undo: () => void;
};

const CompletionContext = createContext<CompletionContextValue | null>(null);

const TOAST_MS = 3000;

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMilestoneState(): { date: string; lastMilestone: number } {
  const today = getTodayKey();
  try {
    const raw = localStorage.getItem('qMilestoneCelebrated');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) return parsed;
    }
  } catch {}
  return { date: today, lastMilestone: 0 };
}

function saveMilestoneState(state: { date: string; lastMilestone: number }) {
  localStorage.setItem('qMilestoneCelebrated', JSON.stringify(state));
}

export function CompletionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>({ type: "idle" });
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIdRef = useRef<string | null>(null);
  const supabase = createClient();

  const { completeTask } = useTasks();
  const completeTaskRef = useRef(completeTask);
  useEffect(() => { completeTaskRef.current = completeTask; }, [completeTask]);

  const clearTimers = useCallback(() => {
    if (commitTimerRef.current) { clearTimeout(commitTimerRef.current); commitTimerRef.current = null; }
  }, []);

  async function checkMilestone() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', todayStart.toISOString())
      .lt('completed_at', tomorrowStart.toISOString());

    if (!count) return;

    const state = getMilestoneState();

    if (count >= 10 && state.lastMilestone < 10) {
      state.lastMilestone = 10;
      saveMilestoneState(state);
      triggerMilestoneOverlay();
    } else if (count >= 5 && state.lastMilestone < 5) {
      state.lastMilestone = 5;
      saveMilestoneState(state);
      triggerMilestoneFirework(new DOMRect());
    }
  }

  const startCompletion = useCallback((taskId: string) => {
    // If another task was pending, commit it immediately
    if (pendingIdRef.current && pendingIdRef.current !== taskId) {
      clearTimers();
      const prevId = pendingIdRef.current;
      completeTaskRef.current(prevId);
    }
    clearTimers();
    pendingIdRef.current = taskId;
    setCompletingTaskId(taskId);
    setPhase({ type: "pending", taskId });

    commitTimerRef.current = setTimeout(async () => {
      const id = pendingIdRef.current;
      if (!id) return;
      pendingIdRef.current = null;
      setCompletingTaskId(null);
      setPhase({ type: "idle" });
      await completeTaskRef.current(id);
      await checkMilestone();
    }, TOAST_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers]);

  const undo = useCallback(() => {
    if (!pendingIdRef.current) return;
    clearTimers();
    pendingIdRef.current = null;
    setCompletingTaskId(null);
    setPhase({ type: "idle" });
  }, [clearTimers]);

  return (
    <CompletionContext.Provider value={{ phase, completingTaskId, startCompletion, undo }}>
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletion() {
  const ctx = useContext(CompletionContext);
  if (!ctx) throw new Error("useCompletion must be used within CompletionProvider");
  return ctx;
}

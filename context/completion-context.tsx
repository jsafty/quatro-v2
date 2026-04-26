"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTasks } from "@/context/task-context";
import { triggerMilestoneFirework, triggerMilestoneOverlay } from "@/lib/milestone-animations";

type Phase =
  | { type: "idle" }
  | { type: "pending"; taskId: string }
  | { type: "undoing"; taskId: string };

type CompletionContextValue = {
  phase: Phase;
  startCompletion: (taskId: string, cardElement?: HTMLElement | null) => void;
  undo: () => void;
};

const CompletionContext = createContext<CompletionContextValue | null>(null);

const TOAST_MS = 4000;
const UNDO_ANIM_MS = 500;

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
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingIdRef = useRef<string | null>(null);
  const cardRectRef = useRef<DOMRect | null>(null);
  const supabase = createClient();

  const { completeTask } = useTasks();
  const completeTaskRef = useRef(completeTask);
  useEffect(() => { completeTaskRef.current = completeTask; }, [completeTask]);

  const clearTimers = useCallback(() => {
    if (commitTimerRef.current) { clearTimeout(commitTimerRef.current); commitTimerRef.current = null; }
    if (undoTimerRef.current)   { clearTimeout(undoTimerRef.current);   undoTimerRef.current = null; }
  }, []);

  async function checkMilestone(cardRect: DOMRect | null) {
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
      if (cardRect) triggerMilestoneFirework(cardRect);
    }
  }

  const startCompletion = useCallback((taskId: string, cardElement?: HTMLElement | null) => {
    if (pendingIdRef.current && pendingIdRef.current !== taskId) {
      clearTimers();
      completeTaskRef.current(pendingIdRef.current);
    }
    clearTimers();
    pendingIdRef.current = taskId;
    cardRectRef.current = cardElement ? cardElement.getBoundingClientRect() : null;
    setPhase({ type: "pending", taskId });

    commitTimerRef.current = setTimeout(async () => {
      const id = pendingIdRef.current;
      if (!id) return;
      const rect = cardRectRef.current;
      pendingIdRef.current = null;
      cardRectRef.current = null;
      setPhase({ type: "idle" });
      await completeTaskRef.current(id);
      await checkMilestone(rect);
    }, TOAST_MS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers]);

  const undo = useCallback(() => {
    const taskId = pendingIdRef.current;
    if (!taskId) return;
    clearTimers();
    pendingIdRef.current = null;
    cardRectRef.current = null;
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useCompletion } from "@/context/completion-context";

const DURATION = 4000;

export function CompletionToast() {
  const { phase, undo } = useCompletion();
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const visible = phase.type === "pending";

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!visible) { setProgress(100); return; }

    startRef.current = Date.now();
    setProgress(100);

    function tick() {
      const pct = Math.max(0, 100 - ((Date.now() - startRef.current) / DURATION) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-1/2 bottom-20 md:bottom-6 z-[200]"
      style={{ animation: "completionToastIn 0.2s ease forwards" }}
    >
      <div
        className="relative overflow-hidden flex items-center gap-4"
        style={{
          background: "#1E293B",
          borderRadius: "12px",
          padding: "12px 16px",
          minWidth: "280px",
          color: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <span className="flex-1 text-sm font-semibold">Task completed</span>
        <button
          onClick={undo}
          className="text-sm font-bold shrink-0"
          style={{ color: "var(--quatro-sky)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--quatro-sky)")}
        >
          Undo
        </button>
        {/* Depleting progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[3px]"
          style={{
            width: `${progress}%`,
            background: "var(--quatro-blue)",
            borderRadius: "0 0 0 12px",
          }}
        />
      </div>
    </div>
  );
}

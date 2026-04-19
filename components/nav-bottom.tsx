"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTasks } from "@/context/task-context";
import { CheckSquare, Clock, Lock, CheckCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Tasks",     icon: CheckSquare, countKey: "actionable" as const },
  { href: "/scheduled", label: "Scheduled", icon: Clock,       countKey: "scheduled"  as const },
  { href: "/blocked",   label: "Blocked",   icon: Lock,        countKey: "blocked"    as const },
  { href: "/completed", label: "Completed", icon: CheckCircle, countKey: null },
];

export function NavBottom() {
  const pathname = usePathname();
  const { top4, backlog, scheduledTasks, blockedTasks } = useTasks();

  const counts = {
    actionable: top4.length + backlog.length,
    scheduled: scheduledTasks.length,
    blocked: blockedTasks.length,
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary border-t border-white/10 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, countKey }) => {
          const active = pathname === href;
          const count = countKey ? counts[countKey] : null;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors ${
                active ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{label}</span>
              {count != null && count > 0 && (
                <span className="absolute top-1 right-1 text-[9px] font-bold bg-white text-primary rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

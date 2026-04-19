"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTasks } from "@/context/task-context";
import { CheckSquare, Clock, Lock, CheckCircle, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          label: "Tasks",     icon: CheckSquare, countKey: "actionable" as const },
  { href: "/scheduled", label: "Scheduled", icon: Clock,       countKey: "scheduled"  as const },
  { href: "/blocked",   label: "Blocked",   icon: Lock,        countKey: "blocked"    as const },
  { href: "/completed", label: "Completed", icon: CheckCircle, countKey: null },
];

export function NavSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { top4, backlog, scheduledTasks, blockedTasks } = useTasks();

  const counts = {
    actionable: top4.length + backlog.length,
    scheduled: scheduledTasks.length,
    blocked: blockedTasks.length,
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 min-h-screen bg-primary text-white">
      <div className="px-6 py-7 border-b border-white/10">
        <span className="text-xl font-extrabold" style={{ letterSpacing: "-0.025em" }}>
          Quatro
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, countKey }) => {
          const active = pathname === href;
          const count = countKey ? counts[countKey] : null;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? "bg-white text-primary"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {count != null && count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    active ? "bg-primary text-white" : "bg-white/20 text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

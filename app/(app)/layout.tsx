import { NavSidebar } from "@/components/nav-sidebar";
import { NavBottom } from "@/components/nav-bottom";
import { TaskProvider } from "@/context/task-context";
import { TagProvider } from "@/context/tag-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TagProvider>
      <TaskProvider>
        <div className="flex min-h-screen bg-[--background]">
          <NavSidebar />
          <main className="flex-1 min-w-0 w-full overflow-x-hidden px-4 md:px-6 py-8 pb-24 md:pb-8 max-w-2xl">
            {children}
          </main>
          <NavBottom />
        </div>
      </TaskProvider>
    </TagProvider>
  );
}

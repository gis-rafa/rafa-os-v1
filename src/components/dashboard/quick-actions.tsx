"use client";

import { Brain, FolderKanban, NotebookPen, Database, BookOpen } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "Open Brain", href: "/brain", icon: Brain, color: "text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100 hover:border-violet-300", ring: "focus-visible:ring-violet-300" },
  { label: "Projects", href: "/projects", icon: FolderKanban, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300", ring: "focus-visible:ring-blue-300" },
  { label: "Journal", href: "/journal", icon: NotebookPen, color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300", ring: "focus-visible:ring-amber-300" },
  { label: "Memory", href: "/memory", icon: Database, color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300", ring: "focus-visible:ring-emerald-300" },
  { label: "Study Plan", href: "/study-plan", icon: BookOpen, color: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300", ring: "focus-visible:ring-rose-300" },
];

export function QuickActions() {
  return (
    <section
      className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: "0.4s" }}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        <span>Quick Actions</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${action.color} ${action.ring}`}
            >
              <Icon size={15} strokeWidth={2} />
              {action.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

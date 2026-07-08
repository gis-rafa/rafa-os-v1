"use client";

import { Brain, FolderKanban, NotebookPen, Database, BookOpen } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "Open Brain", href: "/brain", icon: Brain, color: "text-violet-500 bg-violet-50 border-violet-100 hover:bg-violet-100" },
  { label: "Projects", href: "/projects", icon: FolderKanban, color: "text-blue-500 bg-blue-50 border-blue-100 hover:bg-blue-100" },
  { label: "Journal", href: "/journal", icon: NotebookPen, color: "text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-100" },
  { label: "Memory", href: "/memory", icon: Database, color: "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100" },
  { label: "Study Plan", href: "/study-plan", icon: BookOpen, color: "text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100" },
];

export function QuickActions() {
  return (
    <section className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm" style={{ animationDelay: "0.4s" }}>
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
              className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-sm font-medium transition active:scale-[0.97] ${action.color}`}
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

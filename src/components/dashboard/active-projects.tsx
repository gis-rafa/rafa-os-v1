"use client";

import { FolderKanban } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

const projectColors: Record<string, string> = {
  green: "bg-emerald-500",
  emerald: "bg-emerald-500",
  purple: "bg-violet-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  stone: "bg-stone-500",
};

export function ActiveProjects({
  projects,
}: {
  projects: ExecutionDashboardData["activeProjects"];
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        <FolderKanban size={13} strokeWidth={2} />
        Active Projects
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {projects.map((project) => {
          const dotColor = projectColors[project.color ?? ""] ?? "bg-stone-500";
          const prog = project.progress ?? 0;
          return (
            <div
              key={project.id}
              className="rounded-lg border border-stone-100 bg-stone-50/50 p-4"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block size-2.5 rounded-full ${dotColor}`} />
                <span className="text-sm font-medium text-stone-800 truncate">
                  {project.name}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-stone-600 transition-all duration-700"
                  style={{ width: `${prog}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-stone-400">{project.currentPhase ?? "Active"}</span>
                <span className="font-semibold text-stone-600">{prog}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

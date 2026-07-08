"use client";

import { ListOrdered } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { formatMinutes } from "@/lib/dashboard-utils";

export function ExecutionQueue({
  isPending,
  onTaskDone,
  onTaskStart,
  tasks
}: {
  isPending: boolean;
  onTaskDone: (taskId: string) => void;
  onTaskStart: (taskId: string) => void;
  tasks: ExecutionDashboardData["todaysTasks"];
}) {
  return (
    <section className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6" style={{ animationDelay: "0.45s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <ListOrdered size={13} strokeWidth={2} />
          Task Queue
        </div>
        <span className="text-xs text-stone-400">{tasks.length} tasks</span>
      </div>
      <div className="mt-4 grid gap-2">
        {tasks.map((task) => (
          <article
            className="flex flex-col gap-3 rounded-lg border border-stone-100 bg-stone-50/50 p-4 transition-all duration-150 hover:border-stone-200 hover:bg-white lg:flex-row lg:items-center lg:justify-between"
            key={task.id}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    task.status === "Done"
                      ? "bg-emerald-100 text-emerald-700"
                      : task.status === "In Progress"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-600"
                  }`}
                >
                  <span
                    className={`inline-block size-1.5 rounded-full ${
                      task.status === "Done"
                        ? "bg-emerald-500"
                        : task.status === "In Progress"
                          ? "bg-amber-500"
                          : "bg-stone-400"
                    }`}
                  />
                  {task.status}
                </span>
                <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-xs font-medium text-stone-500">
                  {task.projectName ?? "Mission"}
                </span>
                <span className="text-xs text-stone-400">
                  {formatMinutes(task.estimatedMinutes)}
                </span>
              </div>
              <p
                className={`mt-2 text-sm font-medium leading-snug ${
                  task.status === "Done"
                    ? "text-stone-400 line-through"
                    : "text-stone-800"
                }`}
              >
                {task.title}
              </p>
            </div>
            {task.status !== "Done" ? (
              <div className="flex shrink-0 gap-2">
                <button
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-150 hover:bg-stone-100 hover:text-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPending}
                  onClick={() => onTaskStart(task.id)}
                  type="button"
                  aria-label={`Start ${task.title}`}
                >
                  In Progress
                </button>
                <button
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-stone-900 px-3 text-xs font-semibold text-white transition-all duration-150 hover:bg-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPending}
                  onClick={() => onTaskDone(task.id)}
                  type="button"
                  aria-label={`Mark ${task.title} as done`}
                >
                  Done
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-stone-200 py-8 text-center">
            <ListOrdered size={20} className="text-stone-300" />
            <p className="text-sm text-stone-400">No tasks for today.</p>
          </div>
        )}
      </div>
    </section>
  );
}

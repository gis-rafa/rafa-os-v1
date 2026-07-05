"use client";

import { PlayCircle } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { formatMinutes } from "@/lib/dashboard-utils";
import { StatusDot } from "./status-dot";

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
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
          <PlayCircle size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Mission Task Queue
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Ordered by mission priority: GIS first, then portfolio, branding,
            English, and training.
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <article
            className="flex flex-col gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900 lg:flex-row lg:items-center lg:justify-between"
            key={task.id}
          >
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusDot status={task.status} />
                <span className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
                  {task.projectName ?? "Mission"}
                </span>
                <span className="text-xs text-stone-600">
                  {formatMinutes(task.estimatedMinutes)}
                </span>
              </div>
              <p
                className={`text-sm font-semibold ${
                  task.status === "Done"
                    ? "text-stone-600 line-through"
                    : "text-stone-950 dark:text-stone-50"
                }`}
              >
                {task.title}
              </p>
            </div>
            {task.status !== "Done" ? (
              <div className="flex gap-2">
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                  disabled={isPending}
                  onClick={() => onTaskStart(task.id)}
                  type="button"
                >
                  In Progress
                </button>
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md bg-stone-950 px-3 text-xs font-semibold text-white disabled:opacity-60 dark:bg-stone-50 dark:text-stone-950"
                  disabled={isPending}
                  onClick={() => onTaskDone(task.id)}
                  type="button"
                >
                  Done
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

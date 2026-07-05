"use client";

import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { formatMinutes } from "@/lib/dashboard-utils";
import { FocusMetric } from "./focus-metric";

export function FocusMode({
  currentTask,
  isPending,
  missionScore,
  onExit,
  onTaskDone,
  remainingTasks
}: {
  currentTask: ExecutionDashboardData["todaysTasks"][number] | null;
  isPending: boolean;
  missionScore: number;
  onExit: () => void;
  onTaskDone: (taskId: string) => void;
  remainingTasks: ExecutionDashboardData["todaysTasks"];
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-4xl flex-col justify-center text-stone-950 dark:text-stone-50">
      <div className="rounded-md border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-600">
              Focus Mode
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Start Today&apos;s Mission
            </h2>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 px-4 text-sm font-semibold text-stone-700 dark:border-stone-700 dark:text-stone-300"
            onClick={onExit}
            type="button"
          >
            Exit
          </button>
        </div>

        {currentTask ? (
          <div className="rounded-md border border-stone-950 bg-stone-950 p-5 text-white dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-300 dark:text-stone-600">
              Current task
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">
              {currentTask.title}
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <FocusMetric
                label="Estimated duration"
                value={formatMinutes(currentTask.estimatedMinutes)}
              />
              <FocusMetric label="Remaining tasks" value={remainingTasks.length} />
              <FocusMetric label="Progress" value={`${missionScore}%`} />
            </div>
            <button
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-stone-950 disabled:opacity-60 dark:bg-stone-950 dark:text-white"
              disabled={isPending}
              onClick={() => onTaskDone(currentTask.id)}
              type="button"
            >
              Complete Current Task
            </button>
          </div>
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            All mission tasks for today are complete.
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { ArrowLeft, Target, Clock, List, Gauge } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { formatMinutes } from "@/lib/dashboard-utils";

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
    <section className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl flex-col justify-center px-4 text-stone-950">
      <div className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Focus Mode
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Start Today&apos;s Mission
            </h2>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-600 transition-all duration-150 hover:bg-stone-100 hover:text-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1"
            onClick={onExit}
            type="button"
          >
            <ArrowLeft size={14} />
            Exit
          </button>
        </div>

        {currentTask ? (
          <div className="rounded-xl border border-stone-900 bg-stone-900 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Current task
            </p>
            <h3 className="mt-3 text-xl font-semibold leading-tight sm:text-2xl">
              {currentTask.title}
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <FocusMetric icon={Clock} label="Duration" value={formatMinutes(currentTask.estimatedMinutes)} />
              <FocusMetric icon={List} label="Remaining" value={remainingTasks.length} />
              <FocusMetric icon={Gauge} label="Progress" value={`${missionScore}%`} />
            </div>
            <button
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-white px-4 text-sm font-semibold text-stone-900 transition-all duration-150 hover:bg-stone-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPending}
              onClick={() => onTaskDone(currentTask.id)}
              type="button"
            >
              <Target size={15} />
              Complete Current Task
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Target size={24} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">All tasks complete</h3>
              <p className="mt-1 text-sm text-emerald-700">
                Every mission task for today is done.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FocusMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <Icon size={16} className="text-stone-400" />
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

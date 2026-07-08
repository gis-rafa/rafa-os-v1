"use client";

import { Lock, Unlock } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

export function ExecutionRules({
  brandingTasks,
  isPending,
  onTaskDone,
  primaryGisComplete
}: {
  brandingTasks: ExecutionDashboardData["todaysTasks"];
  isPending: boolean;
  onTaskDone: (taskId: string) => void;
  primaryGisComplete: boolean;
}) {
  return (
    <section
      className={`animate-slide-up rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6 ${
        primaryGisComplete
          ? "border-emerald-200/80 bg-emerald-50/60"
          : "border-amber-200/80 bg-amber-50/60"
      }`}
      style={{ animationDelay: "0.5s" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
            primaryGisComplete
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {primaryGisComplete ? (
            <Unlock size={16} strokeWidth={2} />
          ) : (
            <Lock size={16} strokeWidth={2} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-stone-900">
            {primaryGisComplete
              ? "GIS is complete &mdash; Personal Branding unlocked"
              : "Complete GIS before switching"}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {primaryGisComplete
              ? "Your GIS mission is done. You can now work on Personal Branding tasks."
              : "Finish your GIS roadmap work first, then move to lower-priority areas."}
          </p>
          {primaryGisComplete && brandingTasks.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {brandingTasks.map((task) => (
                <div
                  className="flex flex-col gap-2 rounded-lg border border-emerald-200/70 bg-white/80 p-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
                  key={task.id}
                >
                  <p className="text-sm font-medium text-stone-700">
                    {task.title}
                  </p>
                  {task.status !== "Done" ? (
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-stone-900 px-3 text-xs font-semibold text-white transition-all duration-150 hover:bg-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isPending}
                      onClick={() => onTaskDone(task.id)}
                      type="button"
                    >
                      Mark Done
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

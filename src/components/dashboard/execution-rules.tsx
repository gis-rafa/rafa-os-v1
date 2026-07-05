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
      className={`rounded-md border p-5 shadow-sm ${
        primaryGisComplete
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
            primaryGisComplete
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {primaryGisComplete ? (
            <Unlock size={18} strokeWidth={1.9} />
          ) : (
            <Lock size={18} strokeWidth={1.9} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-stone-950">
            Execution Rules
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-800">
            {primaryGisComplete
              ? "GIS is complete. Personal Branding is unlocked."
              : "Complete your GIS mission before switching to Personal Branding."}
          </p>
          {primaryGisComplete && brandingTasks.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {brandingTasks.map((task) => (
                <div
                  className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={task.id}
                >
                  <p className="text-sm font-medium text-stone-800">
                    {task.title}
                  </p>
                  {task.status !== "Done" ? (
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-md bg-stone-950 px-3 text-xs font-semibold text-white disabled:opacity-60"
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

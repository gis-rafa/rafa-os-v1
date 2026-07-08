"use client";

import { Focus, Target } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";

export function TodaysMission({
  data,
  onStart,
  primaryGisComplete,
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
  onStart: () => void;
  primaryGisComplete: boolean;
}) {
  return (
    <section
      className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: "0.05s" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Target size={12} strokeWidth={2.5} />
            Today&apos;s Mission
          </div>
          <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-2xl">
            {data.primaryObjective}
          </h2>
        </div>
        <button
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white transition-all duration-150 hover:bg-stone-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          onClick={onStart}
          type="button"
        >
          <Focus size={15} strokeWidth={2} />
          Focus
        </button>
      </div>

      <div className="mt-5 grid gap-2">
        <ObjectiveRow
          label="Primary"
          value={data.primaryObjective}
          emphasized
          done={primaryGisComplete}
        />
        <ObjectiveRow
          label="Secondary"
          value={data.secondaryObjective}
          done={hasCompletedMatchingTask(data.todaysTasks, "portfolio")}
        />
        <ObjectiveRow
          label="Third"
          value={data.thirdObjective}
          done={hasCompletedMatchingTask(data.todaysTasks, "brand")}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-emerald-600">{data.tasksCompletedToday}</span>
          done today
        </span>
        <span className="text-stone-300" aria-hidden="true">&middot;</span>
        <span className="flex items-center gap-1">
          <span className="font-semibold text-amber-600">{data.tasksRemainingToday}</span>
          remaining
        </span>
        <span className="text-stone-300" aria-hidden="true">&middot;</span>
        <span>
          Week {data.currentWeek} &middot; {data.executionPace}
        </span>
      </div>
    </section>
  );
}

function ObjectiveRow({
  label,
  value,
  emphasized,
  done,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  done?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-150 ${
        emphasized
          ? "border-stone-900 bg-stone-900 text-white"
          : done
            ? "border-emerald-100 bg-emerald-50/50 text-stone-500"
            : "border-stone-100 bg-stone-50 text-stone-700 hover:border-stone-200 hover:bg-stone-100"
      }`}
    >
      {done ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white animate-scale-in">
          <span className="text-[10px] font-bold">&#10003;</span>
        </span>
      ) : (
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
            emphasized
              ? "bg-white/20 text-white"
              : "bg-stone-200 text-stone-500"
          }`}
        >
          {emphasized ? "1" : label === "Secondary" ? "2" : "3"}
        </span>
      )}
      <span className={`text-sm leading-snug ${done ? "line-through" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function hasCompletedMatchingTask(
  tasks: ExecutionDashboardData["todaysTasks"],
  keyword: string
) {
  return tasks.some(
    (task) =>
      task.status === "Done" &&
      `${task.projectName ?? ""} ${task.title}`.toLowerCase().includes(keyword)
  );
}

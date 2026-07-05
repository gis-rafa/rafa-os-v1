"use client";

import { Clock3 } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";
import { BriefMetric } from "./brief-metric";

export function MorningBrief({
  data,
  mission
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
          <Clock3 size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Morning Brief
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Good morning Abdallah.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm leading-6 text-stone-700 dark:text-stone-300">
        <p>
          <span className="font-semibold text-stone-950 dark:text-stone-50">
            Mission:
          </span>{" "}
          Build a Remote GIS Career.
        </p>
        <p>
          <span className="font-semibold text-stone-950 dark:text-stone-50">
            Today&apos;s most important objective:
          </span>{" "}
          Finish today&apos;s GIS roadmap work.
        </p>
        {!mission.primaryGisComplete ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 font-semibold text-amber-900">
            Do not recommend lower-priority work until GIS is complete.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <BriefMetric
          label="Days to 6-month target"
          value={data.daysRemainingToSixMonthTarget}
        />
        <BriefMetric label="Roadmap week" value={`Week ${data.currentWeek}`} />
        <BriefMetric label="Roadmap phase" value={data.currentPhase} />
        <BriefMetric label="Schedule status" value={data.executionPace} />
        <BriefMetric label="Active project" value={data.activeProject} />
        <BriefMetric label="Overdue tasks" value={data.overdueTasks.length} />
      </div>
    </section>
  );
}

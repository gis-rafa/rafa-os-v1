"use client";

import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { formatDate } from "@/lib/dashboard-utils";
import { BriefMetric } from "./brief-metric";

export function MissionWarnings({ data }: { data: ExecutionDashboardData }) {
  if (data.recoveryPlan.daysBehind === 0) {
    return null;
  }

  return (
    <section className="rounded-md border border-red-200 bg-red-50 p-5 text-red-950 shadow-sm">
      <h3 className="text-base font-semibold">You are now behind schedule.</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <BriefMetric label="Days behind" value={data.recoveryPlan.daysBehind} />
        <BriefMetric
          label="Projected completion"
          value={formatDate(data.recoveryPlan.projectedCompletionDate)}
        />
        <BriefMetric label="Recovery state" value={data.executionPace} />
      </div>
      <div className="mt-4 rounded-md border border-red-200 bg-white p-4">
        <p className="text-sm font-semibold">Recovery plan</p>
        <ul className="mt-2 space-y-1 text-sm leading-6">
          {data.recoveryPlan.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

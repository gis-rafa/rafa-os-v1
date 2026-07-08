"use client";

import { AlertTriangle } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { formatDate } from "@/lib/dashboard-utils";

export function MissionWarnings({ data }: { data: ExecutionDashboardData }) {
  if (data.recoveryPlan.daysBehind === 0) {
    return null;
  }

  return (
    <section className="animate-slide-up rounded-xl border border-red-200/80 bg-gradient-to-br from-red-50/80 to-white p-5 shadow-sm sm:p-6" style={{ animationDelay: "0.55s" }}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600">
        <AlertTriangle size={13} strokeWidth={2} />
        Behind Schedule
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <WarningCard label="Days behind" value={data.recoveryPlan.daysBehind} />
        <WarningCard
          label="Projected completion"
          value={formatDate(data.recoveryPlan.projectedCompletionDate)}
        />
        <WarningCard label="Recovery state" value={data.executionPace} />
      </div>
      <div className="mt-4 rounded-lg border border-red-200/70 bg-white/80 p-4 backdrop-blur-sm">
        <p className="text-sm font-semibold text-red-900">Recovery plan</p>
        <ul className="mt-2 space-y-1.5">
          {data.recoveryPlan.steps.map((step) => (
            <li key={step} className="flex items-start gap-2 text-sm leading-relaxed text-red-800">
              <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-red-400" />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WarningCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-red-200/50 bg-red-50/50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-red-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-red-900">{value}</p>
    </div>
  );
}

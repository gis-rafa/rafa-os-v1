"use client";

import { Radar } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";

export function MissionIntelligence({
  data,
  mission
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  return (
    <section className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6" style={{ animationDelay: "0.55s" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <Radar size={13} strokeWidth={2} />
          Execution Intelligence
        </div>
        <span className="text-xs text-stone-400">Live from PostgreSQL</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <IntelCard label="Current mission" value={data.primaryObjective} />
        <IntelCard
          label="Roadmap impact"
          value={`+${mission.estimatedImpact.gisRoadmap}% GIS when completed`}
        />
        <IntelCard
          label="Portfolio impact"
          value={`+${mission.estimatedImpact.portfolio}% portfolio when completed`}
        />
        <IntelCard
          label="Remote readiness"
          value={`+${mission.estimatedImpact.remoteJobReadiness}% readiness from today`}
        />
      </div>
    </section>
  );
}

function IntelCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-100 bg-stone-50/60 px-4 py-3 transition-all duration-150 hover:border-stone-200 hover:bg-stone-100/50">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-700">{value}</p>
    </div>
  );
}

"use client";

import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";
import { IntelligencePoint } from "./intelligence-point";

export function MissionIntelligence({
  data,
  mission
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
          Execution Intelligence
        </h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          RAFA OS recalculates the plan from PostgreSQL before showing the
          dashboard.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        <IntelligencePoint
          label="Current mission"
          value={data.primaryObjective}
        />
        <IntelligencePoint
          label="Roadmap impact"
          value={`Estimated +${mission.estimatedImpact.gisRoadmap} GIS progress when completed.`}
        />
        <IntelligencePoint
          label="Portfolio impact"
          value={`Estimated +${mission.estimatedImpact.portfolio} portfolio progress when completed.`}
        />
        <IntelligencePoint
          label="Remote readiness"
          value={`Estimated +${mission.estimatedImpact.remoteJobReadiness} readiness from today's mission.`}
        />
      </div>
    </section>
  );
}

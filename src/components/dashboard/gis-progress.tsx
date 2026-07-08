"use client";

import { Map } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";

export function GisProgress({
  mission,
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  return (
    <section
      className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: "0.25s" }}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        <Map size={13} strokeWidth={2} />
        GIS &amp; Portfolio
      </div>
      <div className="mt-5 grid gap-4">
        <ProgressItem
          label="GIS Roadmap"
          value={mission.roadmapCompletion}
          milestone={mission.milestones.roadmap}
          barColor="bg-emerald-500"
        />
        <ProgressItem
          label="GIS Portfolio"
          value={mission.portfolioCompletion}
          milestone={mission.milestones.portfolio}
          barColor="bg-blue-500"
        />
        <ProgressItem
          label="Remote Job Readiness"
          value={mission.remoteJobReadiness}
          milestone={mission.milestones.remoteJobReadiness}
          barColor="bg-stone-500"
        />
        <ProgressItem
          label="Personal Branding"
          value={mission.personalBrandingGrowth}
          milestone={mission.milestones.personalBranding}
          barColor="bg-violet-500"
        />
      </div>
    </section>
  );
}

function ProgressItem({
  label,
  value,
  milestone,
  barColor,
}: {
  label: string;
  value: number;
  milestone: string;
  barColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">{label}</span>
        <span className="font-semibold tabular-nums text-stone-900">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} animate-progress`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-0.5 text-xs text-stone-400">{milestone}</p>
    </div>
  );
}

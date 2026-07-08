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
    <section className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm" style={{ animationDelay: "0.25s" }}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        <Map size={13} strokeWidth={2} />
        GIS &amp; Portfolio
      </div>
      <div className="mt-4 grid gap-4">
        <ProgressItem
          label="GIS Roadmap"
          value={mission.roadmapCompletion}
          milestone={mission.milestones.roadmap}
          color="emerald"
        />
        <ProgressItem
          label="GIS Portfolio"
          value={mission.portfolioCompletion}
          milestone={mission.milestones.portfolio}
          color="blue"
        />
        <ProgressItem
          label="Remote Job Readiness"
          value={mission.remoteJobReadiness}
          milestone={mission.milestones.remoteJobReadiness}
          color="stone"
        />
        <ProgressItem
          label="Personal Branding"
          value={mission.personalBrandingGrowth}
          milestone={mission.milestones.personalBranding}
          color="violet"
        />
      </div>
    </section>
  );
}

function ProgressItem({
  label,
  value,
  milestone,
  color,
}: {
  label: string;
  value: number;
  milestone: string;
  color: "emerald" | "blue" | "stone" | "violet";
}) {
  const barColor = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    stone: "bg-stone-500",
    violet: "bg-violet-500",
  }[color];

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">{label}</span>
        <span className="font-semibold text-stone-900">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-0.5 text-xs text-stone-400">{milestone}</p>
    </div>
  );
}

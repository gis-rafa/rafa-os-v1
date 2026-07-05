"use client";

import { TrendingUp } from "lucide-react";
import type { MissionView } from "@/lib/dashboard-utils";
import { ProgressBarCard } from "./progress-bar-card";

export function MissionProgress({ mission }: { mission: MissionView }) {
  const items = [
    {
      label: "GIS Roadmap Progress",
      milestone: mission.milestones.roadmap,
      value: mission.roadmapCompletion
    },
    {
      label: "GIS Portfolio Progress",
      milestone: mission.milestones.portfolio,
      value: mission.portfolioCompletion
    },
    {
      label: "Remote Job Readiness",
      milestone: mission.milestones.remoteJobReadiness,
      value: mission.remoteJobReadiness
    },
    {
      label: "Personal Branding Progress",
      milestone: mission.milestones.personalBranding,
      value: mission.personalBrandingGrowth
    }
  ];

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
          <TrendingUp size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Mission Progress
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Progress toward becoming a remote GIS professional.
          </p>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <ProgressBarCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}

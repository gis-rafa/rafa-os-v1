"use client";

import { Focus, Target } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";
import { IntelligencePoint } from "./intelligence-point";
import { ObjectiveCard } from "./objective-card";

export function TodaysMission({
  data,
  mission,
  onStart,
  primaryGisComplete
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
  onStart: () => void;
  primaryGisComplete: boolean;
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-semibold text-white dark:bg-stone-50 dark:text-stone-950">
            <Target size={16} strokeWidth={1.9} />
            Today&apos;s Mission
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-stone-950 dark:text-stone-50">
            Complete GIS Week {data.currentWeek} before starting lower-priority
            work.
          </h3>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
            RAFA OS is directing today toward one outcome: build a remote GIS
            career through focused execution.
          </p>
        </div>
        <button
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-950"
          onClick={onStart}
          type="button"
        >
          <Focus size={17} strokeWidth={1.9} />
          Start Today&apos;s Mission
        </button>
      </div>

      <div className="grid gap-3">
        <ObjectiveCard
          emphasized
          label="Primary Objective"
          value={data.primaryObjective}
        />
        <ObjectiveCard
          label="Secondary Objective"
          value={data.secondaryObjective}
        />
        <ObjectiveCard label="Third Objective" value={data.thirdObjective} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <IntelligencePoint
          label="Why this matters"
          value="This is the highest-leverage work for becoming a remote GIS professional."
        />
        <IntelligencePoint
          label="Long-term goal"
          value="Supports the 6-month Remote GIS Career target."
        />
        <IntelligencePoint
          label="Estimated impact"
          value={`GIS +${mission.estimatedImpact.gisRoadmap}, Portfolio +${mission.estimatedImpact.portfolio}, Remote readiness +${mission.estimatedImpact.remoteJobReadiness}, Branding +${mission.estimatedImpact.personalBranding}`}
        />
        <IntelligencePoint
          label="Completion summary"
          value={
            primaryGisComplete
              ? `GIS progress gained: +${mission.executionSummary.gisProgress}. Mission score gained: +${mission.executionSummary.missionScore}. Remote readiness gained: +${mission.executionSummary.remoteReadiness}.`
              : "Complete the GIS mission to generate today's execution summary."
          }
        />
      </div>

      <div
        className={`mt-4 rounded-md border p-4 text-sm font-semibold ${
          primaryGisComplete
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {primaryGisComplete
          ? "GIS mission complete. Personal Branding is unlocked."
          : "Do not recommend lower-priority work until GIS is complete."}
      </div>
    </section>
  );
}

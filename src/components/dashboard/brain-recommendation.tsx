"use client";

import { Lightbulb } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";

export function BrainRecommendation({
  data,
  mission,
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  const memory = data.latestImportantMemory as Record<string, unknown> | null;

  return (
    <section
      className="animate-slide-up rounded-xl border border-stone-200/80 bg-gradient-to-br from-amber-50/70 to-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: "0.35s" }}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
        <Lightbulb size={13} strokeWidth={2} />
        Brain Recommendation
      </div>
      <div className="mt-4">
        <h3 className="text-base font-semibold text-stone-900">
          {mission.primaryGisComplete
            ? "Personal Branding is unlocked"
            : "Focus on GIS first"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          {mission.primaryGisComplete
            ? "Your GIS mission is complete for today. Shift focus to personal branding — draft that LinkedIn post about your P02 completion."
            : "Complete your GIS roadmap work before switching to lower-priority tasks. This maintains momentum toward your 6-month target."}
        </p>
        {memory && typeof memory.content === "string" && (
          <div className="mt-4 rounded-lg border border-stone-200/70 bg-white/80 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Remember
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">
              {memory.content}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

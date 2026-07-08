"use client";

import { Sparkles } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { MissionView } from "@/lib/dashboard-utils";
import { ProgressRing } from "./progress-ring";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatToday(timezone?: string) {
  const now = new Date();
  const tz = timezone ?? "UTC";
  const dateStr = now.toLocaleDateString("en", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { dateStr, timeStr };
}

export function GreetingSection({
  data,
  mission,
  timezone,
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
  timezone?: string;
}) {
  const { dateStr, timeStr } = formatToday(timezone);
  const greeting = getGreeting();

  return (
    <div className="animate-fade-in flex flex-col gap-5 rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
          <Sparkles size={14} className="text-emerald-500" />
          <span>{greeting}, Abdallah.</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Build a Remote GIS Career
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-stone-500">
          <span>{dateStr}</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>{timeStr}</span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{data.activeStreak}-day streak</span>
          </span>
          <span className="hidden sm:inline" aria-hidden="true">&middot;</span>
          <span>
            Sprint: Week {data.currentWeek} &middot; {data.currentPhase}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 self-start sm:flex-col sm:items-center sm:gap-0.5">
        <ProgressRing progress={mission.missionScore} size={64} strokeWidth={5} />
        <div className="text-center sm:mt-0.5">
          <span className="text-sm font-semibold text-stone-600">{mission.missionScore}%</span>
          <span className="ml-1 text-xs text-stone-400">mission</span>
        </div>
      </div>
    </div>
  );
}

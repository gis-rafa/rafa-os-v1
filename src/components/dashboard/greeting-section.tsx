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
    <div className="animate-fade-in flex items-start justify-between gap-6 rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-500">
          <Sparkles size={14} className="text-emerald-500" />
          <span>{greeting}, Abdallah.</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Build a Remote GIS Career
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
          <span>{dateStr}</span>
          <span className="hidden sm:inline">&middot;</span>
          <span className="hidden sm:inline">{timeStr}</span>
          <span className="hidden sm:inline">&middot;</span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            {data.activeStreak}-day streak
          </span>
          <span className="hidden sm:inline">&middot;</span>
          <span>
            Sprint: Week {data.currentWeek} &middot; {data.currentPhase}
          </span>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-center sm:gap-1">
        <ProgressRing progress={mission.missionScore} size={72} strokeWidth={5} />
        <span className="text-xs font-semibold text-stone-500">{mission.missionScore}%</span>
        <span className="text-[11px] text-stone-400">mission</span>
      </div>
    </div>
  );
}

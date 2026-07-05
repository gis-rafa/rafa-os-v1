"use client";

import { Gauge } from "lucide-react";
import { clampPercentage } from "@/lib/dashboard-utils";

export function MissionScore({ score }: { score: number }) {
  return (
    <section className="rounded-md border border-stone-950 bg-stone-950 p-5 text-white shadow-sm dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-white/10 dark:bg-stone-950/10">
            <Gauge size={20} strokeWidth={1.9} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mission Completion</h3>
            <p className="mt-1 text-sm text-stone-300 dark:text-stone-600">
              GIS, portfolio, personal branding, and English combined.
            </p>
          </div>
        </div>
        <p className="text-4xl font-semibold">{score}%</p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15 dark:bg-stone-950/15">
        <div
          className="h-full rounded-full bg-white dark:bg-stone-950"
          style={{ width: `${clampPercentage(score)}%` }}
        />
      </div>
    </section>
  );
}

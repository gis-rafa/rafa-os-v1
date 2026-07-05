"use client";

import { clampPercentage } from "@/lib/dashboard-utils";

export function ProgressBarCard({
  label,
  milestone,
  value
}: {
  label: string;
  milestone: string;
  value: number;
}) {
  return (
    <article className="rounded-md border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-950 dark:text-stone-50">
            {label}
          </p>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Next milestone: {milestone}
          </p>
        </div>
        <p className="text-lg font-semibold text-stone-950 dark:text-stone-50">
          {value}%
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full rounded-full bg-stone-950 dark:bg-stone-50"
          style={{ width: `${clampPercentage(value)}%` }}
        />
      </div>
    </article>
  );
}

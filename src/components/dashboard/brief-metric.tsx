"use client";

export function BriefMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-stone-950 dark:text-stone-50">
        {value}
      </p>
    </div>
  );
}

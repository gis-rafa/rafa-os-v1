"use client";

export function IntelligencePoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-800 dark:text-stone-200">
        {value}
      </p>
    </div>
  );
}

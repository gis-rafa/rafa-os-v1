"use client";

export function FocusMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-white/10 p-3 dark:bg-stone-950/10">
      <p className="text-xs uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

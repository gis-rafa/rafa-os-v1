"use client";

export function DashboardHeader({
  isDatabaseConfigured
}: {
  isDatabaseConfigured: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600 dark:text-stone-400">
          Remote GIS Career OS
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950 dark:text-stone-50 sm:text-3xl">
          Build a Remote GIS Career
        </h2>
      </div>
      <p className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 shadow-sm dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300">
        {isDatabaseConfigured
          ? "PostgreSQL live data"
          : "Authentication and database are not configured locally"}
      </p>
    </div>
  );
}

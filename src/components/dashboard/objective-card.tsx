"use client";

export function ObjectiveCard({
  emphasized,
  label,
  value
}: {
  emphasized?: boolean;
  label: string;
  value: string;
}) {
  return (
    <article
      className={`rounded-md border p-4 ${
        emphasized
          ? "border-stone-950 bg-stone-950 text-white dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950"
          : "border-stone-200 bg-stone-50 text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.12em] ${
          emphasized ? "text-stone-300 dark:text-stone-600" : "text-stone-600"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6">{value}</p>
    </article>
  );
}

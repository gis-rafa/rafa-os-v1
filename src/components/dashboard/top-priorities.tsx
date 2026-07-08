"use client";

import { ListChecks } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

export function TopPriorities({
  priorities
}: {
  priorities: ExecutionDashboardData["priorities"];
}) {
  const top = priorities.slice(0, 3);

  return (
    <section className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        <ListChecks size={13} strokeWidth={2} />
        Top Priorities
      </div>
      <div className="mt-4 grid gap-2">
        {top.length === 0 && (
          <p className="text-sm text-stone-400 italic">No priorities set for today.</p>
        )}
        {top.map((p, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-stone-100 bg-stone-50/50 px-4 py-3"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[11px] font-bold text-stone-500">
              {i + 1}
            </span>
            <span className="text-sm leading-snug text-stone-700">
              {String(typeof p === "object" && p !== null && "title" in p ? (p as Record<string, unknown>).title ?? "" : p)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

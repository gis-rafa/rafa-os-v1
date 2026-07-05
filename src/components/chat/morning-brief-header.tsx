"use client";

import { CheckCircle2, Map as MapIcon, Target, Trophy } from "lucide-react";
import type { MorningBrief } from "@/lib/morning-brief";

export function MorningBriefHeader({
  morningBrief
}: {
  morningBrief: MorningBrief;
}) {
  const items = [
    {
      title: "Primary Goal",
      value: morningBrief.primaryObjective,
      icon: Trophy
    },
    {
      title: "Today's GIS Task",
      value: morningBrief.gisStudyTask,
      icon: MapIcon
    },
    {
      title: "Weekly Priority",
      value: morningBrief.weeklyPriority,
      icon: CheckCircle2
    }
  ];

  return (
    <section className="rounded-md border border-stone-200 bg-stone-50 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-stone-950 text-white">
            <Target size={17} strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-950">
              Current Morning Brief
            </h3>
            <p className="mt-1 text-xs text-stone-600">
              {morningBrief.dateLabel} | Roadmap day {morningBrief.roadmapDay}
            </p>
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-600">
          Local context
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="rounded-md border border-stone-200 bg-white p-3"
              key={item.title}
            >
              <div className="mb-2 flex items-center gap-2 text-stone-600">
                <Icon size={15} strokeWidth={1.8} />
                <p className="text-xs font-semibold uppercase tracking-[0.1em]">
                  {item.title}
                </p>
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-stone-800">
                {item.value}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

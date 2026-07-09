"use client";

import { Pill, Dumbbell, Droplets, Sun, Moon, Sunrise, Sunset, Check } from "lucide-react";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

function categorizeTasks(tasks: ExecutionDashboardData["todaysTasks"]) {
  const morning: typeof tasks = [];
  const lunch: typeof tasks = [];
  const evening: typeof tasks = [];
  const sleep: typeof tasks = [];
  const workout: typeof tasks = [];
  const hydration: typeof tasks = [];

  for (const task of tasks) {
    const t = task.title.toLowerCase();
    if (t.includes("centrum") || t.includes("volenta")) { morning.push(task); }
    else if (t.includes("limitless") || t.includes("omega 3")) { lunch.push(task); }
    else if (t.includes("newnutrition")) { evening.push(task); }
    else if (t.includes("magnesium")) { sleep.push(task); }
    else if (t.includes("creatine") || t.includes("electrolytes") || t.includes("gym") || t.includes("workout") || t.includes("swim")) { workout.push(task); }
    else if (t.includes("water")) { hydration.push(task); }
  }

  return { morning, lunch, evening, sleep, workout, hydration };
}

type IconProps = { size?: number; strokeWidth?: number; className?: string };
const groupMeta: Record<string, { icon: React.ComponentType<IconProps>; color: string; bg: string }> = {
  morning: { icon: Sunrise, color: "text-amber-500", bg: "bg-amber-50" },
  lunch: { icon: Sun, color: "text-orange-500", bg: "bg-orange-50" },
  evening: { icon: Sunset, color: "text-indigo-400", bg: "bg-indigo-50" },
  sleep: { icon: Moon, color: "text-violet-500", bg: "bg-violet-50" },
  workout: { icon: Dumbbell, color: "text-rose-500", bg: "bg-rose-50" },
  hydration: { icon: Droplets, color: "text-sky-500", bg: "bg-sky-50" },
};

export function DailyHealth({
  tasks,
  onToggle,
}: {
  tasks: ExecutionDashboardData["todaysTasks"];
  onToggle: (taskId: string, status: string) => void;
}) {
  const cats = categorizeTasks(tasks);
  const groups = [
    { key: "morning", label: "Morning", items: cats.morning },
    { key: "lunch", label: "Lunch", items: cats.lunch },
    { key: "workout", label: "Workout", items: cats.workout },
    { key: "evening", label: "Evening", items: cats.evening },
    { key: "sleep", label: "Before Sleep", items: cats.sleep },
    { key: "hydration", label: "Hydration", items: cats.hydration },
  ];
  const allHealthTasks = groups.flatMap((g) => g.items);
  const doneCount = allHealthTasks.filter((t) => t.status === "Done").length;
  const totalCount = allHealthTasks.length;

  if (totalCount === 0) return null;

  return (
    <section
      className="animate-slide-up rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <Pill size={13} strokeWidth={2} />
          Daily Health
        </div>
        <span className="text-sm font-medium text-stone-500">
          {doneCount}/{totalCount}
        </span>
      </div>

      <div className="mt-3 mb-5 flex h-1.5 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={totalCount}>
        <div
          className="h-full rounded-full bg-emerald-500 animate-progress transition-all duration-700"
          style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ key, label, items }) => {
          if (items.length === 0) return null;
          const meta = groupMeta[key] ?? { icon: Pill, color: "text-stone-400", bg: "bg-stone-50" };
          const Icon = meta.icon;
          return (
            <div key={key} className="rounded-lg border border-stone-100 bg-stone-50/60 p-3 transition-all duration-150 hover:border-stone-200 hover:bg-stone-100/50">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
                <Icon size={12} className={meta.color} />
                {label}
              </div>
              <div className="mt-2 grid gap-0.5">
                {items.map((task) => {
                  const done = task.status === "Done";
                  return (
                    <label
                      key={task.id}
                      className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-all duration-150 hover:bg-white focus-within:ring-2 focus-within:ring-stone-300 focus-within:ring-offset-1"
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                          done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-stone-300 bg-white group-hover:border-stone-400"
                        }`}
                      >
                        {done && (
                          <Check size={10} strokeWidth={3} className="animate-scale-in" />
                        )}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={done}
                        onChange={() => onToggle(task.id, task.status)}
                        aria-label={task.title}
                      />
                      <span
                        className={`text-sm transition-all duration-200 ${
                          done ? "text-stone-400 line-through" : "text-stone-700"
                        }`}
                      >
                        {task.title.replace(/\(.*?\)\s*$/, "").trim()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

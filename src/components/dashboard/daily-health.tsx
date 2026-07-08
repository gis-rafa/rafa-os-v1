"use client";

import { Pill, Dumbbell, Droplets, Sun, Moon, Sunrise, Sunset } from "lucide-react";
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
    else if (t.includes("creatine") || t.includes("electrolytes")) { workout.push(task); }
    else if (t.includes("water")) { hydration.push(task); }
  }

  return { morning, lunch, evening, sleep, workout, hydration };
}

export function DailyHealth({
  tasks,
  onToggle,
}: {
  tasks: ExecutionDashboardData["todaysTasks"];
  onToggle: (taskId: string, status: string) => void;
}) {
  const cats = categorizeTasks(tasks);
  const allHealthTasks = [...cats.morning, ...cats.lunch, ...cats.evening, ...cats.sleep, ...cats.workout, ...cats.hydration];
  const doneCount = allHealthTasks.filter((t) => t.status === "Done").length;
  const progressPct = allHealthTasks.length > 0 ? Math.round((doneCount / allHealthTasks.length) * 100) : 0;

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
          <Pill size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Daily Health
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            {doneCount}/{allHealthTasks.length} done &middot; {progressPct}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <HealthGroup icon={Sunrise} label="Morning" tasks={cats.morning} onToggle={onToggle} />
      <HealthGroup icon={Sun} label="Lunch" tasks={cats.lunch} onToggle={onToggle} />
      <HealthGroup icon={Sunset} label="Evening" tasks={cats.evening} onToggle={onToggle} />
      <HealthGroup icon={Moon} label="Before Sleep" tasks={cats.sleep} onToggle={onToggle} />
      <HealthGroup icon={Dumbbell} label="Workout" tasks={cats.workout} onToggle={onToggle} />
      <HealthGroup icon={Droplets} label="Hydration" tasks={cats.hydration} onToggle={onToggle} />

      {allHealthTasks.length === 0 && (
        <p className="text-sm text-stone-500">No health tasks for today.</p>
      )}
    </section>
  );
}

function HealthGroup({
  icon: Icon,
  label,
  tasks,
  onToggle,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  tasks: ExecutionDashboardData["todaysTasks"];
  onToggle: (taskId: string, status: string) => void;
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
        <Icon size={12} /> {label}
      </p>
      <div className="grid gap-1.5">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-100 bg-stone-50 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <input
              type="checkbox"
              className="size-4 accent-emerald-600"
              checked={task.status === "Done"}
              onChange={() => onToggle(task.id, task.status)}
            />
            <span
              className={
                task.status === "Done"
                  ? "text-stone-500 line-through"
                  : "text-stone-800 dark:text-stone-200"
              }
            >
              {task.title}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

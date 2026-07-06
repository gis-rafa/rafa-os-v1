"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pill, Dumbbell, Droplets } from "lucide-react";
import { updateExecutionTaskStatusAction } from "@/app/dashboard/actions";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

export function DailyHealth({
  tasks,
}: {
  tasks: ExecutionDashboardData["todaysTasks"];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const healthTasks = tasks.filter((t) => {
    const title = t.title.toLowerCase();
    return (
      title.includes("medication") ||
      title.includes("water") ||
      title.includes("creatine") ||
      title.includes("electrolytes") ||
      title.includes("workout")
    );
  });

  const medTasks = healthTasks.filter(
    (t) =>
      t.title.toLowerCase().includes("medication") ||
      t.title.toLowerCase().includes("creatine") ||
      t.title.toLowerCase().includes("electrolytes") ||
      t.title.toLowerCase().includes("magnesium") ||
      t.title.toLowerCase().includes("supplement")
  );
  const waterTask = healthTasks.find((t) => t.title.toLowerCase().includes("water"));
  const workoutTask = healthTasks.find((t) => t.title.toLowerCase().includes("workout"));

  const waterDone = waterTask?.status === "Done";
  const workoutDone = workoutTask?.status === "Done";
  const totalHealth = medTasks.length + (waterTask ? 1 : 0) + (workoutTask ? 1 : 0);
  const doneHealth = medTasks.filter((t) => t.status === "Done").length
    + (waterDone ? 1 : 0)
    + (workoutDone ? 1 : 0);
  const progressPct = totalHealth > 0 ? Math.round((doneHealth / totalHealth) * 100) : 0;

  function toggleTask(taskId: string, status: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", taskId);
      formData.set("status", status === "Done" ? "Todo" : "Done");
      await updateExecutionTaskStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
          <Pill size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Today&apos;s Health
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            {doneHealth}/{totalHealth} done &middot; {progressPct}%
          </p>
        </div>
      </div>

      <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {medTasks.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <Pill size={12} /> Medication
          </p>
          <div className="grid gap-1.5">
            {medTasks.map((task) => (
              <label
                key={task.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-100 bg-stone-50 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-emerald-600"
                  checked={task.status === "Done"}
                  onChange={() => toggleTask(task.id, task.status)}
                  disabled={isPending}
                />
                <span
                  className={
                    task.status === "Done"
                      ? "text-stone-500 line-through"
                      : "text-stone-800 dark:text-stone-200"
                  }
                >
                  {task.title.replace(/^[^\s]+\s/, "")}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {workoutTask && (
        <div className="mb-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <Dumbbell size={12} /> Workout
          </p>
          <label
            className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-100 bg-stone-50 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <input
              type="checkbox"
              className="size-4 accent-emerald-600"
              checked={workoutDone}
              onChange={() => toggleTask(workoutTask.id, workoutTask.status)}
              disabled={isPending}
            />
            <span
              className={
                workoutDone
                  ? "text-stone-500 line-through"
                  : "text-stone-800 dark:text-stone-200"
              }
            >
              {workoutTask.title.replace(/^[^\s]+\s/, "")}
            </span>
          </label>
        </div>
      )}

      {waterTask && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <Droplets size={12} /> Hydration
          </p>
          <label
            className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-100 bg-stone-50 px-3 py-2 text-sm hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <input
              type="checkbox"
              className="size-4 accent-blue-600"
              checked={waterDone}
              onChange={() => toggleTask(waterTask.id, waterTask.status)}
              disabled={isPending}
            />
            <span
              className={
                waterDone
                  ? "text-stone-500 line-through"
                  : "text-stone-800 dark:text-stone-200"
              }
            >
              {waterTask.title.replace(/^[^\s]+\s/, "")}
            </span>
          </label>
        </div>
      )}

      {healthTasks.length === 0 && (
        <p className="text-sm text-stone-500">No health tasks for today.</p>
      )}
    </section>
  );
}

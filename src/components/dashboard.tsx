"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { updateExecutionTaskStatusAction } from "@/app/dashboard/actions";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import { buildMissionView } from "@/lib/dashboard-utils";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { TodaysMission } from "@/components/dashboard/todays-mission";
import { MorningBrief } from "@/components/dashboard/morning-brief";
import { ExecutionRules } from "@/components/dashboard/execution-rules";
import { MissionIntelligence } from "@/components/dashboard/mission-intelligence";
import { MissionWarnings } from "@/components/dashboard/mission-warnings";
import { MissionProgress } from "@/components/dashboard/mission-progress";
import { MissionScore } from "@/components/dashboard/mission-score";
import { ExecutionQueue } from "@/components/dashboard/execution-queue";
import { FocusMode } from "@/components/dashboard/focus-mode";
import { DailyHealth } from "@/components/dashboard/daily-health";
import { WorkoutLog } from "@/components/dashboard/workout-log";
import type { WorkoutDay } from "@/lib/daily-health";
import { logExerciseSetAction } from "@/app/dashboard/actions";

type ExerciseLogItem = {
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
  done: boolean;
};

export function Dashboard({
  data,
  isDatabaseConfigured,
  exerciseLogs,
  dayOfWeek,
  workout,
  timezone,
}: {
  data: ExecutionDashboardData;
  isDatabaseConfigured: boolean;
  exerciseLogs?: ExerciseLogItem[];
  dayOfWeek?: number;
  workout?: WorkoutDay;
  timezone?: string;
}) {
  const [dashboardData, setDashboardData] = useState(data);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pendingAction = useRef<Promise<unknown> | null>(null);

  const mission = useMemo(
    () => buildMissionView(dashboardData),
    [dashboardData]
  );

  function updateTask(taskId: string, status: string) {
    const previousData = dashboardData;

    setDashboardData((current) => {
      const tasks = current.todaysTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      const doneCount = tasks.filter((task) => task.status === "Done").length;

      return {
        ...current,
        tasksCompletedToday: doneCount,
        tasksRemainingToday: tasks.length - doneCount,
        todaysTasks: tasks
      };
    });

    if (pendingAction.current) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("taskId", taskId);
        formData.set("status", status);
        pendingAction.current = updateExecutionTaskStatusAction(formData);
        await pendingAction.current;
      } catch {
        setDashboardData(previousData);
      } finally {
        pendingAction.current = null;
      }
    });
  }

  function handleToggledTask(taskId: string, currentStatus: string) {
    updateTask(taskId, currentStatus === "Done" ? "Todo" : "Done");
  }

  function handleLogSet(exerciseName: string, setsCompleted: number, totalSets: number) {
    if (pendingAction.current) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("exerciseName", exerciseName);
        formData.set("setsCompleted", String(setsCompleted));
        formData.set("totalSets", String(totalSets));
        pendingAction.current = logExerciseSetAction(formData);
        await pendingAction.current;
      } finally {
        pendingAction.current = null;
      }
    });
  }

  if (isFocusMode) {
    return (
      <FocusMode
        currentTask={mission.currentTask}
        isPending={isPending}
        missionScore={mission.missionScore}
        onExit={() => setIsFocusMode(false)}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        remainingTasks={mission.remainingTasks}
      />
    );
  }

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-4 text-stone-950 dark:text-stone-50">
      <DashboardHeader isDatabaseConfigured={isDatabaseConfigured} />

      <MissionScore score={mission.missionScore} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <TodaysMission
          data={dashboardData}
          mission={mission}
          onStart={() => setIsFocusMode(true)}
          primaryGisComplete={mission.primaryGisComplete}
        />
        <MorningBrief data={dashboardData} mission={mission} />
      </div>

      <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900">
        Today: {new Date(dashboardData.currentDate).toLocaleDateString("en", { timeZone: timezone, weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        {" · "} Day of week: {dayOfWeek ?? "?"}
        {timezone ? <span> · Timezone: {timezone}</span> : null}
        {" · "} Server: {new Date().toISOString().slice(0, 16)}Z
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DailyHealth tasks={dashboardData.todaysTasks} onToggle={handleToggledTask} />
        {workout && dayOfWeek !== undefined && (
          <WorkoutLog
            dayOfWeek={dayOfWeek}
            todayLogs={exerciseLogs ?? []}
            onLogSet={handleLogSet}
          />
        )}
      </div>

      <ExecutionRules
        brandingTasks={mission.brandingTasks}
        isPending={isPending}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        primaryGisComplete={mission.primaryGisComplete}
      />

      <MissionIntelligence data={dashboardData} mission={mission} />

      <MissionWarnings data={dashboardData} />

      <MissionProgress mission={mission} />

      <ExecutionQueue
        isPending={isPending}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        onTaskStart={(taskId) => updateTask(taskId, "In Progress")}
        tasks={dashboardData.todaysTasks}
      />
    </section>
  );
}

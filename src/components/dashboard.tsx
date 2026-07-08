"use client";

import { useMemo, useState, useTransition, useRef } from "react";
import { updateExecutionTaskStatusAction } from "@/app/dashboard/actions";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { WorkoutDay } from "@/lib/daily-health";
import { buildMissionView } from "@/lib/dashboard-utils";
import { logExerciseSetAction } from "@/app/dashboard/actions";
import { GreetingSection } from "@/components/dashboard/greeting-section";
import { TodaysMission } from "@/components/dashboard/todays-mission";
import { TopPriorities } from "@/components/dashboard/top-priorities";
import { DailyHealth } from "@/components/dashboard/daily-health";
import { WorkoutLog } from "@/components/dashboard/workout-log";
import { GisProgress } from "@/components/dashboard/gis-progress";
import { ActiveProjects } from "@/components/dashboard/active-projects";
import { BrainRecommendation } from "@/components/dashboard/brain-recommendation";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FocusMode } from "@/components/dashboard/focus-mode";
import { ExecutionRules } from "@/components/dashboard/execution-rules";
import { MissionIntelligence } from "@/components/dashboard/mission-intelligence";
import { MissionWarnings } from "@/components/dashboard/mission-warnings";
import { ExecutionQueue } from "@/components/dashboard/execution-queue";

type ExerciseLogItem = {
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
  done: boolean;
};

export function Dashboard({
  data,
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
    setDashboardData((current) => {
      const tasks = current.todaysTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      );
      const doneCount = tasks.filter((task) => task.status === "Done").length;
      return {
        ...current,
        tasksCompletedToday: doneCount,
        tasksRemainingToday: tasks.length - doneCount,
        todaysTasks: tasks,
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
        setDashboardData((current) => {
          const tasks = current.todaysTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: status === "Done" ? "Todo" : "Done" }
              : task
          );
          const doneCount = tasks.filter((t) => t.status === "Done").length;
          return { ...current, tasksCompletedToday: doneCount, tasksRemainingToday: tasks.length - doneCount, todaysTasks: tasks };
        });
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
    <section className="mx-auto flex max-w-7xl flex-col gap-6 text-stone-950">
      <GreetingSection data={dashboardData} mission={mission} timezone={timezone} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <TodaysMission
          data={dashboardData}
          mission={mission}
          onStart={() => setIsFocusMode(true)}
          primaryGisComplete={mission.primaryGisComplete}
        />
        <TopPriorities priorities={dashboardData.priorities} />
      </div>

      <DailyHealth tasks={dashboardData.todaysTasks} onToggle={handleToggledTask} />

      <div className="grid gap-6 lg:grid-cols-2">
        {workout && dayOfWeek !== undefined && (
          <WorkoutLog
            dayOfWeek={dayOfWeek}
            todayLogs={exerciseLogs ?? []}
            onLogSet={handleLogSet}
          />
        )}
        <GisProgress data={dashboardData} mission={mission} />
      </div>

      <ActiveProjects projects={dashboardData.activeProjects} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <BrainRecommendation data={dashboardData} mission={mission} />
        <QuickActions />
      </div>

      <MissionWarnings data={dashboardData} />

      <ExecutionRules
        brandingTasks={mission.brandingTasks}
        isPending={isPending}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        primaryGisComplete={mission.primaryGisComplete}
      />

      <MissionIntelligence data={dashboardData} mission={mission} />

      <ExecutionQueue
        isPending={isPending}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        onTaskStart={(taskId) => updateTask(taskId, "In Progress")}
        tasks={dashboardData.todaysTasks}
      />
    </section>
  );
}

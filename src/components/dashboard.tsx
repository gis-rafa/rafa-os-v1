"use client";

import { useMemo, useState, useTransition } from "react";
import { updateExecutionTaskStatusAction } from "@/app/dashboard/actions";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";
import type { WorkoutDay } from "@/lib/daily-health";
import { buildMissionView } from "@/lib/dashboard-utils";
import { logExerciseSetAction } from "@/app/dashboard/actions";
import { ErrorBoundary } from "@/components/error-boundary";
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

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("taskId", taskId);
        formData.set("status", status);
        await updateExecutionTaskStatusAction(formData);
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
      }
    });
  }

  function handleToggledTask(taskId: string, currentStatus: string) {
    updateTask(taskId, currentStatus === "Done" ? "Todo" : "Done");
  }

  function handleLogSet(exerciseName: string, setsCompleted: number, totalSets: number) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("exerciseName", exerciseName);
        formData.set("setsCompleted", String(setsCompleted));
        formData.set("totalSets", String(totalSets));
        await logExerciseSetAction(formData);
      } catch {
        // log error silently
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
    <section className="mx-auto flex max-w-7xl flex-col gap-5 sm:gap-6 text-stone-950">
      <ErrorBoundary>
        <GreetingSection data={dashboardData} mission={mission} timezone={timezone} />
      </ErrorBoundary>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ErrorBoundary>
          <TodaysMission
          data={dashboardData}
          mission={mission}
          onStart={() => setIsFocusMode(true)}
          primaryGisComplete={mission.primaryGisComplete}
        />
        <TopPriorities priorities={dashboardData.priorities} />
        </ErrorBoundary>
      </div>

      <DailyHealth tasks={dashboardData.todaysTasks} onToggle={handleToggledTask} />

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {workout && dayOfWeek !== undefined && (
          <ErrorBoundary>
            <WorkoutLog
              dayOfWeek={dayOfWeek}
              todayLogs={exerciseLogs ?? []}
              onLogSet={handleLogSet}
            />
          </ErrorBoundary>
        )}
        <ErrorBoundary>
          <GisProgress data={dashboardData} mission={mission} />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <ActiveProjects projects={dashboardData.activeProjects} />
      </ErrorBoundary>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ErrorBoundary>
          <BrainRecommendation data={dashboardData} mission={mission} />
        </ErrorBoundary>
        <ErrorBoundary>
          <QuickActions />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <MissionWarnings data={dashboardData} />
      </ErrorBoundary>

      <ErrorBoundary>
        <ExecutionRules
        brandingTasks={mission.brandingTasks}
        isPending={isPending}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        primaryGisComplete={mission.primaryGisComplete}
      />
      </ErrorBoundary>

      <ErrorBoundary>
        <MissionIntelligence data={dashboardData} mission={mission} />
      </ErrorBoundary>

      <ErrorBoundary>
        <ExecutionQueue
        isPending={isPending}
        onTaskDone={(taskId) => updateTask(taskId, "Done")}
        onTaskStart={(taskId) => updateTask(taskId, "In Progress")}
        tasks={dashboardData.todaysTasks}
      />
      </ErrorBoundary>
    </section>
  );
}

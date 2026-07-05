"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

export function Dashboard({
  data,
  isDatabaseConfigured
}: {
  data: ExecutionDashboardData;
  isDatabaseConfigured: boolean;
}) {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(data);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const mission = useMemo(
    () => buildMissionView(dashboardData),
    [dashboardData]
  );

  function updateTask(taskId: string, status: "In Progress" | "Done") {
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

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("taskId", taskId);
        formData.set("status", status);
        await updateExecutionTaskStatusAction(formData);
        router.refresh();
      } catch {
        setDashboardData(previousData);
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

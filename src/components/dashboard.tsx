"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  Focus,
  Gauge,
  Lock,
  PlayCircle,
  Target,
  TrendingUp,
  Unlock
} from "lucide-react";
import { updateExecutionTaskStatusAction } from "@/app/dashboard/actions";
import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

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

function DashboardHeader({
  isDatabaseConfigured
}: {
  isDatabaseConfigured: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600 dark:text-stone-400">
          Remote GIS Career OS
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950 dark:text-stone-50 sm:text-3xl">
          Build a Remote GIS Career
        </h2>
      </div>
      <p className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 shadow-sm dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300">
        {isDatabaseConfigured
          ? "PostgreSQL live data"
          : "Authentication and database are not configured locally"}
      </p>
    </div>
  );
}

function TodaysMission({
  data,
  mission,
  onStart,
  primaryGisComplete
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
  onStart: () => void;
  primaryGisComplete: boolean;
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-semibold text-white dark:bg-stone-50 dark:text-stone-950">
            <Target size={16} strokeWidth={1.9} />
            Today&apos;s Mission
          </div>
          <h3 className="text-2xl font-semibold leading-tight text-stone-950 dark:text-stone-50">
            Complete GIS Week {data.currentWeek} before starting lower-priority
            work.
          </h3>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
            RAFA OS is directing today toward one outcome: build a remote GIS
            career through focused execution.
          </p>
        </div>
        <button
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-950"
          onClick={onStart}
          type="button"
        >
          <Focus size={17} strokeWidth={1.9} />
          Start Today&apos;s Mission
        </button>
      </div>

      <div className="grid gap-3">
        <ObjectiveCard
          emphasized
          label="Primary Objective"
          value={data.primaryObjective}
        />
        <ObjectiveCard
          label="Secondary Objective"
          value={data.secondaryObjective}
        />
        <ObjectiveCard label="Third Objective" value={data.thirdObjective} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <IntelligencePoint
          label="Why this matters"
          value="This is the highest-leverage work for becoming a remote GIS professional."
        />
        <IntelligencePoint
          label="Long-term goal"
          value="Supports the 6-month Remote GIS Career target."
        />
        <IntelligencePoint
          label="Estimated impact"
          value={`GIS +${mission.estimatedImpact.gisRoadmap}, Portfolio +${mission.estimatedImpact.portfolio}, Remote readiness +${mission.estimatedImpact.remoteJobReadiness}, Branding +${mission.estimatedImpact.personalBranding}`}
        />
        <IntelligencePoint
          label="Completion summary"
          value={
            primaryGisComplete
              ? `GIS progress gained: +${mission.executionSummary.gisProgress}. Mission score gained: +${mission.executionSummary.missionScore}. Remote readiness gained: +${mission.executionSummary.remoteReadiness}.`
              : "Complete the GIS mission to generate today's execution summary."
          }
        />
      </div>

      <div
        className={`mt-4 rounded-md border p-4 text-sm font-semibold ${
          primaryGisComplete
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {primaryGisComplete
          ? "GIS mission complete. Personal Branding is unlocked."
          : "Do not recommend lower-priority work until GIS is complete."}
      </div>
    </section>
  );
}

function IntelligencePoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-stone-800 dark:text-stone-200">
        {value}
      </p>
    </div>
  );
}

function ObjectiveCard({
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

function MorningBrief({
  data,
  mission
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
          <Clock3 size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Morning Brief
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Good morning Abdallah.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm leading-6 text-stone-700 dark:text-stone-300">
        <p>
          <span className="font-semibold text-stone-950 dark:text-stone-50">
            Mission:
          </span>{" "}
          Build a Remote GIS Career.
        </p>
        <p>
          <span className="font-semibold text-stone-950 dark:text-stone-50">
            Today&apos;s most important objective:
          </span>{" "}
          Finish today&apos;s GIS roadmap work.
        </p>
        {!mission.primaryGisComplete ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 font-semibold text-amber-900">
            Do not recommend lower-priority work until GIS is complete.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <BriefMetric
          label="Days to 6-month target"
          value={data.daysRemainingToSixMonthTarget}
        />
        <BriefMetric label="Roadmap week" value={`Week ${data.currentWeek}`} />
        <BriefMetric label="Roadmap phase" value={data.currentPhase} />
        <BriefMetric label="Schedule status" value={data.executionPace} />
        <BriefMetric label="Active project" value={data.activeProject} />
        <BriefMetric label="Overdue tasks" value={data.overdueTasks.length} />
      </div>
    </section>
  );
}

function MissionIntelligence({
  data,
  mission
}: {
  data: ExecutionDashboardData;
  mission: MissionView;
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
          Execution Intelligence
        </h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          RAFA OS recalculates the plan from PostgreSQL before showing the
          dashboard.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-4">
        <IntelligencePoint
          label="Current mission"
          value={data.primaryObjective}
        />
        <IntelligencePoint
          label="Roadmap impact"
          value={`Estimated +${mission.estimatedImpact.gisRoadmap} GIS progress when completed.`}
        />
        <IntelligencePoint
          label="Portfolio impact"
          value={`Estimated +${mission.estimatedImpact.portfolio} portfolio progress when completed.`}
        />
        <IntelligencePoint
          label="Remote readiness"
          value={`Estimated +${mission.estimatedImpact.remoteJobReadiness} readiness from today's mission.`}
        />
      </div>
    </section>
  );
}

function MissionWarnings({ data }: { data: ExecutionDashboardData }) {
  if (data.recoveryPlan.daysBehind === 0) {
    return null;
  }

  return (
    <section className="rounded-md border border-red-200 bg-red-50 p-5 text-red-950 shadow-sm">
      <h3 className="text-base font-semibold">You are now behind schedule.</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <BriefMetric label="Days behind" value={data.recoveryPlan.daysBehind} />
        <BriefMetric
          label="Projected completion"
          value={formatDate(data.recoveryPlan.projectedCompletionDate)}
        />
        <BriefMetric label="Recovery state" value={data.executionPace} />
      </div>
      <div className="mt-4 rounded-md border border-red-200 bg-white p-4">
        <p className="text-sm font-semibold">Recovery plan</p>
        <ul className="mt-2 space-y-1 text-sm leading-6">
          {data.recoveryPlan.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BriefMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-stone-950 dark:text-stone-50">
        {value}
      </p>
    </div>
  );
}

function ExecutionRules({
  brandingTasks,
  isPending,
  onTaskDone,
  primaryGisComplete
}: {
  brandingTasks: ExecutionDashboardData["todaysTasks"];
  isPending: boolean;
  onTaskDone: (taskId: string) => void;
  primaryGisComplete: boolean;
}) {
  return (
    <section
      className={`rounded-md border p-5 shadow-sm ${
        primaryGisComplete
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
            primaryGisComplete
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          {primaryGisComplete ? (
            <Unlock size={18} strokeWidth={1.9} />
          ) : (
            <Lock size={18} strokeWidth={1.9} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-stone-950">
            Execution Rules
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-800">
            {primaryGisComplete
              ? "GIS is complete. Personal Branding is unlocked."
              : "Complete your GIS mission before switching to Personal Branding."}
          </p>
          {primaryGisComplete && brandingTasks.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {brandingTasks.map((task) => (
                <div
                  className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={task.id}
                >
                  <p className="text-sm font-medium text-stone-800">
                    {task.title}
                  </p>
                  {task.status !== "Done" ? (
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-md bg-stone-950 px-3 text-xs font-semibold text-white disabled:opacity-60"
                      disabled={isPending}
                      onClick={() => onTaskDone(task.id)}
                      type="button"
                    >
                      Mark Done
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MissionProgress({ mission }: { mission: MissionView }) {
  const items = [
    {
      label: "GIS Roadmap Progress",
      milestone: mission.milestones.roadmap,
      value: mission.roadmapCompletion
    },
    {
      label: "GIS Portfolio Progress",
      milestone: mission.milestones.portfolio,
      value: mission.portfolioCompletion
    },
    {
      label: "Remote Job Readiness",
      milestone: mission.milestones.remoteJobReadiness,
      value: mission.remoteJobReadiness
    },
    {
      label: "Personal Branding Progress",
      milestone: mission.milestones.personalBranding,
      value: mission.personalBrandingGrowth
    }
  ];

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
          <TrendingUp size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Mission Progress
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Progress toward becoming a remote GIS professional.
          </p>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <ProgressBarCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}

function MissionScore({ score }: { score: number }) {
  return (
    <section className="rounded-md border border-stone-950 bg-stone-950 p-5 text-white shadow-sm dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-white/10 dark:bg-stone-950/10">
            <Gauge size={20} strokeWidth={1.9} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Mission Completion</h3>
            <p className="mt-1 text-sm text-stone-300 dark:text-stone-600">
              GIS, portfolio, personal branding, and English combined.
            </p>
          </div>
        </div>
        <p className="text-4xl font-semibold">{score}%</p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15 dark:bg-stone-950/15">
        <div
          className="h-full rounded-full bg-white dark:bg-stone-950"
          style={{ width: `${clampPercentage(score)}%` }}
        />
      </div>
    </section>
  );
}

function ProgressBarCard({
  label,
  milestone,
  value
}: {
  label: string;
  milestone: string;
  value: number;
}) {
  return (
    <article className="rounded-md border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-950 dark:text-stone-50">
            {label}
          </p>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Next milestone: {milestone}
          </p>
        </div>
        <p className="text-lg font-semibold text-stone-950 dark:text-stone-50">
          {value}%
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full rounded-full bg-stone-950 dark:bg-stone-50"
          style={{ width: `${clampPercentage(value)}%` }}
        />
      </div>
    </article>
  );
}

function ExecutionQueue({
  isPending,
  onTaskDone,
  onTaskStart,
  tasks
}: {
  isPending: boolean;
  onTaskDone: (taskId: string) => void;
  onTaskStart: (taskId: string) => void;
  tasks: ExecutionDashboardData["todaysTasks"];
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-200">
          <PlayCircle size={18} strokeWidth={1.9} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
            Mission Task Queue
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Ordered by mission priority: GIS first, then portfolio, branding,
            English, and training.
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <article
            className="flex flex-col gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900 lg:flex-row lg:items-center lg:justify-between"
            key={task.id}
          >
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusDot status={task.status} />
                <span className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
                  {task.projectName ?? "Mission"}
                </span>
                <span className="text-xs text-stone-600">
                  {formatMinutes(task.estimatedMinutes)}
                </span>
              </div>
              <p
                className={`text-sm font-semibold ${
                  task.status === "Done"
                    ? "text-stone-600 line-through"
                    : "text-stone-950 dark:text-stone-50"
                }`}
              >
                {task.title}
              </p>
            </div>
            {task.status !== "Done" ? (
              <div className="flex gap-2">
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                  disabled={isPending}
                  onClick={() => onTaskStart(task.id)}
                  type="button"
                >
                  In Progress
                </button>
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md bg-stone-950 px-3 text-xs font-semibold text-white disabled:opacity-60 dark:bg-stone-50 dark:text-stone-950"
                  disabled={isPending}
                  onClick={() => onTaskDone(task.id)}
                  type="button"
                >
                  Done
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function FocusMode({
  currentTask,
  isPending,
  missionScore,
  onExit,
  onTaskDone,
  remainingTasks
}: {
  currentTask: ExecutionDashboardData["todaysTasks"][number] | null;
  isPending: boolean;
  missionScore: number;
  onExit: () => void;
  onTaskDone: (taskId: string) => void;
  remainingTasks: ExecutionDashboardData["todaysTasks"];
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-4xl flex-col justify-center text-stone-950 dark:text-stone-50">
      <div className="rounded-md border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-600">
              Focus Mode
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Start Today&apos;s Mission
            </h2>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 px-4 text-sm font-semibold text-stone-700 dark:border-stone-700 dark:text-stone-300"
            onClick={onExit}
            type="button"
          >
            Exit
          </button>
        </div>

        {currentTask ? (
          <div className="rounded-md border border-stone-950 bg-stone-950 p-5 text-white dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-300 dark:text-stone-600">
              Current task
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">
              {currentTask.title}
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <FocusMetric
                label="Estimated duration"
                value={formatMinutes(currentTask.estimatedMinutes)}
              />
              <FocusMetric label="Remaining tasks" value={remainingTasks.length} />
              <FocusMetric label="Progress" value={`${missionScore}%`} />
            </div>
            <button
              className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-stone-950 disabled:opacity-60 dark:bg-stone-950 dark:text-white"
              disabled={isPending}
              onClick={() => onTaskDone(currentTask.id)}
              type="button"
            >
              Complete Current Task
            </button>
          </div>
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            All mission tasks for today are complete.
          </div>
        )}
      </div>
    </section>
  );
}

function FocusMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-white/10 p-3 dark:bg-stone-950/10">
      <p className="text-xs uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const className =
    status === "Done"
      ? "bg-emerald-500"
      : status === "In Progress"
        ? "bg-amber-500"
        : "bg-stone-400";

  return <span aria-label={`Status: ${status}`} className={`size-2.5 rounded-full ${className}`} role="status" />;
}

type MissionView = ReturnType<typeof buildMissionView>;

function buildMissionView(data: ExecutionDashboardData) {
  const incompleteTasks = data.todaysTasks.filter((task) => task.status !== "Done");
  const primaryGisTask =
    incompleteTasks.find((task) => isGisTask(task)) ?? null;
  const primaryGisComplete = !primaryGisTask;
  const brandingTasks = data.todaysTasks.filter((task) => isBrandingTask(task));
  const completedMissionTasks = data.todaysTasks.filter(
    (task) => task.status === "Done"
  );
  const dailyProgress =
    data.todaysTasks.length > 0
      ? Math.round((completedMissionTasks.length / data.todaysTasks.length) * 6)
      : 0;
  const roadmapCompletion = primaryGisComplete
    ? Math.min(100, data.roadmapCompletion + 1)
    : data.roadmapCompletion;
  const portfolioCompletion = hasCompletedMatchingTask(
    data.todaysTasks,
    "portfolio"
  )
    ? Math.min(100, data.portfolioCompletion + 2)
    : data.portfolioCompletion;
  const personalBrandingGrowth = hasCompletedMatchingTask(
    data.todaysTasks,
    "brand"
  )
    ? Math.min(100, data.personalBrandingGrowth + 2)
    : data.personalBrandingGrowth;
  const englishCompletion = hasCompletedMatchingTask(data.todaysTasks, "english")
    ? Math.min(100, data.englishCompletion + 2)
    : data.englishCompletion;
  const remoteJobReadiness = Math.round(
    roadmapCompletion * 0.45 +
      portfolioCompletion * 0.35 +
      personalBrandingGrowth * 0.2
  );
  const missionScore = Math.min(
    100,
    Math.round(
      roadmapCompletion * 0.45 +
        portfolioCompletion * 0.3 +
        personalBrandingGrowth * 0.15 +
        englishCompletion * 0.1 +
        dailyProgress
    )
  );
  const estimatedImpact = {
    gisRoadmap: primaryGisComplete ? 0 : 1,
    personalBranding: hasCompletedMatchingTask(data.todaysTasks, "brand") ? 2 : 0,
    portfolio: hasCompletedMatchingTask(data.todaysTasks, "portfolio") ? 2 : 0,
    remoteJobReadiness: primaryGisComplete ? 0 : 1
  };
  const executionSummary = {
    gisProgress: primaryGisComplete ? 1 : 0,
    missionScore: Math.max(0, missionScore - data.missionCompletion),
    portfolioProgress: Math.max(0, portfolioCompletion - data.portfolioCompletion),
    remoteReadiness: Math.max(0, remoteJobReadiness - data.remoteJobReadiness)
  };

  return {
    brandingTasks,
    currentTask: primaryGisTask ?? incompleteTasks[0] ?? null,
    englishCompletion,
    estimatedImpact,
    executionSummary,
    milestones: {
      english: nextMilestone(englishCompletion, "English communication"),
      personalBranding: nextMilestone(
        personalBrandingGrowth,
        "Personal branding"
      ),
      portfolio: nextMilestone(portfolioCompletion, "Portfolio"),
      remoteJobReadiness: nextMilestone(
        remoteJobReadiness,
        "Remote job readiness"
      ),
      roadmap: nextMilestone(roadmapCompletion, "GIS roadmap")
    },
    missionScore,
    personalBrandingGrowth,
    portfolioCompletion,
    primaryGisComplete,
    remainingTasks: incompleteTasks,
    remoteJobReadiness,
    roadmapCompletion
  };
}

function hasCompletedMatchingTask(
  tasks: ExecutionDashboardData["todaysTasks"],
  keyword: string
) {
  return tasks.some(
    (task) =>
      task.status === "Done" &&
      `${task.projectName ?? ""} ${task.title}`.toLowerCase().includes(keyword)
  );
}

function isGisTask(task: ExecutionDashboardData["todaysTasks"][number]) {
  const text = `${task.projectName ?? ""} ${task.title}`.toLowerCase();

  return text.includes("gis");
}

function isBrandingTask(task: ExecutionDashboardData["todaysTasks"][number]) {
  const text = `${task.projectName ?? ""} ${task.title}`.toLowerCase();

  return (
    text.includes("brand") ||
    text.includes("linkedin") ||
    text.includes("portfolio content")
  );
}

function nextMilestone(progress: number, label: string) {
  const next = [25, 50, 75, 100].find((milestone) => progress < milestone) ?? 100;

  return `${label} ${next}% milestone`;
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatMinutes(minutes: number | null) {
  if (!minutes) {
    return "No estimate";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

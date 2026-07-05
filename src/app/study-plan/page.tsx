import { BarChart3, CalendarDays, CheckCircle2, Clock, Flag } from "lucide-react";
import { updateStudyTaskStatusAction } from "@/app/study-plan/actions";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";
import {
  getStudyPlanSummary,
  studyTaskStatuses,
  type StudyTaskStatus,
  type StudyTaskWithProgress
} from "@/lib/study-plan";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Plan | RAFA OS",
  description: "GIS roadmap with day-by-day task tracking and progress."
};

export const dynamic = "force-dynamic";

const statusStyles: Record<StudyTaskStatus, string> = {
  Todo: "border-stone-200 bg-stone-50 text-stone-600",
  "In Progress": "border-amber-200 bg-amber-50 text-amber-800",
  Done: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

export default async function StudyPlanPage() {
  const isAuthenticatedMode = isClerkConfigured();
  const isLocalDatabaseMode =
    !isAuthenticatedMode && canUseLocalDatabaseFallback();
  const user = isAuthenticatedMode
    ? await requireCurrentDbUser()
    : isLocalDatabaseMode
      ? await getLocalDevelopmentUser()
      : null;

  if (isLocalDatabaseMode && user) {
    await seedDevelopmentWorkspace(user.id);
  }

  const summary = await getStudyPlanSummary(user?.id);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
            Execution Engine
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">
            Study Plan
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Track the imported GIS roadmap day by day and keep the Morning Brief
            aligned with real progress.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
          <CalendarDays size={22} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={CheckCircle2}
          label="Completion"
          value={`${summary.completionPercentage}%`}
          detail={`${summary.doneCount}/${summary.totalCount} tasks done`}
        />
        <MetricCard
          icon={CalendarDays}
          label="Current Week"
          value={`Week ${summary.currentWeek}`}
          detail={summary.currentPhase}
        />
        <MetricCard
          icon={Flag}
          label="Current Phase"
          value={summary.currentPhase}
          detail="Loaded from the GIS roadmap"
        />
        <TaskPreviewCard label="Today's Task" task={summary.todayTask} />
        <TaskPreviewCard label="Tomorrow's Task" task={summary.tomorrowTask} />
      </div>

      <div className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
          <h3 className="text-base font-semibold text-stone-950">
            Roadmap Tasks
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {isAuthenticatedMode
              ? "Progress is stored in PostgreSQL per authenticated user."
              : isLocalDatabaseMode
                ? "Local development data is stored in PostgreSQL under the seeded workspace."
              : "Local fallback mode reads the imported roadmap without saved progress."}
          </p>
        </div>
        <div className="divide-y divide-stone-200">
          {summary.tasks.map((task) => (
            <RoadmapTaskRow
              canUpdateProgress={isAuthenticatedMode || isLocalDatabaseMode}
              key={task.day}
              task={task}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  value
}: {
  detail: string;
  icon: typeof BarChart3;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-stone-500">
        <Icon size={17} strokeWidth={1.8} />
        <p className="text-xs font-semibold uppercase tracking-[0.1em]">
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold text-stone-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-500">{detail}</p>
    </article>
  );
}

function TaskPreviewCard({
  label,
  task
}: {
  label: string;
  task: StudyTaskWithProgress | null;
}) {
  return (
    <article className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-stone-500">
        <Clock size={17} strokeWidth={1.8} />
        <p className="text-xs font-semibold uppercase tracking-[0.1em]">
          {label}
        </p>
      </div>
      {task ? (
        <>
          <p className="text-sm font-semibold text-stone-950">
            Day {task.day}: {task.gisTask}
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            {task.deliverable}
          </p>
        </>
      ) : (
        <p className="text-sm text-stone-500">No task available.</p>
      )}
    </article>
  );
}

function RoadmapTaskRow({
  canUpdateProgress,
  task
}: {
  canUpdateProgress: boolean;
  task: StudyTaskWithProgress;
}) {
  return (
    <article className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[90px_minmax(0,1fr)_220px] lg:items-start">
      <div>
        <p className="text-sm font-semibold text-stone-950">Day {task.day}</p>
        <p className="mt-1 text-xs text-stone-500">Week {task.week}</p>
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[task.status]}`}
          >
            {task.status}
          </span>
          <span className="text-xs text-stone-500">{task.phase}</span>
        </div>
        <h4 className="text-base font-semibold text-stone-950">
          {task.gisTask}
        </h4>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          {task.supportTask}
        </p>
        <p className="mt-2 text-sm font-medium text-stone-700">
          Deliverable: {task.deliverable}
        </p>
      </div>
      <form action={updateStudyTaskStatusAction} className="grid gap-2">
        <input name="day" type="hidden" value={task.day} />
        <label className="sr-only" htmlFor={`status-${task.day}`}>
          Status
        </label>
        <select
          className="h-10 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
          defaultValue={task.status}
          disabled={!canUpdateProgress}
          id={`status-${task.day}`}
          name="status"
        >
          {studyTaskStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!canUpdateProgress}
          type="submit"
        >
          Update
        </button>
      </form>
    </article>
  );
}

import { BarChart3, CalendarDays, CheckCircle2, Clock, Flag } from "lucide-react";
import { updateStudyTaskStatusAction } from "@/app/study-plan/actions";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";
import { PageHeader } from "@/components/ui";
import {
  getStudyPlanSummary,
  studyTaskStatuses,
  type StudyTaskStatus,
  type StudyTaskWithProgress
} from "@/lib/study-plan";
import { getRequestTimezone } from "@/lib/request-timezone";
import { TimezoneProvider } from "@/components/timezone-provider";
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
  const timezone = await getRequestTimezone();
  const user = await requireCurrentDbUser();
  await seedDevelopmentWorkspace(user.id, timezone);

  const summary = await getStudyPlanSummary(user.id);

  return (
    <section className="mx-auto max-w-7xl">
      <TimezoneProvider />
      <PageHeader
        icon={<CalendarDays size={22} strokeWidth={2} />}
        title="Execution Engine"
        description="Track the imported GIS roadmap day by day and keep the Morning Brief aligned with real progress."
      />

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

      <div className="rounded-xl border border-stone-200/80 bg-white shadow-sm">
        <div className="border-b border-stone-200/80 px-5 py-4">
          <h3 className="text-base font-semibold text-stone-950">
            Roadmap Tasks
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Progress is stored in PostgreSQL for the local workspace.
          </p>
        </div>
        <div className="divide-y divide-stone-200/80">
          {summary.tasks.map((task) => (
            <RoadmapTaskRow
              canUpdateProgress
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
    <article className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-stone-600">
        <Icon size={16} strokeWidth={2} />
        <p className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold text-stone-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
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
    <article className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-stone-600">
        <Clock size={16} strokeWidth={2} />
        <p className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      {task ? (
        <>
          <p className="text-sm font-semibold text-stone-950">
            Day {task.day}: {task.gisTask}
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {task.deliverable}
          </p>
        </>
      ) : (
        <p className="text-sm text-stone-600">No task available.</p>
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
    <article className="grid gap-4 px-5 py-4 lg:grid-cols-[90px_minmax(0,1fr)_220px] lg:items-start">
      <div>
        <p className="text-sm font-semibold text-stone-950">Day {task.day}</p>
        <p className="mt-1 text-xs text-stone-600">Week {task.week}</p>
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[task.status]}`}
          >
            {task.status}
          </span>
          <span className="text-xs text-stone-600">{task.phase}</span>
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
          className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
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
          className="inline-flex h-10 items-center justify-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!canUpdateProgress}
          type="submit"
        >
          Update
        </button>
      </form>
    </article>
  );
}
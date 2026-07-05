import Link from "next/link";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Flag,
  FolderKanban,
  Layers3,
  MemoryStick,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import {
  archiveProjectAction,
  createProjectAction,
  deleteProjectAction,
  updateProjectAction
} from "@/app/projects/actions";
import type { ExecutionProject } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";
import { getProjectForUser, listProjectsWithStats } from "@/lib/projects";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

const colorOptions = ["stone", "blue", "green", "orange", "purple", "red"];
const iconOptions = ["folder", "map", "target", "book", "briefcase", "heart"];

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;

  if (!isClerkConfigured() && canUseLocalDatabaseFallback()) {
    const user = await getLocalDevelopmentUser();
    await seedDevelopmentWorkspace(user.id);
    const [projects, editingProject] = await Promise.all([
      listProjectsWithStats(user.id),
      params.edit ? getProjectForUser(params.edit, user.id) : null
    ]);

    return (
      <ProjectsShell
        editingProject={editingProject}
        isDatabaseConfigured
        projects={projects}
      />
    );
  }

  if (!isClerkConfigured()) {
    return (
      <ProjectsShell
        editingProject={null}
        isDatabaseConfigured={false}
        projects={[]}
      />
    );
  }

  const user = await requireCurrentDbUser();
  const [projects, editingProject] = await Promise.all([
    listProjectsWithStats(user.id),
    params.edit ? getProjectForUser(params.edit, user.id) : null
  ]);

  return (
    <ProjectsShell
      editingProject={editingProject}
      isDatabaseConfigured
      projects={projects}
    />
  );
}

function ProjectsShell({
  editingProject,
  isDatabaseConfigured,
  projects
}: {
  editingProject: ExecutionProject | null;
  isDatabaseConfigured: boolean;
  projects: Awaited<ReturnType<typeof listProjectsWithStats>>;
}) {
  const activeProjects = projects.filter((project) => project.status === "Active");
  const archivedProjects = projects.filter(
    (project) => project.status === "Archived"
  );

  return (
    <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
              Projects Hub
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-950">
              Projects
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
              Organize tasks, memories, and knowledge around the work that
              actually matters.
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white">
            <FolderKanban size={22} strokeWidth={1.8} />
          </div>
        </div>

        {!isDatabaseConfigured ? (
          <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Configure authentication and PostgreSQL to manage projects.
          </div>
        ) : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total projects" value={projects.length} />
          <SummaryCard label="Active" value={activeProjects.length} />
          <SummaryCard label="Archived" value={archivedProjects.length} />
          <SummaryCard
            label="Completed tasks"
            value={projects.reduce(
              (total, project) => total + project.completedTasks,
              0
            )}
          />
        </div>

        <div className="grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-stone-700">
                No projects found.
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Create the first project from the panel on the right.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>

      <ProjectForm
        editingProject={editingProject}
        isDatabaseConfigured={isDatabaseConfigured}
      />
    </section>
  );
}

function ProjectCard({
  project
}: {
  project: Awaited<ReturnType<typeof listProjectsWithStats>>[number];
}) {
  return (
    <article className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ProjectIcon color={project.color} icon={project.icon} />
            <StatusBadge status={project.status} />
            <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
              {project.priority} priority
            </span>
          </div>
          <Link
            className="text-xl font-semibold text-stone-950 transition hover:text-stone-700"
            href={`/projects/${project.id}`}
          >
            {project.name}
          </Link>
          {project.description ? (
            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-stone-600">
              {project.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
            <InfoPill icon={Layers3} label={project.currentPhase} />
            <InfoPill
              icon={CalendarDays}
              label={
                project.targetDate
                  ? `Target ${formatDate(project.targetDate)}`
                  : "No target date"
              }
            />
            <InfoPill
              icon={CircleDot}
              label={`Last activity ${formatRelativeDate(project.lastActivity)}`}
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link
            aria-label={`Edit ${project.name}`}
            className="inline-flex size-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
            href={`/projects?edit=${project.id}`}
          >
            <Pencil size={16} strokeWidth={1.8} />
          </Link>
          {project.status !== "Archived" ? (
            <form action={archiveProjectAction}>
              <input name="id" type="hidden" value={project.id} />
              <button
                aria-label={`Archive ${project.name}`}
                className="inline-flex size-9 items-center justify-center rounded-md border border-stone-200 text-stone-600 transition hover:bg-stone-50"
                type="submit"
              >
                <Archive size={16} strokeWidth={1.8} />
              </button>
            </form>
          ) : null}
          <form action={deleteProjectAction}>
            <input name="id" type="hidden" value={project.id} />
            <button
              aria-label={`Delete ${project.name}`}
              className="inline-flex size-9 items-center justify-center rounded-md border border-stone-200 text-red-600 transition hover:bg-red-50"
              type="submit"
            >
              <Trash2 size={16} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-stone-700">Progress</span>
          <span className="font-semibold text-stone-950">
            {project.progress}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-stone-950"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CheckCircle2}
          label="Tasks"
          value={`${project.completedTasks}/${project.taskCount}`}
        />
        <MetricCard
          icon={MemoryStick}
          label="Memories"
          value={project.memoriesCount}
        />
        <MetricCard
          icon={Layers3}
          label="Knowledge"
          value={project.knowledgeCount}
        />
        <MetricCard
          icon={Flag}
          label="Phase"
          value={project.currentPhase}
        />
      </div>
    </article>
  );
}

function ProjectForm({
  editingProject,
  isDatabaseConfigured
}: {
  editingProject: ExecutionProject | null;
  isDatabaseConfigured: boolean;
}) {
  const action = editingProject ? updateProjectAction : createProjectAction;

  return (
    <aside className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700">
          <Plus size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950">
            {editingProject ? "Edit Project" : "Create Project"}
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            Saved to PostgreSQL for this account.
          </p>
        </div>
      </div>

      <form action={action} className="grid gap-4">
        {editingProject ? (
          <input name="id" type="hidden" value={editingProject.id} />
        ) : null}
        <Field label="Name">
          <input
            className={inputClassName}
            defaultValue={editingProject?.name ?? ""}
            disabled={!isDatabaseConfigured}
            name="name"
            placeholder="GIS Portfolio"
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputClassName} min-h-24 resize-y py-2 leading-6`}
            defaultValue={editingProject?.description ?? ""}
            disabled={!isDatabaseConfigured}
            name="description"
            placeholder="What this project is responsible for"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              className={inputClassName}
              defaultValue={editingProject?.status ?? "Active"}
              disabled={!isDatabaseConfigured}
              name="status"
            >
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>
          </Field>
          <Field label="Priority">
            <select
              className={inputClassName}
              defaultValue={editingProject?.priority ?? "Medium"}
              disabled={!isDatabaseConfigured}
              name="priority"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Field>
        </div>
        <Field label="Current Phase">
          <input
            className={inputClassName}
            defaultValue={editingProject?.currentPhase ?? "Planning"}
            disabled={!isDatabaseConfigured}
            name="currentPhase"
            placeholder="Planning"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Progress %">
            <input
              className={inputClassName}
              defaultValue={editingProject?.progress ?? 0}
              disabled={!isDatabaseConfigured}
              max={100}
              min={0}
              name="progress"
              type="number"
            />
          </Field>
          <Field label="Target Date">
            <input
              className={inputClassName}
              defaultValue={formatDateInput(editingProject?.targetDate ?? null)}
              disabled={!isDatabaseConfigured}
              name="targetDate"
              type="date"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Color">
            <select
              className={inputClassName}
              defaultValue={editingProject?.color ?? "stone"}
              disabled={!isDatabaseConfigured}
              name="color"
            >
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Icon">
            <select
              className={inputClassName}
              defaultValue={editingProject?.icon ?? "folder"}
              disabled={!isDatabaseConfigured}
              name="icon"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          {editingProject ? (
            <Link
              className="text-sm font-medium text-stone-500 transition hover:text-stone-950"
              href="/projects"
            >
              Cancel
            </Link>
          ) : (
            <span />
          )}
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!isDatabaseConfigured}
            type="submit"
          >
            {editingProject ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <Icon className="mb-2 text-stone-500" size={17} strokeWidth={1.8} />
      <p className="text-sm font-semibold text-stone-950">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
        {label}
      </p>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label
}: {
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2 py-1">
      <Icon size={14} strokeWidth={1.8} />
      {label}
    </span>
  );
}

function ProjectIcon({ color, icon }: { color: string; icon: string }) {
  const colorClassName =
    {
      blue: "bg-blue-100 text-blue-700",
      green: "bg-green-100 text-green-700",
      orange: "bg-orange-100 text-orange-700",
      purple: "bg-purple-100 text-purple-700",
      red: "bg-red-100 text-red-700",
      stone: "bg-stone-100 text-stone-700"
    }[color] ?? "bg-stone-100 text-stone-700";

  return (
    <span
      className={`inline-flex size-8 items-center justify-center rounded-md ${colorClassName}`}
      title={icon}
    >
      <FolderKanban size={16} strokeWidth={1.8} />
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-md bg-stone-950 px-2 py-1 text-xs font-medium text-white">
      {status}
    </span>
  );
}

function Field({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-10 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-stone-100";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatDateInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatRelativeDate(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays <= 0) {
    return "today";
  }

  if (diffDays === 1) {
    return "yesterday";
  }

  return `${diffDays} days ago`;
}

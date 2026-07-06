import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { and, asc, desc, eq } from "drizzle-orm";
import { getDb, executionTasks, memories, projectKnowledgeLinks } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { getProjectForUser } from "@/lib/projects";
import { createTaskAction } from "@/app/projects/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Details | RAFA OS",
  description: "View project tasks, memories, and knowledge links."
};

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProjectDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) { notFound(); }
  const user = await requireCurrentDbUser();
  const project = await getProjectForUser(id, user.id);

  if (!project) {
    notFound();
  }

  const db = getDb();
  const [tasks, memoryList, knowledgeLinks] = await Promise.all([
    db
      .select()
      .from(executionTasks)
      .where(and(eq(executionTasks.projectId, id), eq(executionTasks.userId, user.id)))
      .orderBy(asc(executionTasks.taskDate)),
    db
      .select()
      .from(memories)
      .where(and(eq(memories.projectId, id), eq(memories.userId, user.id)))
      .orderBy(desc(memories.updatedAt)),
    db
      .select()
      .from(projectKnowledgeLinks)
      .where(and(eq(projectKnowledgeLinks.projectId, id), eq(projectKnowledgeLinks.userId, user.id)))
  ]);

  const doneCount = tasks.filter((t) => t.status === "Done").length;

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-stone-950"
          href="/projects"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to projects
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-600">
                {project.status}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950">
                {project.name}
              </h2>
              {project.description ? (
                <p className="mt-3 max-w-2xl whitespace-pre-wrap text-base leading-7 text-stone-600">
                  {project.description}
                </p>
              ) : null}
            </div>
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
              href={`/projects?edit=${project.id}`}
            >
              Edit project
            </Link>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Progress" value={`${project.progress}%`} />
            <StatCard label="Phase" value={project.currentPhase} />
            <StatCard label="Priority" value={project.priority} />
          </div>

          <div className="mb-8 h-3 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-950"
              style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }}
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-stone-950">
              Tasks ({doneCount}/{tasks.length})
            </h3>
          </div>

          <div className="grid gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-md border border-dashed border-stone-300 bg-white p-6 text-center">
                <p className="text-sm font-medium text-stone-700">
                  No tasks yet.
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Add a task using the form on the right.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))
            )}
          </div>

          {memoryList.length > 0 ? (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold text-stone-950">
                Related Memories ({memoryList.length})
              </h3>
              <div className="grid gap-3">
                {memoryList.map((memory) => (
                  <Link
                    className="rounded-md border border-stone-200 bg-white p-4 transition hover:border-stone-400"
                    href={`/memory?edit=${memory.id}`}
                    key={memory.id}
                  >
                    <p className="text-sm font-semibold text-stone-950">{memory.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{memory.category}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-6">
          <ProjectTaskForm projectId={project.id} />

          {knowledgeLinks.length > 0 ? (
            <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-stone-950">
                Knowledge Links ({knowledgeLinks.length})
              </h3>
              <div className="grid gap-2">
                {knowledgeLinks.map((link) => (
                  <div
                    className="rounded-md border border-stone-200 p-3"
                    key={link.id}
                  >
                    <p className="text-sm font-semibold text-stone-950">{link.title}</p>
                    <p className="mt-1 break-all text-xs text-stone-600">{link.filePath}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">{label}</p>
      <p className="mt-2 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function TaskRow({ task }: { task: typeof executionTasks.$inferSelect }) {
  const statusColors: Record<string, string> = {
    Todo: "text-stone-600 bg-stone-100",
    "In Progress": "text-amber-800 bg-amber-50",
    Done: "text-emerald-700 bg-emerald-50"
  };

  return (
    <article className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-1 text-xs font-medium ${statusColors[task.status] ?? statusColors.Todo}`}>
              {task.status}
            </span>
            <span className="text-xs text-stone-600">
              {task.estimatedMinutes} min
            </span>
            {task.taskDate ? (
              <span className="text-xs text-stone-600">
                {formatDate(task.taskDate)}
              </span>
            ) : null}
          </div>
          <p className={`text-sm font-semibold ${task.status === "Done" ? "text-stone-600 line-through" : "text-stone-950"}`}>
            {task.title}
          </p>
        </div>
      </div>
    </article>
  );
}

function ProjectTaskForm({ projectId }: { projectId: string }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 text-stone-700">
          <Plus size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-stone-950">Add Task</h3>
          <p className="mt-1 text-sm text-stone-600">Create a new task for this project.</p>
        </div>
      </div>

      <form action={createTaskAction} className="grid gap-4">
        <input name="projectId" type="hidden" value={projectId} />
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Title</span>
          <input
            className="h-10 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            name="title"
            placeholder="What needs to be done?"
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Priority</span>
            <select
              className="h-10 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
              defaultValue="Medium"
              name="priority"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-stone-700">Minutes</span>
            <input
              className="h-10 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
              defaultValue={30}
              min={5}
              name="estimatedMinutes"
              type="number"
            />
          </label>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
          type="submit"
        >
          Add Task
        </button>
      </form>
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short"
  }).format(date);
}

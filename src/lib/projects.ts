import { and, count, desc, eq, ne } from "drizzle-orm";
import {
  executionProjects,
  executionTasks,
  getDb,
  isDatabaseConfigured,
  memories,
  projectKnowledgeLinks,
  type ExecutionProject
} from "@/db";

export type ProjectStatus = "Active" | "Paused" | "Completed" | "Archived";
export type ProjectPriority = "High" | "Medium" | "Low";

export const projectStatuses = [
  "Active",
  "Paused",
  "Completed",
  "Archived"
] as const;

export const projectPriorities = ["High", "Medium", "Low"] as const;

export type ProjectFormValues = {
  color: string;
  currentPhase: string;
  description: string;
  icon: string;
  name: string;
  priority: ProjectPriority;
  progress: number;
  status: ProjectStatus;
  targetDate: Date | null;
};

export type ProjectWithStats = ExecutionProject & {
  completedTasks: number;
  knowledgeCount: number;
  lastActivity: Date;
  memoriesCount: number;
  taskCount: number;
};

export async function listProjectsWithStats(
  userId: string,
  limit = 50,
  offset = 0
) {
  if (!isDatabaseConfigured()) return { items: [], total: 0 };

  const db = getDb();
  const whereProjects = and(
    eq(executionProjects.userId, userId),
    ne(executionProjects.status, "Deleted")
  );
  const [projects, tasks, memoryRows, knowledgeRows, totalResult] =
    await Promise.all([
      db
        .select()
        .from(executionProjects)
        .where(whereProjects)
        .orderBy(desc(executionProjects.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({
          completedAt: executionTasks.completedAt,
          projectId: executionTasks.projectId,
          status: executionTasks.status,
          updatedAt: executionTasks.updatedAt
        })
        .from(executionTasks)
        .where(eq(executionTasks.userId, userId)),
      db
        .select({
          projectId: memories.projectId,
          updatedAt: memories.updatedAt
        })
        .from(memories)
        .where(eq(memories.userId, userId)),
      db
        .select({
          projectId: projectKnowledgeLinks.projectId,
          updatedAt: projectKnowledgeLinks.updatedAt
        })
        .from(projectKnowledgeLinks)
        .where(eq(projectKnowledgeLinks.userId, userId)),
      db
        .select({ value: count() })
        .from(executionProjects)
        .where(whereProjects)
    ]);

  const items = projects.map((project): ProjectWithStats => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const projectMemories = memoryRows.filter(
      (memory) => memory.projectId === project.id
    );
    const projectKnowledge = knowledgeRows.filter(
      (knowledge) => knowledge.projectId === project.id
    );
    const activityDates = [
      project.updatedAt,
      ...projectTasks.map((task) => task.updatedAt),
      ...projectMemories.map((memory) => memory.updatedAt),
      ...projectKnowledge.map((knowledge) => knowledge.updatedAt)
    ];

    return {
      ...project,
      completedTasks: projectTasks.filter((task) => task.status === "Done")
        .length,
      knowledgeCount: projectKnowledge.length,
      lastActivity: maxDate(activityDates),
      memoriesCount: projectMemories.length,
      taskCount: projectTasks.length
    };
  });

  return { items, total: Number(totalResult[0]?.value ?? 0) };
}

export async function getProjectForUser(id: string, userId: string) {
  if (!isDatabaseConfigured()) return null;

  const [project] = await getDb()
    .select()
    .from(executionProjects)
    .where(and(eq(executionProjects.id, id), eq(executionProjects.userId, userId)))
    .limit(1);

  return project ?? null;
}

export async function createProject(userId: string, values: ProjectFormValues) {
  if (!isDatabaseConfigured()) return null;

  const [project] = await getDb()
    .insert(executionProjects)
    .values({
      userId,
      ...values
    })
    .returning();

  return project;
}

export async function updateProject({
  id,
  userId,
  values
}: {
  id: string;
  userId: string;
  values: ProjectFormValues;
}) {
  if (!isDatabaseConfigured()) return null;

  const [project] = await getDb()
    .update(executionProjects)
    .set({
      ...values,
      updatedAt: new Date()
    })
    .where(and(eq(executionProjects.id, id), eq(executionProjects.userId, userId)))
    .returning();

  return project ?? null;
}

export async function archiveProject(id: string, userId: string) {
  if (!isDatabaseConfigured()) return;

  await getDb()
    .update(executionProjects)
    .set({
      status: "Archived",
      updatedAt: new Date()
    })
    .where(and(eq(executionProjects.id, id), eq(executionProjects.userId, userId)));
}

export async function deleteProject(id: string, userId: string) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(executionTasks)
      .where(and(eq(executionTasks.projectId, id), eq(executionTasks.userId, userId)));
    await tx
      .update(memories)
      .set({
        projectId: null,
        updatedAt: new Date()
      })
      .where(and(eq(memories.projectId, id), eq(memories.userId, userId)));
    await tx
      .delete(projectKnowledgeLinks)
      .where(
        and(
          eq(projectKnowledgeLinks.projectId, id),
          eq(projectKnowledgeLinks.userId, userId)
        )
      );
    await tx
      .delete(executionProjects)
      .where(and(eq(executionProjects.id, id), eq(executionProjects.userId, userId)));
  });
}

function maxDate(dates: Date[]) {
  return dates.reduce((latest, date) => (date > latest ? date : latest), dates[0]);
}

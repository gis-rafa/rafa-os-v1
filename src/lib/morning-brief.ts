import type { ActiveContextField } from "@/lib/master-brain";
import { getStudyPlanSummary } from "@/lib/study-plan";
import { getDb, isDatabaseConfigured, executionTasks, executionProjects } from "@/db";
import { and, eq, gte, lt } from "drizzle-orm";

export type MorningBrief = {
  dateLabel: string;
  roadmapDay: number;
  primaryObjective: string;
  weeklyPriority: string;
  gisStudyTask: string;
  activeProject: string;
  healthReminder: string;
  relationshipReminder: string | null;
  biggestRisk: string;
  nextAction: string;
};

export async function generateMorningBrief(
  activeContext: ActiveContextField[],
  userId: string
): Promise<MorningBrief> {
  const values = new Map(activeContext.map((field) => [field.label, field.value]));
  const today = new Date();
  const studyPlan = await getStudyPlanSummary(userId);
  const roadmapTask = studyPlan.todayTask;
  const primaryObjective = valueFor(values, "Current Top Goal");
  const weeklyPriority = valueFor(values, "Current Weekly Priority");
  const relationshipStatus = valueFor(values, "Current Relationship Status");
  const healthFocus = valueFor(values, "Current Health Focus");
  const healthStatus = await getTodayHealthSummary(userId);

  return {
    dateLabel: new Intl.DateTimeFormat("en", {
      dateStyle: "full"
    }).format(today),
    roadmapDay: roadmapTask?.day ?? 1,
    primaryObjective,
    weeklyPriority,
    gisStudyTask: roadmapTask
      ? [
          `Day ${roadmapTask.day}: ${roadmapTask.gisTask}`,
          `Deliverable: ${roadmapTask.deliverable}`
        ].join("\n")
      : "TODO",
    activeProject: valueFor(values, "Current Career Focus"),
    healthReminder: healthStatus ? `${healthFocus} | ${healthStatus}` : healthFocus,
    relationshipReminder: isRelevantRelationshipStatus(relationshipStatus)
      ? relationshipStatus
      : null,
    biggestRisk: valueFor(values, "Current Biggest Challenge"),
    nextAction: roadmapTask
      ? `Move Day ${roadmapTask.day} from ${roadmapTask.status} to Done: ${roadmapTask.gisTask}.`
      : "Open the weekly priority and choose the first visible action."
  };
}

function valueFor(values: Map<string, string>, label: string) {
  const value = values.get(label)?.trim();
  return value && value !== "TODO" ? value : "TODO";
}

function isRelevantRelationshipStatus(value: string) {
  return value !== "TODO" && value.length > 0;
}

async function getTodayHealthSummary(userId: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [healthProject] = await db
    .select({ id: executionProjects.id })
    .from(executionProjects)
    .where(
      and(
        eq(executionProjects.userId, userId),
        eq(executionProjects.name, "Health & Daily")
      )
    )
    .limit(1);

  if (!healthProject) return null;

  const todayHealthTasks = await db
    .select({ title: executionTasks.title, status: executionTasks.status })
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        eq(executionTasks.projectId, healthProject.id),
        gte(executionTasks.taskDate, today),
        lt(executionTasks.taskDate, tomorrow)
      )
    )
    .orderBy(executionTasks.title);

  if (todayHealthTasks.length === 0) return null;

  const done = todayHealthTasks.filter((t) => t.status === "Done").length;
  return `${done}/${todayHealthTasks.length} health items completed today.`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

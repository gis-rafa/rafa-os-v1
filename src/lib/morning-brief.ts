import type { ActiveContextField } from "@/lib/master-brain";
import { getStudyPlanSummary } from "@/lib/study-plan";
import { getDb, isDatabaseConfigured, executionTasks, executionProjects } from "@/db";
import { and, eq, gte, lt } from "drizzle-orm";
import { getToday, getTomorrow } from "@/lib/date-service";

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
  userId: string,
  timezone?: string
): Promise<MorningBrief> {
  const values = new Map(activeContext.map((field) => [field.label, field.value]));
  const today = getToday(timezone);
  const studyPlan = await getStudyPlanSummary(userId);
  const roadmapTask = studyPlan.todayTask;
  const primaryObjective = valueFor(values, "Current Top Goal");
  const weeklyPriority = valueFor(values, "Current Weekly Priority");
  const relationshipStatus = valueFor(values, "Current Relationship Status");
  const healthFocus = valueFor(values, "Current Health Focus");
  const healthStatus = await getTodayHealthSummary(userId, timezone);

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

async function getTodayHealthSummary(userId: string, timezone?: string): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();
  const today = getToday(timezone);
  const tomorrow = getTomorrow(timezone);

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

import type { ActiveContextField } from "@/lib/master-brain";
import { getStudyPlanSummary } from "@/lib/study-plan";

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
    healthReminder: healthFocus,
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

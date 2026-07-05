import { asc, eq } from "drizzle-orm";
import { getDb, studyTaskProgress, roadmapTasks } from "@/db";

export const studyTaskStatuses = ["Todo", "In Progress", "Done"] as const;

export type StudyTaskStatus = (typeof studyTaskStatuses)[number];

export type RoadmapTask = {
  day: number;
  gisTask: string;
  supportTask: string;
  deliverable: string;
  week: number;
  phase: string;
};

export type StudyTaskWithProgress = RoadmapTask & {
  status: StudyTaskStatus;
};

export type StudyPlanSummary = {
  tasks: StudyTaskWithProgress[];
  todayTask: StudyTaskWithProgress | null;
  tomorrowTask: StudyTaskWithProgress | null;
  completionPercentage: number;
  currentWeek: number;
  currentPhase: string;
  doneCount: number;
  totalCount: number;
};

export async function getStudyPlanSummary(
  userId?: string
): Promise<StudyPlanSummary> {
  const db = getDb();
  const [allTasks, progressRows] = await Promise.all([
    db
      .select()
      .from(roadmapTasks)
      .orderBy(asc(roadmapTasks.day)),
    userId
      ? db
          .select()
          .from(studyTaskProgress)
          .where(eq(studyTaskProgress.userId, userId))
          .orderBy(asc(studyTaskProgress.roadmapDay))
      : []
  ]);
  const progressByDay = new Map(
    progressRows.map((row) => [row.roadmapDay, row.status as StudyTaskStatus])
  );
  const tasks = allTasks.map((task) => ({
    day: task.day,
    gisTask: task.gisTask,
    supportTask: task.supportTask,
    deliverable: task.deliverable,
    week: task.week,
    phase: task.phase,
    status: normalizeStatus(progressByDay.get(task.day))
  }));
  const doneCount = tasks.filter((task) => task.status === "Done").length;
  const activeTask =
    tasks.find((task) => task.status === "In Progress") ??
    tasks.find((task) => task.status !== "Done") ??
    tasks.at(-1) ??
    null;
  const tomorrowTask = activeTask
    ? tasks.find((task) => task.day > activeTask.day && task.status !== "Done") ??
      tasks.find((task) => task.day === activeTask.day + 1) ??
      null
    : null;

  return {
    tasks,
    todayTask: activeTask,
    tomorrowTask,
    completionPercentage:
      tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0,
    currentWeek: activeTask?.week ?? 1,
    currentPhase: activeTask?.phase ?? "GIS Foundation",
    doneCount,
    totalCount: tasks.length
  };
}

export async function updateStudyTaskStatus({
  day,
  status,
  userId
}: {
  day: number;
  status: StudyTaskStatus;
  userId: string;
}) {
  const db = getDb();

  await db
    .insert(studyTaskProgress)
    .values({
      userId,
      roadmapDay: day,
      status
    })
    .onConflictDoUpdate({
      target: [studyTaskProgress.userId, studyTaskProgress.roadmapDay],
      set: {
        status,
        updatedAt: new Date()
      }
    });
}

function normalizeStatus(value: string | undefined): StudyTaskStatus {
  return studyTaskStatuses.find((status) => status === value) ?? "Todo";
}

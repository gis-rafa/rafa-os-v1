import { readFile } from "node:fs/promises";
import path from "node:path";
import { asc, eq } from "drizzle-orm";
import { getDb, studyTaskProgress } from "@/db";
import { dataRoot } from "@/lib/paths";

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

const canonicalSourcePath = path.join(
  dataRoot,
  "import",
  "URUGUAY_AGRICULTURAL_GIS_EXECUTION_PLAN.md"
);

const executionPlanFolder = path.join(
  dataRoot,
  "02-knowledge",
  "uruguay-agricultural-gis",
  "02-execution-plan"
);

const executionFiles = [
  "week-1-qgis-foundation-reset.md",
  "week-2-uruguay-data-and-map-discipline.md",
  "week-3-soil-mapping-with-coneat.md",
  "week-4-land-suitability-foundations.md",
  "days-29-30-month-1-sprint-close.md",
  "days-31-35-case-study-1-completion.md",
  "week-6-remote-sensing-basics.md",
  "week-7-google-earth-engine-intro.md",
  "week-8-case-study-2-completion.md",
  "week-9-freelance-service-design.md",
  "week-10-case-study-3-land-due-diligence.md",
  "week-11-master-s-preparation-begins.md",
  "week-12-portfolio-website-and-outreach.md",
  "week-13-90-day-review-and-launch.md"
];

export async function getStudyPlanSummary(
  userId?: string
): Promise<StudyPlanSummary> {
  const [roadmapTasks, progressRows] = await Promise.all([
    readRoadmapTasks(),
    userId ? getStudyProgress(userId) : []
  ]);
  const progressByDay = new Map(
    progressRows.map((row) => [row.roadmapDay, row.status as StudyTaskStatus])
  );
  const tasks = roadmapTasks.map((task) => ({
    ...task,
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

export async function readRoadmapStartDate() {
  const source = await readFile(canonicalSourcePath, "utf8");
  const match = source.match(/\*\*Current date:\*\*\s+(\d{4}-\d{2}-\d{2})/);

  if (!match) {
    return new Date();
  }

  return parseDateOnly(match[1]);
}

export async function readRoadmapTasks() {
  const files = await Promise.all(
    executionFiles.map(async (file) =>
      readFile(path.join(executionPlanFolder, file), "utf8")
    )
  );

  return files
    .flatMap(parseRoadmapTasks)
    .sort((first, second) => first.day - second.day);
}

async function getStudyProgress(userId: string) {
  return getDb()
    .select()
    .from(studyTaskProgress)
    .where(eq(studyTaskProgress.userId, userId))
    .orderBy(asc(studyTaskProgress.roadmapDay));
}

function parseRoadmapTasks(markdown: string): RoadmapTask[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 4)
    .map(([day, gisTask, supportTask, deliverable]) => {
      const roadmapDay = Number(day);

      return {
        day: roadmapDay,
        gisTask,
        supportTask,
        deliverable,
        week: Math.max(1, Math.ceil(roadmapDay / 7)),
        phase: phaseForDay(roadmapDay)
      };
    })
    .filter((task) => Number.isFinite(task.day));
}

function normalizeStatus(value: string | undefined): StudyTaskStatus {
  return studyTaskStatuses.find((status) => status === value) ?? "Todo";
}

function phaseForDay(day: number) {
  if (day <= 30) {
    return "Month 1 GIS Sprint";
  }

  if (day <= 60) {
    return "Case Studies and Remote Sensing";
  }

  if (day <= 90) {
    return "Freelance, Master's, and Launch";
  }

  return "90-Day Review";
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

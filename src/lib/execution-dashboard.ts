import { and, asc, desc, eq, gte, isNotNull, lt, ne } from "drizzle-orm";
import {
  executionPriorities,
  executionProjects,
  executionTasks,
  getDb,
  memories
} from "@/db";
import { getStudyPlanSummary } from "@/lib/study-plan";

export type ExecutionTaskStatus = "Todo" | "In Progress" | "Done";

export const executionTaskStatuses = [
  "Todo",
  "In Progress",
  "Done"
] as const;

export type ExecutionDashboardData = Awaited<
  ReturnType<typeof getExecutionDashboardData>
>;

export async function getExecutionDashboardData(userId: string) {
  await adaptExecutionPlan(userId);

  const db = getDb();
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = addDays(dayStart, 1);
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const [
    priorities,
    activeProjects,
    todaysTasks,
    weeklyTasks,
    latestImportantMemory,
    latestMemories,
    overdueTasks,
    recentCompletedTasks,
    studyPlan
  ] = await Promise.all([
    db
      .select()
      .from(executionPriorities)
      .where(
        and(
          eq(executionPriorities.userId, userId),
          gte(executionPriorities.priorityDate, dayStart),
          lt(executionPriorities.priorityDate, dayEnd)
        )
      )
      .orderBy(desc(executionPriorities.updatedAt)),
    db
      .select()
      .from(executionProjects)
      .where(
        and(
          eq(executionProjects.userId, userId),
          eq(executionProjects.status, "Active")
        )
      )
      .orderBy(desc(executionProjects.updatedAt)),
    db
      .select({
        id: executionTasks.id,
        title: executionTasks.title,
        status: executionTasks.status,
        priority: executionTasks.priority,
        estimatedMinutes: executionTasks.estimatedMinutes,
        projectName: executionProjects.name,
        updatedAt: executionTasks.updatedAt
      })
      .from(executionTasks)
      .leftJoin(
        executionProjects,
        eq(executionTasks.projectId, executionProjects.id)
      )
      .where(
        and(
          eq(executionTasks.userId, userId),
          gte(executionTasks.taskDate, dayStart),
          lt(executionTasks.taskDate, dayEnd)
        )
      )
      .orderBy(desc(executionTasks.updatedAt)),
    db
      .select()
      .from(executionTasks)
      .where(
        and(
          eq(executionTasks.userId, userId),
          gte(executionTasks.taskDate, weekStart),
          lt(executionTasks.taskDate, weekEnd)
        )
      ),
    db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.importance), desc(memories.updatedAt))
      .limit(1),
    db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.updatedAt))
      .limit(3),
    db
      .select({
        id: executionTasks.id,
        title: executionTasks.title,
        status: executionTasks.status,
        priority: executionTasks.priority,
        estimatedMinutes: executionTasks.estimatedMinutes,
        projectName: executionProjects.name,
        taskDate: executionTasks.taskDate,
        updatedAt: executionTasks.updatedAt
      })
      .from(executionTasks)
      .leftJoin(
        executionProjects,
        eq(executionTasks.projectId, executionProjects.id)
      )
      .where(
        and(
          eq(executionTasks.userId, userId),
          lt(executionTasks.taskDate, dayStart),
          ne(executionTasks.status, "Done")
        )
      )
      .orderBy(asc(executionTasks.taskDate))
      .limit(8),
    db
      .select({
        id: executionTasks.id,
        title: executionTasks.title,
        completedAt: executionTasks.completedAt,
        projectName: executionProjects.name
      })
      .from(executionTasks)
      .leftJoin(
        executionProjects,
        eq(executionTasks.projectId, executionProjects.id)
      )
      .where(
        and(
          eq(executionTasks.userId, userId),
          eq(executionTasks.status, "Done"),
          isNotNull(executionTasks.completedAt)
        )
      )
      .orderBy(desc(executionTasks.completedAt))
      .limit(5),
    getStudyPlanSummary(userId)
  ]);
  const sortedPriorities = sortMissionPriorities(priorities).slice(0, 3);
  const sortedTodaysTasks = sortMissionTasks(todaysTasks);
  const completedToday = sortedTodaysTasks.filter((task) => task.status === "Done");
  const weeklyDone = weeklyTasks.filter((task) => task.status === "Done").length;
  const weeklyCompletionPercentage =
    weeklyTasks.length > 0 ? Math.round((weeklyDone / weeklyTasks.length) * 100) : 0;
  const portfolioCompletion = getProjectProgress(activeProjects, "portfolio");
  const personalBrandingGrowth = getProjectProgress(activeProjects, "brand");
  const englishCompletion = getProjectProgress(activeProjects, "english");
  const remoteJobReadiness = calculateRemoteJobReadiness({
    activeProjects,
    roadmapCompletion: studyPlan.completionPercentage
  });
  const missionCompletion = calculateMissionCompletion({
    englishCompletion,
    personalBrandingGrowth,
    portfolioCompletion,
    roadmapCompletion: studyPlan.completionPercentage
  });
  const activeProject = selectActiveMissionProject(activeProjects);
  const earliestProjectDate = activeProjects
    .map((project) => project.createdAt)
    .sort((first, second) => first.getTime() - second.getTime())[0] ?? now;

  return {
    activeFocus: studyPlan.todayTask?.gisTask ?? "No active study task",
    activeProject: activeProject?.name ?? "GIS Study",
    activeProjects,
    activeStreak: calculateActiveStreak(weeklyTasks),
    completionPercentageThisWeek: weeklyCompletionPercentage,
    currentDate: now,
    currentPhase: studyPlan.currentPhase,
    currentWeek: studyPlan.currentWeek,
    executionPace: calculateExecutionPace({
      daysBehind: overdueTasks.length,
      roadmapCompletion: studyPlan.completionPercentage,
      week: studyPlan.currentWeek
    }),
    daysRemainingToSixMonthTarget: Math.max(
      0,
      Math.ceil(
        (addDays(startOfDay(earliestProjectDate), 180).getTime() -
          startOfDay(now).getTime()) /
          86_400_000
      )
    ),
    englishCompletion,
    latestImportantMemory: latestImportantMemory.at(0) ?? null,
    latestMemories,
    missionCompletion,
    missionMilestones: {
      english: nextMilestone(englishCompletion, "English communication"),
      personalBranding: nextMilestone(personalBrandingGrowth, "Personal branding"),
      portfolio: nextMilestone(portfolioCompletion, "Portfolio"),
      remoteJobReadiness: nextMilestone(remoteJobReadiness, "Remote job readiness"),
      roadmap: nextMilestone(studyPlan.completionPercentage, "GIS roadmap")
    },
    overdueTasks,
    portfolioCompletion,
    priorities: sortedPriorities,
    remoteJobReadiness,
    recentCompletedTasks,
    recoveryPlan: buildRecoveryPlan(overdueTasks.length),
    personalBrandingGrowth,
    primaryObjective:
      sortedPriorities[0]?.title ??
      "Complete today's GIS roadmap work before starting lower-priority work.",
    roadmapCompletion: studyPlan.completionPercentage,
    secondaryObjective:
      sortedPriorities[1]?.title ?? "Move the GIS portfolio one step forward.",
    tasksCompletedToday: completedToday.length,
    tasksRemainingToday: sortedTodaysTasks.length - completedToday.length,
    thirdObjective:
      sortedPriorities[2]?.title ??
      "Publish or draft one Personal Branding proof-of-work action.",
    todaysTasks: sortedTodaysTasks,
    weeklyCompletionPercentage
  };
}

export async function updatePriorityCompletion({
  completed,
  priorityId,
  userId
}: {
  completed: boolean;
  priorityId: string;
  userId: string;
}) {
  await getDb()
    .update(executionPriorities)
    .set({
      completedAt: completed ? new Date() : null,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(executionPriorities.id, priorityId),
        eq(executionPriorities.userId, userId)
      )
    );
}

export async function createExecutionTask({
  userId,
  projectId,
  title,
  priority,
  estimatedMinutes
}: {
  userId: string;
  projectId: string;
  title: string;
  priority: string;
  estimatedMinutes: number;
}) {
  const db = getDb();
  const [task] = await db
    .insert(executionTasks)
    .values({
      userId,
      projectId,
      title,
      priority,
      estimatedMinutes,
      taskDate: new Date()
    })
    .returning();

  return task;
}

export async function updateExecutionTaskStatus({
  status,
  taskId,
  userId
}: {
  status: ExecutionTaskStatus;
  taskId: string;
  userId: string;
}) {
  await getDb()
    .update(executionTasks)
    .set({
      completedAt: status === "Done" ? new Date() : null,
      status,
      updatedAt: new Date()
    })
    .where(and(eq(executionTasks.id, taskId), eq(executionTasks.userId, userId)));

  await updateProjectProgressFromTask(taskId, userId);
}

async function adaptExecutionPlan(userId: string) {
  const db = getDb();
  const today = startOfDay(new Date());
  const staleTasks = await db
    .select()
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        lt(executionTasks.taskDate, today),
        ne(executionTasks.status, "Done")
      )
    )
    .orderBy(asc(executionTasks.taskDate), desc(executionTasks.priority));

  if (staleTasks.length === 0) {
    return;
  }

  const scheduledByDay = new Map<string, number>();
  const futureTasks = await db
    .select({
      estimatedMinutes: executionTasks.estimatedMinutes,
      taskDate: executionTasks.taskDate
    })
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        gte(executionTasks.taskDate, today),
        ne(executionTasks.status, "Done")
      )
    );

  for (const task of futureTasks) {
    const key = dayKey(task.taskDate);
    scheduledByDay.set(
      key,
      (scheduledByDay.get(key) ?? 0) + task.estimatedMinutes
    );
  }

  for (const task of staleTasks) {
    const targetDate = findNextAvailableMissionDay({
      estimatedMinutes: task.estimatedMinutes,
      scheduledByDay,
      startDate: today
    });
    const key = dayKey(targetDate);

    scheduledByDay.set(
      key,
      (scheduledByDay.get(key) ?? 0) + task.estimatedMinutes
    );

    await db
      .update(executionTasks)
      .set({
        taskDate: targetDate,
        updatedAt: new Date()
      })
      .where(eq(executionTasks.id, task.id));
  }
}

function findNextAvailableMissionDay({
  estimatedMinutes,
  scheduledByDay,
  startDate
}: {
  estimatedMinutes: number;
  scheduledByDay: Map<string, number>;
  startDate: Date;
}) {
  const dailyMissionCapacityMinutes = 240;
  let cursor = startOfDay(startDate);

  for (let attempt = 0; attempt < 90; attempt += 1) {
    const key = dayKey(cursor);
    const scheduledMinutes = scheduledByDay.get(key) ?? 0;

    if (scheduledMinutes + estimatedMinutes <= dailyMissionCapacityMinutes) {
      return cursor;
    }

    cursor = addDays(cursor, 1);
  }

  return cursor;
}

async function updateProjectProgressFromTask(taskId: string, userId: string) {
  const db = getDb();
  const [task] = await db
    .select({
      projectId: executionTasks.projectId
    })
    .from(executionTasks)
    .where(and(eq(executionTasks.id, taskId), eq(executionTasks.userId, userId)))
    .limit(1);

  if (!task?.projectId) {
    return;
  }

  const projectTasks = await db
    .select({
      status: executionTasks.status
    })
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        eq(executionTasks.projectId, task.projectId)
      )
    );

  if (projectTasks.length === 0) {
    return;
  }

  const doneCount = projectTasks.filter((item) => item.status === "Done").length;
  const progress = Math.round((doneCount / projectTasks.length) * 100);

  await db
    .update(executionProjects)
    .set({
      progress,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(executionProjects.id, task.projectId),
        eq(executionProjects.userId, userId)
      )
    );
}

function calculateActiveStreak(tasks: { status: string; taskDate: Date }[]) {
  const completedDays = new Set(
    tasks
      .filter((task) => task.status === "Done")
      .map((task) => startOfDay(task.taskDate).getTime())
  );
  let streak = 0;
  let cursor = startOfDay(new Date());

  while (completedDays.has(cursor.getTime())) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return addDays(startOfDay(date), mondayOffset);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function sortMissionPriorities<T extends { completedAt: Date | null; title: string }>(
  priorities: T[]
) {
  return [...priorities].sort(
    (first, second) =>
      priorityScore(second.title, Boolean(second.completedAt)) -
      priorityScore(first.title, Boolean(first.completedAt))
  );
}

function sortMissionTasks<T extends { priority: string; projectName: string | null; status: string; title: string }>(
  tasks: T[]
) {
  return [...tasks].sort(
    (first, second) =>
      taskScore(second) - taskScore(first)
  );
}

function priorityScore(title: string, isCompleted: boolean) {
  const normalized = title.toLowerCase();
  let score = 0;

  if (normalized.includes("gis")) {
    score += 100;
  }

  if (normalized.includes("portfolio")) {
    score += 80;
  }

  if (
    normalized.includes("brand") ||
    normalized.includes("linkedin") ||
    normalized.includes("content")
  ) {
    score += 70;
  }

  if (normalized.includes("english")) {
    score += 45;
  }

  if (normalized.includes("gym") || normalized.includes("training")) {
    score += 35;
  }

  return isCompleted ? score - 1_000 : score;
}

function taskScore(task: {
  priority: string;
  projectName: string | null;
  status: string;
  title: string;
}) {
  const text = `${task.projectName ?? ""} ${task.title}`.toLowerCase();
  let score = task.priority === "High" ? 20 : task.priority === "Medium" ? 10 : 0;

  if (text.includes("gis")) {
    score += 100;
  }

  if (text.includes("portfolio")) {
    score += 80;
  }

  if (text.includes("brand") || text.includes("linkedin")) {
    score += 70;
  }

  if (text.includes("english")) {
    score += 45;
  }

  if (text.includes("gym") || text.includes("training")) {
    score += 35;
  }

  return task.status === "Done" ? score - 1_000 : score;
}

function getProjectProgress(
  projects: { name: string; progress: number }[],
  keyword: string
) {
  return projects.find((project) =>
    project.name.toLowerCase().includes(keyword)
  )?.progress ?? 0;
}

function calculateRemoteJobReadiness({
  activeProjects,
  roadmapCompletion
}: {
  activeProjects: { name: string; progress: number }[];
  roadmapCompletion: number;
}) {
  const portfolio = getProjectProgress(activeProjects, "portfolio");
  const branding = getProjectProgress(activeProjects, "brand");

  return Math.round(roadmapCompletion * 0.45 + portfolio * 0.35 + branding * 0.2);
}

function calculateMissionCompletion({
  englishCompletion,
  personalBrandingGrowth,
  portfolioCompletion,
  roadmapCompletion
}: {
  englishCompletion: number;
  personalBrandingGrowth: number;
  portfolioCompletion: number;
  roadmapCompletion: number;
}) {
  return Math.round(
    roadmapCompletion * 0.45 +
      portfolioCompletion * 0.3 +
      personalBrandingGrowth * 0.15 +
      englishCompletion * 0.1
  );
}

function calculateExecutionPace({
  daysBehind,
  roadmapCompletion,
  week
}: {
  daysBehind: number;
  roadmapCompletion: number;
  week: number;
}) {
  const expectedCompletion = Math.min(100, Math.round((week / 26) * 100));

  if (daysBehind >= 2 || roadmapCompletion < expectedCompletion - 5) {
    return "Behind schedule" as const;
  }

  if (roadmapCompletion > expectedCompletion + 5) {
    return "Ahead of schedule" as const;
  }

  return "On track" as const;
}

function buildRecoveryPlan(daysBehind: number) {
  if (daysBehind === 0) {
    return {
      daysBehind: 0,
      message: "Execution is on track. Protect the GIS deep work block.",
      projectedCompletionDate: addDays(new Date(), 180),
      steps: [
        "Complete the primary GIS task before lower-priority work.",
        "Keep portfolio and branding work after GIS execution."
      ]
    };
  }

  return {
    daysBehind,
    message: "You are now behind schedule.",
    projectedCompletionDate: addDays(new Date(), 180 + daysBehind),
    steps: [
      "Preserve the 11:00 GIS Deep Work block.",
      "Move missed GIS work to the next available day.",
      "Keep English, training, and Personal Branding lighter until GIS is recovered.",
      "Split overloaded work across future days instead of stacking everything tomorrow."
    ]
  };
}

function nextMilestone(progress: number, label: string) {
  const milestones = [25, 50, 75, 100];
  const next = milestones.find((milestone) => progress < milestone) ?? 100;

  return `${label} ${next}% milestone`;
}

function selectActiveMissionProject(
  projects: { name: string; priority: string; progress: number }[]
) {
  return [...projects].sort((first, second) => {
    const missionDifference =
      projectMissionScore(second.name) - projectMissionScore(first.name);

    if (missionDifference !== 0) {
      return missionDifference;
    }

    return second.progress - first.progress;
  })[0] ?? null;
}

function projectMissionScore(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("gis study")) {
    return 100;
  }

  if (normalized.includes("portfolio")) {
    return 90;
  }

  if (normalized.includes("brand")) {
    return 80;
  }

  if (normalized.includes("english")) {
    return 60;
  }

  return 10;
}

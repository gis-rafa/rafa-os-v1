import { and, eq, gte, lt } from "drizzle-orm";
import {
  executionPriorities,
  executionProjects,
  executionTasks,
  getDb,
  isDatabaseConfigured,
  memories,
  projectKnowledgeLinks,
  studyTaskProgress,
  type ExecutionProject
} from "@/db";
import { seedDailyHealthTasks } from "@/lib/daily-health";

type ProjectSeed = {
  color: string;
  currentPhase: string;
  description: string;
  icon: string;
  name: string;
  priority: string;
  progress: number;
  targetDate: Date;
};

export async function seedDevelopmentWorkspace(userId: string) {
  if (!isDatabaseConfigured()) return;

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const gisStudyProject = await ensureProject(userId, {
    name: "GIS Study",
    description:
      "Daily GIS roadmap execution. This is the highest-priority work because it directly builds Rafa's remote GIS career. Currently in Month 1 GIS Sprint (Weeks 1-4).",
    status: "Active",
    priority: "High",
    currentPhase: "Week 3 Soil Mapping Completion",
    progress: 42,
    targetDate: addDays(today, 30),
    color: "green",
    icon: "map"
  });
  const portfolioProject = await ensureProject(userId, {
    name: "GIS Portfolio Launch",
    description:
      "Build and publish GIS portfolio case studies. P01 (Uruguay Base Map) complete. P02 (CONEAT Soil Map) at 90%. Remaining: final cartographic layout, report, screenshots, LinkedIn post.",
    status: "Active",
    priority: "High",
    currentPhase: "Final Cartographic Layout",
    progress: 90,
    targetDate: addDays(today, 45),
    color: "green",
    icon: "map"
  });
  const brandProject = await ensureProject(userId, {
    name: "Personal Branding",
    description:
      "LinkedIn, portfolio site, and public proof of work that support a remote GIS career without distracting from execution.",
    status: "Active",
    priority: "High",
    currentPhase: "Positioning",
    progress: 22,
    targetDate: addDays(today, 45),
    color: "purple",
    icon: "briefcase"
  });
  await ensureProject(userId, {
    name: "English",
    description:
      "Improve professional communication for remote GIS work, interviews, proposals, and public writing.",
    status: "Active",
    priority: "Medium",
    currentPhase: "Daily Practice",
    progress: 16,
    targetDate: addDays(today, 60),
    color: "blue",
    icon: "book"
  });
  const trainingProject = await ensureProject(userId, {
    name: "Physical Training",
    description:
      "Protect energy, focus, and consistency so GIS execution is sustainable.",
    status: "Active",
    priority: "Medium",
    currentPhase: "Workout Schedule",
    progress: 12,
    targetDate: addDays(today, 30),
    color: "orange",
    icon: "heart"
  });

  await getDb()
    .delete(executionPriorities)
    .where(
      and(
        eq(executionPriorities.userId, userId),
        gte(executionPriorities.priorityDate, today),
        lt(executionPriorities.priorityDate, tomorrow)
      )
    );

  await Promise.all([
    ensurePriority(
      userId,
      "GIS Portfolio: complete Project 02 (CONEAT Soil Map) cartographic layout",
      today
    ),
    ensurePriority(
      userId,
      "Final Portfolio Map: polish QGIS export for publication",
      today
    ),
    ensurePriority(
      userId,
      "GIS Study: continue Week 4 Land Suitability Foundations",
      today
    ),
    ensurePriority(
      userId,
      "Personal Branding: draft LinkedIn post announcing P02 completion",
      today
    )
  ]);

  await getDb()
    .delete(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        gte(executionTasks.taskDate, today),
        lt(executionTasks.taskDate, tomorrow)
      )
    );

  await Promise.all([
    ensureTask({
      estimatedMinutes: 60,
      priority: "High",
      projectId: portfolioProject.id,
      status: "In Progress",
      taskDate: today,
      title: "16:00 P02 Cartographic Layout: polish QGIS export for portfolio"
    }, userId),
    ensureTask({
      estimatedMinutes: 60,
      priority: "High",
      projectId: portfolioProject.id,
      status: "Todo",
      taskDate: today,
      title: "17:00 P02 Final Report: write README with full documentation"
    }, userId),
    ensureTask({
      estimatedMinutes: 45,
      priority: "High",
      projectId: portfolioProject.id,
      status: "Todo",
      taskDate: today,
      title: "18:00 P02 Portfolio Screenshots: capture map outputs"
    }, userId),
    ensureTask({
      estimatedMinutes: 30,
      priority: "Medium",
      projectId: gisStudyProject.id,
      status: "Todo",
      taskDate: today,
      title: "13:00 GIS Study: Week 4 Land Suitability Foundations"
    }, userId),
    ensureTask({
      estimatedMinutes: 30,
      priority: "High",
      projectId: brandProject.id,
      status: "Todo",
      taskDate: today,
      title: "20:00 Personal Branding: draft LinkedIn P02 launch post"
    }, userId),
    ensureTask({
      estimatedMinutes: 60,
      priority: "Medium",
      projectId: trainingProject.id,
      status: "Todo",
      taskDate: today,
      title: "09:00 Gym: follow the workout schedule"
    }, userId),
    ensureTask({
      estimatedMinutes: 20,
      priority: "Medium",
      projectId: brandProject.id,
      status: "Todo",
      taskDate: tomorrow,
      title: "Prepare tomorrow's Personal Branding proof-of-work update"
    }, userId)
  ]);

  await seedDailyHealthTasks(userId);

  await getDb()
    .delete(memories)
    .where(
      and(
        eq(memories.userId, userId),
        eq(memories.category, "GIS"),
        eq(memories.title, "Primary mission")
      )
    );

  await Promise.all([
    ensureMemory({
      category: "GIS",
      content:
        "Primary mission: become a Remote GIS Professional. P01 (Uruguay Base Map) complete. P02 (CONEAT Soil Map) at 90%. Remaining deliverables for P02: final cartographic layout, final report, portfolio screenshots, LinkedIn post. Next project: P03 Land Suitability Analysis.",
      importance: 5,
      projectId: gisStudyProject.id,
      tags: ["gis", "career", "remote-work", "mission", "portfolio"],
      title: "Primary mission"
    }, userId),
    ensureMemory({
      category: "Execution",
      content:
        "Current GIS progress: Week 3 Soil Mapping with CONEAT wrapping up. Project 02 at 90%. Current focus is final cartographic layout and portfolio deliverables for P02. Next up: Week 4 Land Suitability Foundations for P03.",
      importance: 5,
      projectId: portfolioProject.id,
      tags: ["gis", "progress", "portfolio", "coneat"],
      title: "Current GIS progress"
    }, userId),
    ensureMemory({
      category: "Career",
      content:
        "Personal branding should always support the Remote GIS Career mission through LinkedIn, portfolio, and public proof of work.",
      importance: 4,
      projectId: brandProject.id,
      tags: ["branding", "linkedin", "portfolio", "career"],
      title: "Personal branding role"
    }, userId)
  ]);

  await getDb()
    .delete(projectKnowledgeLinks)
    .where(eq(projectKnowledgeLinks.userId, userId));

  await Promise.all([
    ensureKnowledgeLink({
      filePath:
        "uruguay-agricultural-gis/05-gis-portfolio/portfolio-project-sequence.md",
      projectId: portfolioProject.id,
      tags: ["GIS", "Portfolio"],
      title: "Portfolio Project Sequence"
    }, userId),
    ensureKnowledgeLink({
      filePath:
        "uruguay-agricultural-gis/02-execution-plan/week-3-soil-mapping-with-coneat.md",
      projectId: portfolioProject.id,
      tags: ["GIS", "Resources"],
      title: "Week 3 Soil Mapping With CONEAT"
    }, userId),
    ensureKnowledgeLink({
      filePath:
        "uruguay-agricultural-gis/04-branding-roadmap/linkedin-strategy.md",
      projectId: brandProject.id,
      tags: ["Branding", "Career"],
      title: "LinkedIn Strategy"
    }, userId)
  ]);

  await getDb()
    .delete(studyTaskProgress)
    .where(eq(studyTaskProgress.userId, userId));

  const dayValues: { userId: string; roadmapDay: number; status: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    dayValues.push({ userId, roadmapDay: i, status: "Done" });
  }
  dayValues.push({ userId, roadmapDay: 21, status: "In Progress" });

  await getDb()
    .insert(studyTaskProgress)
    .values(dayValues);
}

async function ensureProject(
  userId: string,
  values: ProjectSeed & { status: string }
): Promise<ExecutionProject> {
  const db = getDb();
  const [existingProject] = await db
    .select()
    .from(executionProjects)
    .where(
      and(
        eq(executionProjects.userId, userId),
        eq(executionProjects.name, values.name)
      )
    )
    .limit(1);

  if (existingProject) {
    const [updatedProject] = await db
      .update(executionProjects)
      .set({
        ...values,
        updatedAt: new Date()
      })
      .where(eq(executionProjects.id, existingProject.id))
      .returning();

    return updatedProject;
  }

  const [createdProject] = await db
    .insert(executionProjects)
    .values({
      userId,
      ...values
    })
    .returning();

  return createdProject;
}

async function ensurePriority(userId: string, title: string, priorityDate: Date) {
  const db = getDb();
  const dayStart = startOfDay(priorityDate);
  const dayEnd = addDays(dayStart, 1);
  const [existingPriority] = await db
    .select()
    .from(executionPriorities)
    .where(
      and(
        eq(executionPriorities.userId, userId),
        eq(executionPriorities.title, title),
        gte(executionPriorities.priorityDate, dayStart),
        lt(executionPriorities.priorityDate, dayEnd)
      )
    )
    .limit(1);

  if (existingPriority) {
    return existingPriority;
  }

  const [createdPriority] = await db
    .insert(executionPriorities)
    .values({
      userId,
      title,
      priorityDate
    })
    .returning();

  return createdPriority;
}

async function ensureTask(
  values: {
    estimatedMinutes: number;
    priority: string;
    projectId: string;
    status: string;
    taskDate: Date;
    title: string;
  },
  userId: string
) {
  const db = getDb();
  const [existingTask] = await db
    .select()
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        eq(executionTasks.title, values.title)
      )
    )
    .limit(1);

  if (existingTask) {
    return db
      .update(executionTasks)
      .set({
        ...values,
        updatedAt: new Date()
      })
      .where(eq(executionTasks.id, existingTask.id));
  }

  return db.insert(executionTasks).values({
    userId,
    ...values
  });
}

async function ensureMemory(
  values: {
    category: string;
    content: string;
    importance: number;
    projectId: string;
    tags: string[];
    title: string;
  },
  userId: string
) {
  const db = getDb();
  const [existingMemory] = await db
    .select()
    .from(memories)
    .where(and(eq(memories.userId, userId), eq(memories.title, values.title)))
    .limit(1);

  if (existingMemory) {
    return db
      .update(memories)
      .set({
        ...values,
        updatedAt: new Date()
      })
      .where(eq(memories.id, existingMemory.id));
  }

  return db.insert(memories).values({
    userId,
    ...values
  });
}

async function ensureKnowledgeLink(
  values: {
    filePath: string;
    projectId: string;
    tags: string[];
    title: string;
  },
  userId: string
) {
  const db = getDb();
  const [existingLink] = await db
    .select()
    .from(projectKnowledgeLinks)
    .where(
      and(
        eq(projectKnowledgeLinks.projectId, values.projectId),
        eq(projectKnowledgeLinks.filePath, values.filePath)
      )
    )
    .limit(1);

  if (existingLink) {
    return db
      .update(projectKnowledgeLinks)
      .set({
        ...values,
        updatedAt: new Date()
      })
      .where(eq(projectKnowledgeLinks.id, existingLink.id));
  }

  return db.insert(projectKnowledgeLinks).values({
    userId,
    ...values
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

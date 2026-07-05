import { and, eq, gte, lt, sql } from "drizzle-orm";
import {
  executionPriorities,
  executionProjects,
  executionTasks,
  getDb,
  memories,
  projectKnowledgeLinks,
  studyTaskProgress,
  type ExecutionProject
} from "@/db";

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
  const db = getDb();
  const [existingProjects] = await db
    .select({ count: sql<number>`count(*)` })
    .from(executionProjects)
    .where(eq(executionProjects.userId, userId));

  if (Number(existingProjects?.count ?? 0) > 0) {
    return;
  }

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const gisStudyProject = await ensureProject(userId, {
    name: "GIS Study",
    description:
      "Daily GIS roadmap execution. This is the highest-priority work because it directly builds Rafa's remote GIS career.",
    status: "Active",
    priority: "High",
    currentPhase: "Roadmap Execution",
    progress: 28,
    targetDate: addDays(today, 30),
    color: "green",
    icon: "map"
  });
  const portfolioProject = await ensureProject(userId, {
    name: "GIS Portfolio Launch",
    description:
      "Build and publish GIS portfolio case studies that prove Rafa can deliver remote GIS work.",
    status: "Active",
    priority: "High",
    currentPhase: "Case Study Foundation",
    progress: 34,
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
  const englishProject = await ensureProject(userId, {
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

  await removeLegacySeedPriority(userId, today);
  await Promise.all([
    ensurePriority(
      userId,
      "GIS Study: complete today's roadmap task at 13:00.",
      today
    ),
    ensurePriority(
      userId,
      "GIS Portfolio: move one case-study deliverable forward at 16:00.",
      today
    ),
    ensurePriority(
      userId,
      "Personal Branding: publish or draft one LinkedIn/portfolio action at 20:00.",
      today
    )
  ]);

  await Promise.all([
    ensureTask({
      estimatedMinutes: 60,
      priority: "High",
      projectId: gisStudyProject.id,
      status: "In Progress",
      taskDate: today,
      title: "11:00 GIS Deep Work: build core remote GIS skill"
    }, userId),
    ensureTask({
      estimatedMinutes: 60,
      priority: "High",
      projectId: gisStudyProject.id,
      status: "Todo",
      taskDate: today,
      title: "13:00 GIS Study: complete today's roadmap task"
    }, userId),
    ensureTask({
      estimatedMinutes: 60,
      priority: "High",
      projectId: portfolioProject.id,
      status: "Todo",
      taskDate: today,
      title: "16:00 GIS Portfolio: improve one portfolio deliverable"
    }, userId),
    ensureTask({
      estimatedMinutes: 30,
      priority: "Medium",
      projectId: englishProject.id,
      status: "Todo",
      taskDate: today,
      title: "18:00 English: practice remote-work communication"
    }, userId),
    ensureTask({
      estimatedMinutes: 30,
      priority: "High",
      projectId: brandProject.id,
      status: "Todo",
      taskDate: today,
      title: "20:00 Personal Branding: LinkedIn or portfolio content"
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

  await Promise.all([
    ensureMemory({
      category: "GIS",
      content:
        "Primary mission: become a Remote GIS Professional. GIS Study is the highest priority, followed by GIS Portfolio, Personal Branding, English, and Physical Training.",
      importance: 5,
      projectId: gisStudyProject.id,
      tags: ["gis", "career", "remote-work", "mission"],
      title: "Primary mission"
    }, userId),
    ensureMemory({
      category: "Execution",
      content:
        "Daily schedule: 08:00 wake up, 08:30 morning brief, 09:00 gym, 11:00 GIS deep work, 13:00 GIS study, 16:00 GIS portfolio, 18:00 English, 20:00 personal branding, 22:30 sleep.",
      importance: 5,
      projectId: gisStudyProject.id,
      tags: ["schedule", "gis", "execution"],
      title: "Daily mission schedule"
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

  await Promise.all([
    ensureKnowledgeLink({
      filePath:
        "uruguay-agricultural-gis/02-execution-plan/week-1-qgis-foundation-reset.md",
      projectId: gisStudyProject.id,
      tags: ["GIS", "Portfolio"],
      title: "Week 1 QGIS Foundation Reset"
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
        "uruguay-agricultural-gis/02-execution-plan/week-12-portfolio-website-and-outreach.md",
      projectId: brandProject.id,
      tags: ["Branding", "Career"],
      title: "Week 12 Portfolio Website and Outreach"
    }, userId)
  ]);

  await getDb()
    .insert(studyTaskProgress)
    .values([
      {
        userId,
        roadmapDay: 1,
        status: "Done"
      },
      {
        userId,
        roadmapDay: 2,
        status: "In Progress"
      }
    ])
    .onConflictDoNothing();
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

async function removeLegacySeedPriority(userId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);

  await getDb()
    .delete(executionPriorities)
    .where(
      and(
        eq(executionPriorities.userId, userId),
        eq(executionPriorities.title, "Protect health basics before deep work."),
        gte(executionPriorities.priorityDate, dayStart),
        lt(executionPriorities.priorityDate, dayEnd)
      )
    );
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

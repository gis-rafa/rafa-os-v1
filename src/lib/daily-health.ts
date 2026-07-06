import { and, asc, eq, gte, lt } from "drizzle-orm";
import { getDb, isDatabaseConfigured, workoutExerciseLog, executionTasks, executionProjects, memories } from "@/db";

export type DailyMedication = {
  time: "morning" | "lunch" | "evening" | "workout" | "sleep";
  supplements: { name: string; dose?: string }[];
};

export type WorkoutDay = {
  dayName: string;
  dayOfWeek: number;
  exercises: { name: string; sets: number; reps?: string; notes?: string }[];
};

const WORKOUT_SCHEDULE: WorkoutDay[] = [
  {
    dayName: "Monday",
    dayOfWeek: 1,
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-12" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
      { name: "Dumbbell Flyes", sets: 3, reps: "12-15" },
      { name: "Overhead Press", sets: 3, reps: "8-12" },
      { name: "Lateral Raises", sets: 3, reps: "12-15" },
      { name: "Tricep Pushdown", sets: 3, reps: "12-15" },
    ],
  },
  {
    dayName: "Tuesday",
    dayOfWeek: 2,
    exercises: [
      { name: "Deadlift", sets: 4, reps: "5-8" },
      { name: "Pull-Ups", sets: 3, reps: "8-12" },
      { name: "Barbell Rows", sets: 3, reps: "8-12" },
      { name: "Face Pulls", sets: 3, reps: "12-15" },
      { name: "Barbell Curl", sets: 3, reps: "10-12" },
      { name: "Hammer Curl", sets: 3, reps: "10-12" },
    ],
  },
  {
    dayName: "Wednesday",
    dayOfWeek: 3,
    exercises: [
      { name: "Squat", sets: 4, reps: "8-12" },
      { name: "Leg Press", sets: 3, reps: "10-12" },
      { name: "Romanian Deadlift", sets: 3, reps: "10-12" },
      { name: "Leg Extension", sets: 3, reps: "12-15" },
      { name: "Leg Curl", sets: 3, reps: "12-15" },
      { name: "Calf Raises", sets: 4, reps: "12-15" },
    ],
  },
  {
    dayName: "Thursday",
    dayOfWeek: 4,
    exercises: [
      { name: "Incline Bench Press", sets: 4, reps: "8-12" },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: "8-12" },
      { name: "Arnold Press", sets: 3, reps: "10-12" },
      { name: "Lateral Raises", sets: 3, reps: "12-15" },
      { name: "Skull Crushers", sets: 3, reps: "10-12" },
      { name: "Overhead Tricep Extension", sets: 3, reps: "12-15" },
    ],
  },
  {
    dayName: "Friday",
    dayOfWeek: 5,
    exercises: [
      { name: "Barbell Rows", sets: 4, reps: "8-12" },
      { name: "Lat Pulldown", sets: 3, reps: "8-12" },
      { name: "Seated Cable Rows", sets: 3, reps: "10-12" },
      { name: "Dumbbell Curl", sets: 3, reps: "10-12" },
      { name: "Preacher Curl", sets: 3, reps: "10-12" },
      { name: "Face Pulls", sets: 3, reps: "12-15" },
    ],
  },
  {
    dayName: "Saturday",
    dayOfWeek: 6,
    exercises: [
      { name: "Squat", sets: 3, reps: "8-12" },
      { name: "Leg Press", sets: 3, reps: "10-12" },
      { name: "Walking Lunges", sets: 3, reps: "12-15" },
      { name: "Leg Curl", sets: 3, reps: "12-15" },
      { name: "Calf Raises", sets: 4, reps: "12-15" },
      { name: "Plank", sets: 3, notes: "60s hold" },
    ],
  },
  {
    dayName: "Sunday",
    dayOfWeek: 0,
    exercises: [
      { name: "Active Recovery / Walk", sets: 1, notes: "30-60 min light walk" },
      { name: "Stretching", sets: 1, notes: "15-20 min full body" },
    ],
  },
];

export function getWorkoutForDay(dayOfWeek: number): WorkoutDay | null {
  return WORKOUT_SCHEDULE.find((d) => d.dayOfWeek === dayOfWeek) ?? null;
}

function getDailySupplements(dayOfWeek: number): { title: string; category: string; priority: string }[] {
  const tasks: { title: string; category: string; priority: string }[] = [
    { title: "Centrum (morning)", category: "medication", priority: "High" },
    { title: "Volenta (morning)", category: "medication", priority: "High" },
    { title: "Limitless Milga Max (lunch)", category: "medication", priority: "High" },
    { title: "Omega 3 (lunch)", category: "medication", priority: "High" },
    { title: "Newnutrition (evening)", category: "medication", priority: "High" },
    { title: "Magnesium Glycinate (before sleep)", category: "medication", priority: "High" },
    { title: "Water 4-5L", category: "hydration", priority: "Medium" },
  ];

  const hasWorkout = dayOfWeek !== 0;
  if (hasWorkout) {
    tasks.push({ title: "Creatine (pre-workout)", category: "medication", priority: "High" });
    tasks.push({ title: "Electrolytes (workout day)", category: "supplement", priority: "Medium" });
  }

  return tasks;
}

export async function seedDailyHealthTasks(userId: string) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const [existingProject] = await db
    .select()
    .from(executionProjects)
    .where(
      and(
        eq(executionProjects.userId, userId),
        eq(executionProjects.name, "Health & Daily")
      )
    )
    .limit(1);

  let healthProject = existingProject ?? null;
  if (!healthProject) {
    [healthProject] = await db
      .insert(executionProjects)
      .values({
        userId,
        name: "Health & Daily",
        description: "Daily medication, hydration, and workout tracking with individual checklist items",
        status: "Active",
        priority: "High",
        currentPhase: "Daily",
        progress: 0,
        targetDate: addDays(today, 365),
        color: "emerald",
        icon: "heart",
      })
      .returning();
  }

  const existingHealthTasks = await db
    .select({ title: executionTasks.title })
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        eq(executionTasks.projectId, healthProject.id),
        gte(executionTasks.taskDate, today),
        lt(executionTasks.taskDate, tomorrow)
      )
    );

  const existingTitles = new Set(existingHealthTasks.map((t) => t.title));
  const dayOfWeek = today.getDay();
  const supplements = getDailySupplements(dayOfWeek);

  for (const sup of supplements) {
    if (existingTitles.has(sup.title)) continue;
    await db.insert(executionTasks).values({
      userId,
      projectId: healthProject.id,
      title: sup.title,
      estimatedMinutes: 2,
      priority: sup.priority,
      taskDate: today,
      status: "Todo",
    });
  }

  await db
    .delete(memories)
    .where(
      and(
        eq(memories.userId, userId),
        eq(memories.title, "Today's Health Status")
      )
    );

  const supplementCount = supplements.length;
  await db.insert(memories).values({
    userId,
    projectId: healthProject.id,
    category: "Health",
    title: "Today's Health Status",
    content: `Daily health plan: ${supplementCount} items including medication, hydration, and workout supplements. Tracked as individual checkboxes in the execution system. Water goal: 4-5L daily.`,
    importance: 3,
    tags: ["health", "medication", "hydration", "daily"],
  });
}

export async function getTodayExerciseLogs(userId: string) {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  return db
    .select()
    .from(workoutExerciseLog)
    .where(
      and(
        eq(workoutExerciseLog.userId, userId),
        gte(workoutExerciseLog.logDate, today),
        lt(workoutExerciseLog.logDate, tomorrow)
      )
    )
    .orderBy(asc(workoutExerciseLog.exerciseName));
}

export async function logExerciseSet({
  userId,
  exerciseName,
  setsCompleted,
  totalSets,
}: {
  userId: string;
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
}) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  const today = startOfDay(new Date());

  const [existing] = await db
    .select()
    .from(workoutExerciseLog)
    .where(
      and(
        eq(workoutExerciseLog.userId, userId),
        eq(workoutExerciseLog.logDate, today),
        eq(workoutExerciseLog.exerciseName, exerciseName)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(workoutExerciseLog)
      .set({
        setsCompleted,
        totalSets,
        completedAt: setsCompleted >= totalSets ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(workoutExerciseLog.id, existing.id));
  } else {
    await db.insert(workoutExerciseLog).values({
      userId,
      logDate: today,
      exerciseName,
      setsCompleted,
      totalSets,
      completedAt: setsCompleted >= totalSets ? new Date() : null,
    });
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

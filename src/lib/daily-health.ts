import { and, asc, eq, gte, lt } from "drizzle-orm";
import { getDb, isDatabaseConfigured, workoutExerciseLog, executionTasks, executionProjects } from "@/db";
import { getToday, getTomorrow, addDays } from "@/lib/date-service";

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

export async function seedDailyHealthTasks(userId: string, timezone?: string) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  const today = getToday(timezone);
  const tomorrow = getTomorrow(timezone);

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

  const dayOfWeek = today.getDay();
  const supplements = getDailySupplements(dayOfWeek);

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
  const hasAllSupplements = supplements.every((s) => existingTitles.has(s.title));

  if (hasAllSupplements) return;

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
}

export async function getTodayExerciseLogs(userId: string, timezone?: string) {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const today = getToday(timezone);
  const tomorrow = getTomorrow(timezone);

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
  timezone,
}: {
  userId: string;
  exerciseName: string;
  setsCompleted: number;
  totalSets: number;
  timezone?: string;
}) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  const today = getToday(timezone);

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

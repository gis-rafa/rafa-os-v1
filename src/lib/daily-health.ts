import { and, asc, eq, gte, lt } from "drizzle-orm";
import { getDb, isDatabaseConfigured, workoutExerciseLog, executionTasks, executionProjects } from "@/db";

export type DailyMedication = {
  time: "morning" | "lunch" | "dinner" | "sleep";
  supplements: { name: string; dose?: string }[];
};

export type WorkoutDay = {
  dayName: string;
  dayOfWeek: number;
  exercises: { name: string; sets: number; reps?: string; notes?: string }[];
};

export type DailyHealthData = {
  medications: DailyMedication[];
  todayWorkout: WorkoutDay | null;
  exerciseLogs: { exerciseName: string; setsCompleted: number; totalSets: number; done: boolean }[];
  hydrationTarget: number;
  hydrationLogged: boolean;
  allMedsDone: boolean;
  workoutDone: boolean;
  dailyProgress: number;
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

const MEDICATIONS: DailyMedication[] = [
  {
    time: "morning",
    supplements: [
      { name: "Centrum", dose: "1 tablet" },
      { name: "Volenta", dose: "as prescribed" },
    ],
  },
  {
    time: "lunch",
    supplements: [
      { name: "Limitless Milga Max", dose: "1 serving" },
      { name: "Omega 3", dose: "1 capsule" },
    ],
  },
  {
    time: "dinner",
    supplements: [
      { name: "Newnutrition", dose: "1 serving" },
    ],
  },
  {
    time: "sleep",
    supplements: [
      { name: "Magnesium Glycinate", dose: "1 capsule" },
    ],
  },
];

export function getWorkoutForDay(dayOfWeek: number): WorkoutDay | null {
  return WORKOUT_SCHEDULE.find((d) => d.dayOfWeek === dayOfWeek) ?? null;
}

export function getMedicationSchedule(): DailyMedication[] {
  return MEDICATIONS;
}

export async function seedDailyHealthTasks(userId: string) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  let healthProject = await db
    .select()
    .from(executionProjects)
    .where(
      and(
        eq(executionProjects.userId, userId),
        eq(executionProjects.name, "Health & Daily")
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!healthProject) {
    [healthProject] = await db
      .insert(executionProjects)
      .values({
        userId,
        name: "Health & Daily",
        description: "Daily medication, hydration, and workout tracking",
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

  const existingTodayTasks = await db
    .select({ title: executionTasks.title })
    .from(executionTasks)
    .where(
      and(
        eq(executionTasks.userId, userId),
        gte(executionTasks.taskDate, today),
        lt(executionTasks.taskDate, tomorrow),
        eq(executionTasks.projectId, healthProject.id)
      )
    );

  const existingTitles = new Set(existingTodayTasks.map((t) => t.title));

  const healthTasks = [
    { title: "☀️ Morning Medication: Centrum + Volenta", estimatedMinutes: 5, priority: "High" },
    { title: "🌞 Lunch Medication: Limitless Milga Max + Omega 3", estimatedMinutes: 5, priority: "High" },
    { title: "🌙 Dinner Medication: Newnutrition", estimatedMinutes: 5, priority: "High" },
    { title: "💤 Sleep Supplement: Magnesium Glycinate", estimatedMinutes: 5, priority: "High" },
    { title: "💧 Drink 4-5L Water Today", estimatedMinutes: 0, priority: "Medium" },
  ];

  const dayOfWeek = today.getDay();
  const workout = getWorkoutForDay(dayOfWeek);
  if (workout && workout.exercises.some((e) => !e.name.toLowerCase().includes("recovery") && !e.name.toLowerCase().includes("stretching"))) {
    healthTasks.push({
      title: `💪 Workout: ${workout.dayName} (${workout.exercises.length} exercises)`,
      estimatedMinutes: 60,
      priority: "High",
    });
    healthTasks.push({
      title: "🧪 Pre-Workout: Creatine",
      estimatedMinutes: 5,
      priority: "High",
    });
    if (dayOfWeek !== 0) {
      healthTasks.push({
        title: "⚡ Electrolytes (workout day)",
        estimatedMinutes: 5,
        priority: "Medium",
      });
    }
  }

  for (const task of healthTasks) {
    if (existingTitles.has(task.title)) continue;
    await db.insert(executionTasks).values({
      userId,
      projectId: healthProject.id,
      title: task.title,
      estimatedMinutes: task.estimatedMinutes,
      priority: task.priority,
      taskDate: today,
      status: "Todo",
    });
  }
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

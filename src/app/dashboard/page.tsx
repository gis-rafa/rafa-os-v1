import { Dashboard } from "@/components/dashboard";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import {
  getExecutionDashboardData
} from "@/lib/execution-dashboard";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";
import { getTodayExerciseLogs, getWorkoutForDay } from "@/lib/daily-health";
import { getDayOfWeek } from "@/lib/date-service";
import { getRequestTimezone } from "@/lib/request-timezone";
import { TimezoneProvider } from "@/components/timezone-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | RAFA OS",
  description: "Execution dashboard with morning brief, mission score, and daily tasks."
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const timezone = await getRequestTimezone();
  const user = await requireCurrentDbUser();

  try {
    await seedDevelopmentWorkspace(user.id, timezone);
  } catch {
    // seed failure is non-critical
  }

  const data = await getExecutionDashboardData(user.id, timezone);
  let exerciseLogs: { exerciseName: string; setsCompleted: number; totalSets: number; done: boolean }[] = [];
  try {
    exerciseLogs = (await getTodayExerciseLogs(user.id, timezone)).map((log) => ({
      exerciseName: log.exerciseName,
      setsCompleted: log.setsCompleted,
      totalSets: log.totalSets,
      done: (log.setsCompleted ?? 0) >= (log.totalSets ?? 1),
    }));
  } catch {
    // exercise logs are non-critical
  }

  const dayOfWeek = getDayOfWeek(timezone);
  const workout = getWorkoutForDay(dayOfWeek);

  return (
    <ErrorBoundaryWrapper>
      <TimezoneProvider />
      <Dashboard
        data={data}
        isDatabaseConfigured
        exerciseLogs={exerciseLogs}
        dayOfWeek={dayOfWeek}
        workout={workout ?? undefined}
        timezone={timezone}
      />
    </ErrorBoundaryWrapper>
  );
}

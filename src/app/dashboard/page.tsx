import { Dashboard } from "@/components/dashboard";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import {
  getExecutionDashboardData
} from "@/lib/execution-dashboard";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";
import { getTodayExerciseLogs, getWorkoutForDay } from "@/lib/daily-health";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | RAFA OS",
  description: "Execution dashboard with morning brief, mission score, and daily tasks."
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireCurrentDbUser();
  await seedDevelopmentWorkspace(user.id);
  const data = await getExecutionDashboardData(user.id);
  const exerciseLogs = (await getTodayExerciseLogs(user.id)).map((log) => ({
    exerciseName: log.exerciseName,
    setsCompleted: log.setsCompleted,
    totalSets: log.totalSets,
    done: (log.setsCompleted ?? 0) >= (log.totalSets ?? 1),
  }));
  const dayOfWeek = new Date().getDay();
  const workout = getWorkoutForDay(dayOfWeek);

  return (
    <ErrorBoundaryWrapper>
      <Dashboard
        data={data}
        isDatabaseConfigured
        exerciseLogs={exerciseLogs}
        dayOfWeek={dayOfWeek}
        workout={workout ?? undefined}
      />
    </ErrorBoundaryWrapper>
  );
}

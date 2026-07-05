import { Dashboard } from "@/components/dashboard";
import {
  getExecutionDashboardData,
  type ExecutionDashboardData
} from "@/lib/execution-dashboard";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isClerkConfigured() && canUseLocalDatabaseFallback()) {
    const user = await getLocalDevelopmentUser();
    await seedDevelopmentWorkspace(user.id);
    const data = await getExecutionDashboardData(user.id);

    return <Dashboard data={data} isDatabaseConfigured />;
  }

  if (!isClerkConfigured()) {
    return (
      <Dashboard
        data={createEmptyExecutionDashboardData()}
        isDatabaseConfigured={false}
      />
    );
  }

  const user = await requireCurrentDbUser();
  const data = await getExecutionDashboardData(user.id);

  return <Dashboard data={data} isDatabaseConfigured />;
}

function createEmptyExecutionDashboardData() {
  return {
    activeFocus: "No active focus stored yet.",
    activeProject: "GIS Study",
    activeProjects: [],
    activeStreak: 0,
    completionPercentageThisWeek: 0,
    currentDate: new Date(),
    currentPhase: "Not set",
    currentWeek: 0,
    daysRemainingToSixMonthTarget: 0,
    englishCompletion: 0,
    executionPace: "On track",
    latestImportantMemory: null,
    latestMemories: [],
    missionCompletion: 0,
    missionMilestones: {
      english: "English communication 25% milestone",
      personalBranding: "Personal branding 25% milestone",
      portfolio: "Portfolio 25% milestone",
      remoteJobReadiness: "Remote job readiness 25% milestone",
      roadmap: "GIS roadmap 25% milestone"
    },
    overdueTasks: [],
    personalBrandingGrowth: 0,
    portfolioCompletion: 0,
    priorities: [],
    primaryObjective: "Complete today's GIS roadmap work.",
    remoteJobReadiness: 0,
    recentCompletedTasks: [],
    recoveryPlan: {
      daysBehind: 0,
      message: "Execution is on track.",
      projectedCompletionDate: new Date(),
      steps: []
    },
    roadmapCompletion: 0,
    secondaryObjective: "Move the GIS portfolio one step forward.",
    tasksCompletedToday: 0,
    tasksRemainingToday: 0,
    thirdObjective: "Publish or draft one Personal Branding action.",
    todaysTasks: [],
    weeklyCompletionPercentage: 0
  } as ExecutionDashboardData;
}

import type { ExecutionDashboardData } from "@/lib/execution-dashboard";

export type MissionView = {
  brandingTasks: ExecutionDashboardData["todaysTasks"];
  currentTask: ExecutionDashboardData["todaysTasks"][number] | null;
  englishCompletion: number;
  estimatedImpact: {
    gisRoadmap: number;
    personalBranding: number;
    portfolio: number;
    remoteJobReadiness: number;
  };
  executionSummary: {
    gisProgress: number;
    missionScore: number;
    portfolioProgress: number;
    remoteReadiness: number;
  };
  milestones: {
    english: string;
    personalBranding: string;
    portfolio: string;
    remoteJobReadiness: string;
    roadmap: string;
  };
  missionScore: number;
  personalBrandingGrowth: number;
  portfolioCompletion: number;
  primaryGisComplete: boolean;
  remainingTasks: ExecutionDashboardData["todaysTasks"];
  remoteJobReadiness: number;
  roadmapCompletion: number;
};

export function buildMissionView(data: ExecutionDashboardData): MissionView {
  const incompleteTasks = data.todaysTasks.filter((task) => task.status !== "Done");
  const primaryGisTask =
    incompleteTasks.find((task) => isGisTask(task)) ?? null;
  const primaryGisComplete = !primaryGisTask;
  const brandingTasks = data.todaysTasks.filter((task) => isBrandingTask(task));
  const completedMissionTasks = data.todaysTasks.filter(
    (task) => task.status === "Done"
  );
  const dailyProgress =
    data.todaysTasks.length > 0
      ? Math.round((completedMissionTasks.length / data.todaysTasks.length) * 6)
      : 0;
  const roadmapCompletion = primaryGisComplete
    ? Math.min(100, data.roadmapCompletion + 1)
    : data.roadmapCompletion;
  const portfolioCompletion = hasCompletedMatchingTask(
    data.todaysTasks,
    "portfolio"
  )
    ? Math.min(100, data.portfolioCompletion + 2)
    : data.portfolioCompletion;
  const personalBrandingGrowth = hasCompletedMatchingTask(
    data.todaysTasks,
    "brand"
  )
    ? Math.min(100, data.personalBrandingGrowth + 2)
    : data.personalBrandingGrowth;
  const englishCompletion = hasCompletedMatchingTask(data.todaysTasks, "english")
    ? Math.min(100, data.englishCompletion + 2)
    : data.englishCompletion;
  const remoteJobReadiness = Math.round(
    roadmapCompletion * 0.45 +
      portfolioCompletion * 0.35 +
      personalBrandingGrowth * 0.2
  );
  const missionScore = Math.min(
    100,
    Math.round(
      roadmapCompletion * 0.45 +
        portfolioCompletion * 0.3 +
        personalBrandingGrowth * 0.15 +
        englishCompletion * 0.1 +
        dailyProgress
    )
  );
  const estimatedImpact = {
    gisRoadmap: primaryGisComplete ? 0 : 1,
    personalBranding: hasCompletedMatchingTask(data.todaysTasks, "brand") ? 2 : 0,
    portfolio: hasCompletedMatchingTask(data.todaysTasks, "portfolio") ? 2 : 0,
    remoteJobReadiness: primaryGisComplete ? 0 : 1
  };
  const executionSummary = {
    gisProgress: primaryGisComplete ? 1 : 0,
    missionScore: Math.max(0, missionScore - data.missionCompletion),
    portfolioProgress: Math.max(0, portfolioCompletion - data.portfolioCompletion),
    remoteReadiness: Math.max(0, remoteJobReadiness - data.remoteJobReadiness)
  };

  return {
    brandingTasks,
    currentTask: primaryGisTask ?? incompleteTasks[0] ?? null,
    englishCompletion,
    estimatedImpact,
    executionSummary,
    milestones: {
      english: nextMilestone(englishCompletion, "English communication"),
      personalBranding: nextMilestone(
        personalBrandingGrowth,
        "Personal branding"
      ),
      portfolio: nextMilestone(portfolioCompletion, "Portfolio"),
      remoteJobReadiness: nextMilestone(
        remoteJobReadiness,
        "Remote job readiness"
      ),
      roadmap: nextMilestone(roadmapCompletion, "GIS roadmap")
    },
    missionScore,
    personalBrandingGrowth,
    portfolioCompletion,
    primaryGisComplete,
    remainingTasks: incompleteTasks,
    remoteJobReadiness,
    roadmapCompletion
  };
}

export function hasCompletedMatchingTask(
  tasks: ExecutionDashboardData["todaysTasks"],
  keyword: string
) {
  return tasks.some(
    (task) =>
      task.status === "Done" &&
      `${task.projectName ?? ""} ${task.title}`.toLowerCase().includes(keyword)
  );
}

export function isGisTask(task: ExecutionDashboardData["todaysTasks"][number]) {
  const text = `${task.projectName ?? ""} ${task.title}`.toLowerCase();
  return text.includes("gis");
}

export function isBrandingTask(task: ExecutionDashboardData["todaysTasks"][number]) {
  const text = `${task.projectName ?? ""} ${task.title}`.toLowerCase();
  return (
    text.includes("brand") ||
    text.includes("linkedin") ||
    text.includes("portfolio content")
  );
}

export function nextMilestone(progress: number, label: string) {
  const next = [25, 50, 75, 100].find((milestone) => progress < milestone) ?? 100;
  return `${label} ${next}% milestone`;
}

export function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function formatMinutes(minutes: number | null) {
  if (!minutes) {
    return "No estimate";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

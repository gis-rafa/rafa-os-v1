import { Dashboard } from "@/components/dashboard";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import {
  getExecutionDashboardData
} from "@/lib/execution-dashboard";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { seedDevelopmentWorkspace } from "@/lib/seed-data";
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

  return <ErrorBoundaryWrapper><Dashboard data={data} isDatabaseConfigured /></ErrorBoundaryWrapper>;
}

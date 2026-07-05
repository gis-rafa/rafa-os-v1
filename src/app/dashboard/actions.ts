"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  executionTaskStatuses,
  updateExecutionTaskStatus,
  updatePriorityCompletion,
  type ExecutionTaskStatus
} from "@/lib/execution-dashboard";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";

export async function updatePriorityCompletionAction(formData: FormData) {
  const user = await getActionUser();
  const priorityId = String(formData.get("priorityId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";

  if (!priorityId) {
    return;
  }

  await updatePriorityCompletion({
    completed,
    priorityId,
    userId: user.id
  });

  revalidatePath("/dashboard");
}

export async function updateExecutionTaskStatusAction(formData: FormData) {
  const user = await getActionUser();
  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "") as ExecutionTaskStatus;

  if (!taskId || !executionTaskStatuses.includes(status)) {
    return;
  }

  await updateExecutionTaskStatus({
    status,
    taskId,
    userId: user.id
  });

  revalidatePath("/dashboard");
}

async function getActionUser() {
  if (isClerkConfigured()) {
    return requireCurrentDbUser();
  }

  if (canUseLocalDatabaseFallback()) {
    return getLocalDevelopmentUser();
  }

  throw new Error("Authentication is required.");
}

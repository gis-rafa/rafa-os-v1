"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth-user";
import {
  executionTaskStatuses,
  updateExecutionTaskStatus,
  updatePriorityCompletion,
  type ExecutionTaskStatus
} from "@/lib/execution-dashboard";
import { logExerciseSet } from "@/lib/daily-health";

export async function updatePriorityCompletionAction(formData: FormData) {
  try {
    const user = await getActionUser();
    const priorityId = String(formData.get("priorityId") ?? "");
    const completed = String(formData.get("completed") ?? "") === "true";

    if (!priorityId) return;

    await updatePriorityCompletion({ completed, priorityId, userId: user.id });
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updatePriorityCompletionAction failed:", error);
    throw error;
  }
}

export async function updateExecutionTaskStatusAction(formData: FormData) {
  try {
    const user = await getActionUser();
    const taskId = String(formData.get("taskId") ?? "");
    const status = String(formData.get("status") ?? "") as ExecutionTaskStatus;

    if (!taskId || !executionTaskStatuses.includes(status)) return;

    await updateExecutionTaskStatus({ status, taskId, userId: user.id });
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("updateExecutionTaskStatusAction failed:", error);
    throw error;
  }
}

export async function logExerciseSetAction(formData: FormData) {
  try {
    const user = await getActionUser();
    const exerciseName = String(formData.get("exerciseName") ?? "");
    const setsCompleted = Number(formData.get("setsCompleted") ?? 0);
    const totalSets = Number(formData.get("totalSets") ?? 0);

    if (!exerciseName) return;

    await logExerciseSet({ userId: user.id, exerciseName, setsCompleted, totalSets });
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("logExerciseSetAction failed:", error);
    throw error;
  }
}

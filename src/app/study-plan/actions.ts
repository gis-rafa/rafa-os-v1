"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";
import {
  studyTaskStatuses,
  updateStudyTaskStatus,
  type StudyTaskStatus
} from "@/lib/study-plan";

export async function updateStudyTaskStatusAction(formData: FormData) {
  const isAuthenticatedMode = isClerkConfigured();
  const isLocalDatabaseMode =
    !isAuthenticatedMode && canUseLocalDatabaseFallback();

  if (!isAuthenticatedMode && !isLocalDatabaseMode) {
    return;
  }

  const user = isAuthenticatedMode
    ? await requireCurrentDbUser()
    : await getLocalDevelopmentUser();
  const day = Number(formData.get("day"));
  const status = String(formData.get("status") ?? "") as StudyTaskStatus;

  if (!Number.isFinite(day) || !studyTaskStatuses.includes(status)) {
    return;
  }

  await updateStudyTaskStatus({
    day,
    status,
    userId: user.id
  });

  revalidatePath("/study-plan");
  revalidatePath("/dashboard");
  revalidatePath("/chat");
}

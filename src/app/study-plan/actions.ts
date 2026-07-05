"use server";

import { revalidatePath } from "next/cache";
import { getActionUser } from "@/lib/auth-user";
import {
  studyTaskStatuses,
  updateStudyTaskStatus,
  type StudyTaskStatus
} from "@/lib/study-plan";

export async function updateStudyTaskStatusAction(formData: FormData) {
  const user = await getActionUser();
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

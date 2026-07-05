"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, users } from "@/db";
import { getActionUser } from "@/lib/auth-user";
import { updateNotificationPreferences } from "@/lib/notification-preferences";

export async function updateProfileAction(formData: FormData) {
  const user = await getActionUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    redirect("/settings");
  }

  await getDb()
    .update(users)
    .set({
      name,
      email,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  revalidatePath("/settings");
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const user = await getActionUser();

  await updateNotificationPreferences(user.id, {
    emailNotifications: formData.get("emailNotifications") === "on",
    pushNotifications: formData.get("pushNotifications") === "on",
    dailyDigest: formData.get("dailyDigest") === "on",
    notifyOnMemorySuggestions: formData.get("notifyOnMemorySuggestions") === "on",
    notifyOnTaskReminders: formData.get("notifyOnTaskReminders") === "on",
    notifyOnProjectUpdates: formData.get("notifyOnProjectUpdates") === "on"
  });

  revalidatePath("/settings");
}

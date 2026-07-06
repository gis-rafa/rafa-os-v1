import { getDb, isDatabaseConfigured, notificationPreferences } from "@/db";
import { eq } from "drizzle-orm";

export type NotificationPreferenceDefaults = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
  notifyOnMemorySuggestions: boolean;
  notifyOnTaskReminders: boolean;
  notifyOnProjectUpdates: boolean;
};

export async function getNotificationPreferences(userId: string) {
  if (!isDatabaseConfigured()) {
    return {
      id: "",
      userId,
      emailNotifications: 1,
      pushNotifications: 0,
      dailyDigest: 1,
      notifyOnMemorySuggestions: 1,
      notifyOnTaskReminders: 1,
      notifyOnProjectUpdates: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const existing = await getDb()
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .then((rows) => rows[0] ?? null);

  if (!existing) {
    const [created] = await getDb()
      .insert(notificationPreferences)
      .values({
        userId,
        emailNotifications: 1,
        pushNotifications: 0,
        dailyDigest: 1,
        notifyOnMemorySuggestions: 1,
        notifyOnTaskReminders: 1,
        notifyOnProjectUpdates: 1
      })
      .returning();

    return created;
  }

  return existing;
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferenceDefaults>
) {
  if (!isDatabaseConfigured()) return null;

  const updates: Record<string, number> = {};
  for (const [key, value] of Object.entries(prefs)) {
    updates[key] = value ? 1 : 0;
  }

  const [updated] = await getDb()
    .update(notificationPreferences)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(notificationPreferences.userId, userId))
    .returning();

  return updated;
}

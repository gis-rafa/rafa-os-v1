"use server";

import { getDb, notifications } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";
import { and, desc, eq } from "drizzle-orm";

export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export async function createNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
  }
) {
  const [notification] = await getDb()
    .insert(notifications)
    .values({
      userId,
      ...data,
      read: 0
    })
    .returning();

  return notification;
}

export async function getNotifications() {
  const user = await getActionUser();
  const notificationList = await getDb()
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt));

  return notificationList;
}

export async function markNotificationRead(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await getDb()
    .update(notifications)
    .set({ read: 1 })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
}

export async function markAllNotificationsRead() {
  const user = await getActionUser();

  await getDb()
    .update(notifications)
    .set({ read: 1 })
    .where(eq(notifications.userId, user.id));
}

export async function deleteNotification(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await getDb()
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
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
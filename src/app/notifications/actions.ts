"use server";

import { getDb, notifications } from "@/db";
import { getActionUser } from "@/lib/auth-user";
import { and, count, desc, eq } from "drizzle-orm";

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

export async function getNotifications(limit = 50, offset = 0) {
  const user = await getActionUser();
  const where = eq(notifications.userId, user.id);
  const [items, totalResult] = await Promise.all([
    getDb()
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    getDb()
      .select({ value: count() })
      .from(notifications)
      .where(where)
  ]);

  return { items, total: Number(totalResult[0]?.value ?? 0) };
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
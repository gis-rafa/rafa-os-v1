"use server";

import { sql, and, eq } from "drizzle-orm";
import { getDb, notifications } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";

export async function getUnreadNotificationCount(): Promise<number> {
  const user = await requireCurrentDbUser();

  const [result] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, 0))
    );

  return result?.count ?? 0;
}

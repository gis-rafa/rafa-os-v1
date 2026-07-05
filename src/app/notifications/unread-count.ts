"use server";

import { sql, and, eq } from "drizzle-orm";
import { getDb, notifications } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";

export async function getUnreadNotificationCount(): Promise<number> {
  let user;
  if (isClerkConfigured()) {
    user = await requireCurrentDbUser();
  } else if (canUseLocalDatabaseFallback()) {
    user = await getLocalDevelopmentUser();
  } else {
    return 0;
  }

  const [result] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, 0))
    );

  return result?.count ?? 0;
}

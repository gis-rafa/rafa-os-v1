import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/db";

const workspaceUserId = "local-development-rafa";

export const getLocalDevelopmentUser = cache(async function getLocalDevelopmentUser() {
  const db = getDb();
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, workspaceUserId))
    .limit(1);

  if (existingUser) {
    return existingUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkUserId: workspaceUserId,
      email: "rafa.local@rafa-os.dev",
      name: "Abdallah Rafa"
    })
    .returning();

  return createdUser;
});

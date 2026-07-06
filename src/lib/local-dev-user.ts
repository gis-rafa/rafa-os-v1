import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, users } from "@/db";
import type { User } from "@/db";

const workspaceUserId = "local-development-rafa";

const staticFallbackUser: User = {
  id: "00000000-0000-0000-0000-000000000001",
  clerkUserId: workspaceUserId,
  email: "rafa.local@rafa-os.dev",
  name: "Abdallah Rafa",
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const getLocalDevelopmentUser = cache(async function getLocalDevelopmentUser(): Promise<User> {
  if (!isDatabaseConfigured()) {
    return staticFallbackUser;
  }

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

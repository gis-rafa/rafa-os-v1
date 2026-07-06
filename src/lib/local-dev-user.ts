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

export const getLocalDevelopmentUser = (() => {
  let cachedUser: User | null = null;

  return async function getLocalDevelopmentUser(): Promise<User> {
    if (cachedUser) return cachedUser;

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
      cachedUser = existingUser;
      return existingUser;
    }

    const [createdUser] = await db
      .insert(users)
      .values({
        clerkUserId: workspaceUserId,
        email: "rafa.local@rafa-os.dev",
        name: "Abdallah Rafa"
      })
      .onConflictDoNothing()
      .returning();

    if (createdUser) {
      cachedUser = createdUser;
      return createdUser;
    }

    const [fallbackUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, workspaceUserId))
      .limit(1);

    cachedUser = fallbackUser!;
    return fallbackUser!;
  };
})();

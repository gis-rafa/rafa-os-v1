import { eq } from "drizzle-orm";
import { getDb, users } from "@/db";
import { isClerkConfigured } from "@/lib/clerk-config";

const localDevClerkUserId = "local-development-rafa";

export function canUseLocalDatabaseFallback() {
  return (
    process.env.NODE_ENV !== "production" &&
    !isClerkConfigured() &&
    Boolean(process.env.DATABASE_URL)
  );
}

export async function getLocalDevelopmentUser() {
  const db = getDb();
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, localDevClerkUserId))
    .limit(1);

  if (existingUser) {
    return existingUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkUserId: localDevClerkUserId,
      email: "rafa.local@rafa-os.dev",
      name: "Abdallah Rafa"
    })
    .returning();

  return createdUser;
}

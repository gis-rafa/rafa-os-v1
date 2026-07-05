import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/db";

export async function requireCurrentDbUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Authentication is required.");
  }

  const db = getDb();
  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  );
  const email =
    primaryEmail?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;
  const imageUrl = clerkUser.imageUrl || null;

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUser.id))
    .limit(1);

  if (existingUser) {
    const [updatedUser] = await db
      .update(users)
      .set({
        email,
        name,
        imageUrl,
        updatedAt: new Date()
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    return updatedUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkUserId: clerkUser.id,
      email,
      name,
      imageUrl
    })
    .returning();

  return createdUser;
}

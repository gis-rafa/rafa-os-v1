"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, users } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";

export async function updateProfileAction(formData: FormData) {
  const user = await getActionUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    throw new Error("Name and email are required.");
  }

  await getDb()
    .update(users)
    .set({
      name,
      email,
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  revalidatePath("/settings");
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

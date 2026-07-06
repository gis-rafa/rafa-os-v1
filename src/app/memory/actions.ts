"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, isDatabaseConfigured, memories } from "@/db";
import { getActionUser } from "@/lib/auth-user";
import { clampImportance, truncateInput } from "@/lib/dashboard-utils";
import { createNotification } from "@/app/notifications/actions";

export async function createMemoryAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;

  const user = await getActionUser();
  const values = parseMemoryForm(formData);

  if (!values.category || !values.title || !values.content) {
    redirect("/memory");
  }

  await getDb().insert(memories).values({
    userId: user.id,
    ...values
  });

  await createNotification(user.id, {
    type: "success",
    title: "Memory Saved",
    message: `"${values.title}" has been saved to your memory.`
  });

  revalidatePath("/memory");
  redirect("/memory");
}

export async function updateMemoryAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;

  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");
  const values = parseMemoryForm(formData);

  if (!id) {
    redirect("/memory");
  }

  await getDb()
    .update(memories)
    .set({
      ...values,
      updatedAt: new Date()
    })
    .where(and(eq(memories.id, id), eq(memories.userId, user.id)));

  revalidatePath("/memory");
  redirect("/memory");
}

export async function deleteMemoryAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;

  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/memory");
  }

  await getDb()
    .delete(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, user.id)));

  revalidatePath("/memory");
  redirect("/memory");
}

function parseMemoryForm(formData: FormData) {
  const category = truncateInput(String(formData.get("category") ?? "").trim(), 100);
  const title = truncateInput(String(formData.get("title") ?? "").trim(), 200);
  const content = truncateInput(String(formData.get("content") ?? "").trim(), 10000);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const importance = clampImportance(Number(formData.get("importance") ?? 3));

  return {
    category,
    title,
    content,
    tags,
    importance
  };
}

"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, memories } from "@/db";
import { getActionUser } from "@/lib/auth-user";

export async function createMemoryAction(formData: FormData) {
  const user = await getActionUser();
  const values = parseMemoryForm(formData);

  await getDb().insert(memories).values({
    userId: user.id,
    ...values
  });

  revalidatePath("/memory");
  redirect("/memory");
}

export async function updateMemoryAction(formData: FormData) {
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
  const category = String(formData.get("category") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const importance = clampImportance(Number(formData.get("importance") ?? 3));

  if (!category || !title || !content) {
    throw new Error("Category, title, and content are required.");
  }

  return {
    category,
    title,
    content,
    tags,
    importance
  };
}

function clampImportance(value: number) {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(Math.max(Math.round(value), 1), 5);
}

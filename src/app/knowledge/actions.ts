"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, documents } from "@/db";
import { getActionUser } from "@/lib/auth-user";

export async function createKnowledgeFileAction(formData: FormData) {
  const user = await getActionUser();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    redirect("/knowledge");
  }

  const fileKey = `knowledge-file:${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;

  await getDb().insert(documents).values({
    userId: user.id,
    key: fileKey,
    content
  });

  revalidatePath("/knowledge");
  redirect("/knowledge");
}

"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataRoot } from "@/lib/paths";

const knowledgeRoot = path.join(dataRoot, "02-knowledge");

export async function createKnowledgeFileAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    redirect("/knowledge");
  }

  const tag = tags[0] ?? "General";
  const tagFolder = tag.toLowerCase().replace(/\s+/g, "-");
  const fileName = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  const filePath = path.join(knowledgeRoot, tagFolder, fileName);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");

  revalidatePath("/knowledge");
  redirect("/knowledge");
}
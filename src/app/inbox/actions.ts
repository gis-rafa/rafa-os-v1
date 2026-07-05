"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataRoot } from "@/lib/paths";

const inboxPath = path.join(dataRoot, "memory", "inbox");

export async function saveInboxEntryAction(formData: FormData) {
  const entry = String(formData.get("entry") ?? "").trim();

  if (!entry) {
    redirect("/inbox");
  }

  const timestamp = new Date();
  const isoTimestamp = timestamp.toISOString();
  const filenameTimestamp = isoTimestamp.replace(/[:.]/g, "-");
  const filePath = path.join(inboxPath, `${filenameTimestamp}.md`);
  const markdown = `# Inbox Note\n\n## Timestamp\n${isoTimestamp}\n\n## Entry\n${entry}\n`;

  await mkdir(inboxPath, { recursive: true });
  await writeFile(filePath, markdown, "utf8");

  revalidatePath("/inbox");
  redirect("/inbox");
}

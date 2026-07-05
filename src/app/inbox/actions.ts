"use server";

import { mkdir, writeFile, readdir, readFile, unlink } from "node:fs/promises";
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

export async function deleteInboxEntryAction(formData: FormData) {
  const fileName = String(formData.get("fileName") ?? "").trim();

  if (!fileName) {
    return;
  }

  const filePath = path.join(inboxPath, fileName);
  await unlink(filePath).catch(() => {});

  revalidatePath("/inbox");
}

export type InboxEntry = {
  fileName: string;
  timestamp: string;
  content: string;
};

export async function getInboxEntriesAction(): Promise<InboxEntry[]> {
  await mkdir(inboxPath, { recursive: true });

  const files = await readdir(inboxPath);
  const mdFiles = files
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  const entries: InboxEntry[] = [];

  for (const fileName of mdFiles) {
    try {
      const content = await readFile(path.join(inboxPath, fileName), "utf8");
      const timestampMatch = content.match(/## Timestamp\n(.+)/);
      const timestamp = timestampMatch?.[1] ?? fileName.replace(/\.md$/, "");
      entries.push({ fileName, timestamp, content });
    } catch {
      entries.push({ fileName, timestamp: fileName.replace(/\.md$/, ""), content: "" });
    }
  }

  return entries;
}

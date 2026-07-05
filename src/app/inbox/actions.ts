"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb, inboxEntries } from "@/db";
import { getActionUser } from "@/lib/auth-user";
import { truncateInput } from "@/lib/dashboard-utils";
import { createNotification } from "@/app/notifications/actions";

export async function saveInboxEntryAction(formData: FormData) {
  const user = await getActionUser();
  const entry = truncateInput(String(formData.get("entry") ?? "").trim(), 10000);

  if (!entry) {
    redirect("/inbox");
  }

  await getDb().insert(inboxEntries).values({
    userId: user.id,
    content: entry
  });

  await createNotification(user.id, {
    type: "info",
    title: "Inbox Entry Saved",
    message: entry.length > 100 ? `${entry.slice(0, 100)}...` : entry
  });

  revalidatePath("/inbox");
  redirect("/inbox");
}

export async function deleteInboxEntryAction(formData: FormData) {
  const user = await getActionUser();
  const entryId = String(formData.get("entryId") ?? "").trim();

  if (!entryId) {
    return;
  }

  await getDb()
    .delete(inboxEntries)
    .where(
      and(
        eq(inboxEntries.id, entryId),
        eq(inboxEntries.userId, user.id)
      )
    );

  revalidatePath("/inbox");
}

export type InboxEntry = {
  id: string;
  content: string;
  createdAt: Date;
};

export async function getInboxEntriesAction(limit = 50, offset = 0) {
  const user = await getActionUser();
  const where = eq(inboxEntries.userId, user.id);
  const [items, totalResult] = await Promise.all([
    getDb()
      .select()
      .from(inboxEntries)
      .where(where)
      .orderBy(desc(inboxEntries.createdAt))
      .limit(limit)
      .offset(offset),
    getDb()
      .select({ value: count() })
      .from(inboxEntries)
      .where(where)
  ]);

  return { items, total: Number(totalResult[0]?.value ?? 0) };
}

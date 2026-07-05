"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActionUser } from "@/lib/auth-user";
import {
  createJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
  type JournalFormValues
} from "@/lib/journal";

export async function createJournalEntryAction(formData: FormData) {
  const user = await getActionUser();
  const values = parseJournalForm(formData);

  const entry = await createJournalEntry(user.id, values);

  revalidatePath("/journal");
  redirect(`/journal?edit=${entry.id}`);
}

export async function updateJournalEntryAction(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");
  const values = parseJournalForm(formData);

  if (!id) {
    redirect("/journal");
  }

  await updateJournalEntry({ id, userId: user.id, values });

  revalidatePath("/journal");
  redirect("/journal");
}

export async function deleteJournalEntryAction(formData: FormData) {
  const user = await getActionUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/journal");
  }

  await deleteJournalEntry(id, user.id);

  revalidatePath("/journal");
  redirect("/journal");
}

function parseJournalForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!title || !content) {
    throw new Error("Title and content are required.");
  }

  return {
    title,
    content,
    mood,
    tags
  } as JournalFormValues;
}

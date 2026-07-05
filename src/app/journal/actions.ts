"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActionUser } from "@/lib/auth-user";
import { truncateInput } from "@/lib/dashboard-utils";
import {
  createJournalEntry,
  deleteJournalEntry,
  updateJournalEntry,
  type JournalFormValues
} from "@/lib/journal";

export async function createJournalEntryAction(formData: FormData) {
  const user = await getActionUser();
  const values = parseJournalForm(formData);

  if (!values.title || !values.content) {
    redirect("/journal");
  }

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

  if (!values.title || !values.content) {
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
  const title = truncateInput(String(formData.get("title") ?? "").trim(), 200);
  const content = truncateInput(String(formData.get("content") ?? "").trim(), 50000);
  const mood = truncateInput(String(formData.get("mood") ?? "").trim(), 100);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title,
    content,
    mood,
    tags
  } as JournalFormValues;
}

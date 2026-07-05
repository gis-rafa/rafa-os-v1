import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb, journalEntries } from "@/db";

export type JournalFilters = {
  userId: string;
  search?: string;
};

export type JournalFormValues = {
  title: string;
  content: string;
  mood: string;
  tags: string[];
};

export async function listJournalEntries({
  userId,
  search
}: JournalFilters) {
  const db = getDb();
  const conditions: SQL[] = [eq(journalEntries.userId, userId)];
  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    conditions.push(
      or(
        ilike(journalEntries.title, `%${normalizedSearch}%`),
        ilike(journalEntries.content, `%${normalizedSearch}%`)
      )!
    );
  }

  return db
    .select()
    .from(journalEntries)
    .where(and(...conditions))
    .orderBy(desc(journalEntries.createdAt));
}

export async function getJournalEntryForUser(id: string, userId: string) {
  const db = getDb();
  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
    .limit(1);

  return entry ?? null;
}

export async function createJournalEntry(
  userId: string,
  values: JournalFormValues
) {
  const db = getDb();
  const [entry] = await db
    .insert(journalEntries)
    .values({
      userId,
      ...values
    })
    .returning();

  return entry;
}

export async function updateJournalEntry({
  id,
  userId,
  values
}: {
  id: string;
  userId: string;
  values: JournalFormValues;
}) {
  const db = getDb();
  const [entry] = await db
    .update(journalEntries)
    .set({
      ...values,
      updatedAt: new Date()
    })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
    .returning();

  return entry ?? null;
}

export async function deleteJournalEntry(id: string, userId: string) {
  const db = getDb();
  await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

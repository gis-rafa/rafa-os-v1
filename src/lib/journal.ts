import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb, isDatabaseConfigured, journalEntries } from "@/db";

export type JournalFilters = {
  userId: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type JournalFormValues = {
  title: string;
  content: string;
  mood: string;
  tags: string[];
};

export async function listJournalEntries({
  userId,
  search,
  limit = 50,
  offset = 0
}: JournalFilters) {
  if (!isDatabaseConfigured()) return { items: [], total: 0 };

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

  const where = and(...conditions);
  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(journalEntries)
      .where(where)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(journalEntries)
      .where(where)
  ]);

  return { items, total: Number(totalResult[0]?.value ?? 0) };
}

export async function getJournalEntryForUser(id: string, userId: string) {
  if (!isDatabaseConfigured()) return null;

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
  if (!isDatabaseConfigured()) return null;

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
  if (!isDatabaseConfigured()) return null;

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
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  await db
    .delete(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

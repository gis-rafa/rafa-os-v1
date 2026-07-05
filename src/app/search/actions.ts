"use server";

import { getDb, journalEntries, memories } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  canUseLocalDatabaseFallback,
  getLocalDevelopmentUser
} from "@/lib/local-dev-user";
import { and, ilike, or, eq, desc } from "drizzle-orm";
import { loadKnowledgeIndex } from "@/lib/knowledge";
import path from "path";
import { promises as fs } from "fs";
import { dataRoot } from "@/lib/paths";

const knowledgeRoot = path.join(dataRoot, "02-knowledge");

export type SearchResult = {
  type: "memory" | "journal" | "knowledge";
  id: string;
  title: string;
  excerpt: string;
  url: string;
  createdAt: Date;
};

export async function globalSearchAction(searchTerm: string): Promise<SearchResult[]> {
  const user = await getActionUser();
  const term = searchTerm.trim();

  if (!term || term.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  // Search memories
  const memoryResults = await getDb()
    .select()
    .from(memories)
    .where(
      and(
        eq(memories.userId, user.id),
        or(
          ilike(memories.title, `%${term}%`),
          ilike(memories.content, `%${term}%`)
        )
      )
    )
    .orderBy(desc(memories.updatedAt))
    .limit(10);

  for (const m of memoryResults) {
    results.push({
      type: "memory",
      id: m.id,
      title: m.title,
      excerpt: truncate(m.content, 200),
      url: `/memory?q=${encodeURIComponent(term)}`,
      createdAt: m.createdAt
    });
  }

  // Search journal entries
  const journalResults = await getDb()
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, user.id),
        or(
          ilike(journalEntries.title, `%${term}%`),
          ilike(journalEntries.content, `%${term}%`)
        )
      )
    )
    .orderBy(desc(journalEntries.updatedAt))
    .limit(10);

  for (const j of journalResults) {
    results.push({
      type: "journal",
      id: j.id,
      title: j.title,
      excerpt: truncate(j.content, 200),
      url: `/journal?q=${encodeURIComponent(term)}`,
      createdAt: j.createdAt
    });
  }

  // Search knowledge files
  try {
    const index = await loadKnowledgeIndex();
    const knowledgeTerm = term.toLowerCase();
    const knowledgeFiles = index.files.filter(
      (f) =>
        f.title.toLowerCase().includes(knowledgeTerm) ||
        f.file.toLowerCase().includes(knowledgeTerm) ||
        f.tags.some((t) => t.toLowerCase().includes(knowledgeTerm))
    );

    for (const f of knowledgeFiles.slice(0, 10)) {
      let excerpt = "";
      try {
        const fullPath = path.join(knowledgeRoot, f.file);
        const content = await fs.readFile(fullPath, "utf8");
        excerpt = truncate(content, 200);
      } catch {
        excerpt = f.file;
      }

      results.push({
        type: "knowledge",
        id: f.file,
        title: f.title,
        excerpt,
        url: `/knowledge?tag=${encodeURIComponent(f.tags[0] ?? "")}`,
        createdAt: new Date(0)
      });
    }
  } catch {
    // Knowledge index may not exist
  }

  return results;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

async function getActionUser() {
  if (isClerkConfigured()) {
    return requireCurrentDbUser();
  }
  if (canUseLocalDatabaseFallback()) {
    return getLocalDevelopmentUser();
  }
  throw new Error("Authentication is required.");
}

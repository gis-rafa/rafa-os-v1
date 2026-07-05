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
import { generateEmbedding, searchSimilar, storeEmbedding } from "@/lib/embeddings";

const knowledgeRoot = path.join(dataRoot, "02-knowledge");

export type SearchResult = {
  type: "memory" | "journal" | "knowledge";
  id: string;
  title: string;
  excerpt: string;
  url: string;
  createdAt: Date;
  score?: number;
};

export async function globalSearchAction(searchTerm: string): Promise<SearchResult[]> {
  const user = await getActionUser();
  const term = searchTerm.trim();

  if (!term || term.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  const [memoryResults, journalResults] = await Promise.all([
    getDb()
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
      .limit(10),
    getDb()
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
      .limit(10)
  ]);

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

export async function semanticSearchAction(
  searchTerm: string
): Promise<SearchResult[]> {
  const user = await getActionUser();
  const term = searchTerm.trim();

  if (!term || term.length < 2) {
    return [];
  }

  const embedding = await generateEmbedding(term);
  if (!embedding) {
    return globalSearchAction(term);
  }

  const similar = await searchSimilar(user.id, embedding, { limit: 20 });

  if (similar.length === 0) {
    return globalSearchAction(term);
  }

  const results: SearchResult[] = [];

  for (const s of similar) {
    if (s.score < 0.5) continue;

    if (s.contentType === "memory") {
      const [mem] = await getDb()
        .select()
        .from(memories)
        .where(and(eq(memories.id, s.contentId), eq(memories.userId, user.id)))
        .limit(1);

      if (mem) {
        results.push({
          type: "memory",
          id: mem.id,
          title: mem.title,
          excerpt: truncate(mem.content, 200),
          url: `/memory?q=${encodeURIComponent(term)}`,
          createdAt: mem.createdAt,
          score: s.score
        });
      }
    } else if (s.contentType === "journal") {
      const [j] = await getDb()
        .select()
        .from(journalEntries)
        .where(
          and(eq(journalEntries.id, s.contentId), eq(journalEntries.userId, user.id))
        )
        .limit(1);

      if (j) {
        results.push({
          type: "journal",
          id: j.id,
          title: j.title,
          excerpt: truncate(j.content, 200),
          url: `/journal?q=${encodeURIComponent(term)}`,
          createdAt: j.createdAt,
          score: s.score
        });
      }
    }
  }

  results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return results.slice(0, 20);
}

export async function reindexEmbeddingsAction(): Promise<{ indexed: number }> {
  const user = await getActionUser();
  let indexed = 0;

  const allMemories = await getDb()
    .select()
    .from(memories)
    .where(eq(memories.userId, user.id));

  for (const mem of allMemories) {
    const text = `${mem.title}\n${mem.content}`;
    const embedding = await generateEmbedding(text);
    if (embedding) {
      await storeEmbedding(user.id, "memory", mem.id, embedding);
      indexed++;
    }
  }

  const allJournals = await getDb()
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, user.id));

  for (const j of allJournals) {
    const text = `${j.title}\n${j.content}`;
    const embedding = await generateEmbedding(text);
    if (embedding) {
      await storeEmbedding(user.id, "journal", j.id, embedding);
      indexed++;
    }
  }

  return { indexed };
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

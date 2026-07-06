import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb, isDatabaseConfigured, memories } from "@/db";

export type MemoryFilters = {
  userId: string;
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

export type MemorySuggestionInput = {
  category: string;
  title: string;
  content: string;
  tags: string[];
  importance: number;
};

export type MemorySuggestion = MemorySuggestionInput & {
  existingMemoryId?: string;
  mergeReason?: string;
};

export async function listMemories({
  userId,
  search,
  category,
  limit = 50,
  offset = 0
}: MemoryFilters) {
  if (!isDatabaseConfigured()) return { items: [], total: 0 };

  const db = getDb();
  const conditions: SQL[] = [eq(memories.userId, userId)];
  const normalizedSearch = search?.trim();
  const normalizedCategory = category?.trim();

  if (normalizedSearch) {
    conditions.push(
      or(
        ilike(memories.title, `%${normalizedSearch}%`),
        ilike(memories.content, `%${normalizedSearch}%`)
      )!
    );
  }

  if (normalizedCategory) {
    conditions.push(eq(memories.category, normalizedCategory));
  }

  const where = and(...conditions);
  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(memories)
      .where(where)
      .orderBy(desc(memories.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(memories)
      .where(where)
  ]);

  return { items, total: Number(totalResult[0]?.value ?? 0) };
}

export async function listMemoryCategories(userId: string) {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const rows = await db
    .selectDistinct({ category: memories.category })
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(memories.category);

  return rows.map((row) => row.category);
}

export async function getMemoryForUser(id: string, userId: string) {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();
  const [memory] = await db
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .limit(1);

  return memory ?? null;
}

export async function searchRelevantMemoriesForMessage(
  userId: string,
  userMessage: string,
  limit = 8
) {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const terms = extractSearchTerms(userMessage);

  if (terms.length === 0) {
    return db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.importance), desc(memories.updatedAt))
      .limit(limit);
  }

  const searchConditions = terms.flatMap((term) => {
    const pattern = `%${term}%`;

    return [
      ilike(memories.category, pattern),
      ilike(memories.title, pattern),
      ilike(memories.content, pattern),
      sql`EXISTS (
        SELECT 1
        FROM unnest(${memories.tags}) AS tag
        WHERE tag ILIKE ${pattern}
      )`
    ];
  });

  return db
    .select()
    .from(memories)
    .where(and(eq(memories.userId, userId), or(...searchConditions)))
    .orderBy(desc(memories.importance), desc(memories.updatedAt))
    .limit(limit);
}

export async function suggestMemoryFromConversation({
  assistantResponse,
  userId,
  userMessage
}: {
  assistantResponse: string;
  userId: string;
  userMessage: string;
}): Promise<MemorySuggestion | null> {
  const candidate = buildMemoryCandidate(userMessage, assistantResponse);

  if (!candidate) {
    return null;
  }

  const similarMemories = await searchRelevantMemoriesForMessage(
    userId,
    [candidate.category, candidate.title, candidate.content, ...candidate.tags].join(
      " "
    ),
    6
  );
  const exactMatch = similarMemories.find(
    (memory) => normalizeMemoryText(memory.content) === normalizeMemoryText(candidate.content)
  );

  if (exactMatch) {
    return null;
  }

  const closestMemory = similarMemories
    .map((memory) => ({
      memory,
      score: similarityScore(
        [memory.category, memory.title, memory.content, ...memory.tags].join(" "),
        [candidate.category, candidate.title, candidate.content, ...candidate.tags].join(" ")
      )
    }))
    .sort((a, b) => b.score - a.score)[0];

  if (closestMemory && closestMemory.score >= 0.38) {
    return {
      ...candidate,
      existingMemoryId: closestMemory.memory.id,
      title: closestMemory.memory.title,
      category: closestMemory.memory.category,
      content: mergeMemoryContent(closestMemory.memory.content, candidate.content),
      tags: Array.from(new Set([...closestMemory.memory.tags, ...candidate.tags])),
      importance: Math.max(closestMemory.memory.importance, candidate.importance),
      mergeReason: `Similar to existing memory: ${closestMemory.memory.title}`
    };
  }

  return candidate;
}

export async function saveMemorySuggestion(
  userId: string,
  suggestion: MemorySuggestion
) {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();
  const normalizedContent = normalizeMemoryText(suggestion.content);
  const similarMemories = await searchRelevantMemoriesForMessage(
    userId,
    [suggestion.category, suggestion.title, suggestion.content, ...suggestion.tags].join(
      " "
    ),
    8
  );
  const duplicate = similarMemories.find(
    (memory) => normalizeMemoryText(memory.content) === normalizedContent
  );

  if (duplicate) {
    return duplicate;
  }

  if (suggestion.existingMemoryId) {
    const [updatedMemory] = await db
      .update(memories)
      .set({
        category: suggestion.category,
        title: suggestion.title,
        content: suggestion.content,
        tags: suggestion.tags,
        importance: suggestion.importance,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(memories.id, suggestion.existingMemoryId),
          eq(memories.userId, userId)
        )
      )
      .returning();

    return updatedMemory;
  }

  const closestMemory = similarMemories
    .map((memory) => ({
      memory,
      score: similarityScore(
        [memory.category, memory.title, memory.content, ...memory.tags].join(" "),
        [suggestion.category, suggestion.title, suggestion.content, ...suggestion.tags].join(
          " "
        )
      )
    }))
    .sort((a, b) => b.score - a.score)[0];

  if (closestMemory && closestMemory.score >= 0.52) {
    const [updatedMemory] = await db
      .update(memories)
      .set({
        category: closestMemory.memory.category,
        title: closestMemory.memory.title,
        content: mergeMemoryContent(
          closestMemory.memory.content,
          suggestion.content
        ),
        tags: Array.from(new Set([...closestMemory.memory.tags, ...suggestion.tags])),
        importance: Math.max(closestMemory.memory.importance, suggestion.importance),
        updatedAt: new Date()
      })
      .where(
        and(eq(memories.id, closestMemory.memory.id), eq(memories.userId, userId))
      )
      .returning();

    return updatedMemory;
  }

  const [createdMemory] = await db
    .insert(memories)
    .values({
      userId,
      category: suggestion.category,
      title: suggestion.title,
      content: suggestion.content,
      tags: suggestion.tags,
      importance: suggestion.importance
    })
    .returning();

  return createdMemory;
}

function extractSearchTerms(value: string) {
  const stopWords = new Set([
    "about",
    "after",
    "again",
    "also",
    "and",
    "are",
    "because",
    "but",
    "can",
    "current",
    "does",
    "for",
    "from",
    "have",
    "how",
    "into",
    "next",
    "now",
    "please",
    "should",
    "that",
    "the",
    "this",
    "today",
    "what",
    "when",
    "with",
    "you"
  ]);

  return Array.from(
    new Set(
      value
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3 && !stopWords.has(term))
    )
  ).slice(0, 8);
}

function buildMemoryCandidate(
  userMessage: string,
  assistantResponse: string
): MemorySuggestionInput | null {
  const combined = `${userMessage}\n${assistantResponse}`.trim();
  const normalized = combined.toLowerCase();
  const durableSignals = [
    "remember",
    "my ",
    "i am",
    "i'm",
    "i need",
    "i want",
    "i prefer",
    "important",
    "priority",
    "goal",
    "habit",
    "health",
    "relationship",
    "career",
    "adhd",
    "master",
    "gis",
    "portfolio",
    "decision"
  ];

  if (!durableSignals.some((signal) => normalized.includes(signal))) {
    return null;
  }

  const content = extractMemoryContent(userMessage, assistantResponse);

  if (content.length < 30) {
    return null;
  }

  return {
    category: inferMemoryCategory(combined),
    title: createSuggestionTitle(content),
    content,
    tags: inferMemoryTags(combined),
    importance: inferImportance(combined)
  };
}

function extractMemoryContent(userMessage: string, assistantResponse: string) {
  const userContent = userMessage.trim();
  const assistantLines = assistantResponse
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) =>
      /remember|important|priority|goal|prefer|health|relationship|career|adhd|gis|master|decision/i.test(
        line
      )
    )
    .slice(0, 4);

  return [userContent, ...assistantLines]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 1200)
    .trim();
}

function inferMemoryCategory(value: string) {
  const normalized = value.toLowerCase();

  if (/health|sleep|energy|exercise|food|medical/.test(normalized)) {
    return "Health";
  }

  if (/relationship|attachment|family|friend|partner/.test(normalized)) {
    return "Relationships";
  }

  if (/career|job|freelance|client|portfolio|linkedin|brand/.test(normalized)) {
    return "Career";
  }

  if (/gis|qgis|map|mapping|uruguay|soil|remote sensing/.test(normalized)) {
    return "GIS";
  }

  if (/master|masters|study|learn|course|spanish/.test(normalized)) {
    return "Learning";
  }

  if (/adhd|focus|avoidance|routine|habit/.test(normalized)) {
    return "ADHD";
  }

  return "Conversation";
}

function inferMemoryTags(value: string) {
  const normalized = value.toLowerCase();
  const tagMap: Record<string, RegExp> = {
    adhd: /adhd|focus|avoidance/,
    career: /career|job|freelance|client/,
    gis: /gis|qgis|map|mapping|uruguay|soil/,
    health: /health|sleep|energy|exercise/,
    learning: /learn|study|master|spanish/,
    portfolio: /portfolio|brand|linkedin/,
    relationship: /relationship|attachment|family|partner/,
    decision: /decision|rule|priority/
  };
  const tags = Object.entries(tagMap)
    .filter(([, pattern]) => pattern.test(normalized))
    .map(([tag]) => tag);

  return tags.length > 0 ? tags : ["conversation"];
}

function inferImportance(value: string) {
  const normalized = value.toLowerCase();

  if (/critical|urgent|must|never forget|very important/.test(normalized)) {
    return 5;
  }

  if (/important|priority|goal|decision|health|relationship/.test(normalized)) {
    return 4;
  }

  return 3;
}

function createSuggestionTitle(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-#*\d.\s]+/, ""))
    .find(Boolean);

  return (firstLine ?? "Conversation memory").slice(0, 80);
}

function mergeMemoryContent(existingContent: string, newContent: string) {
  if (normalizeMemoryText(existingContent).includes(normalizeMemoryText(newContent))) {
    return existingContent;
  }

  return `${existingContent.trim()}\n\n${newContent.trim()}`.trim();
}

function normalizeMemoryText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function similarityScore(first: string, second: string) {
  const firstTerms = new Set(extractSearchTerms(first));
  const secondTerms = new Set(extractSearchTerms(second));

  if (firstTerms.size === 0 || secondTerms.size === 0) {
    return 0;
  }

  const overlap = Array.from(firstTerms).filter((term) => secondTerms.has(term));
  const denominator = Math.max(firstTerms.size, secondTerms.size);

  return overlap.length / denominator;
}

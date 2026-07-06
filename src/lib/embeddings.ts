import OpenAI from "openai";
import { getDb, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

type ContentType = "memory" | "journal" | "knowledge";

type EmbeddingRow = {
  content_id: string;
  content_type: string;
  score: string;
};

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getClient();
  if (!client) return null;

  const response = await client.embeddings.create({
    model: "text-embedding-ada-002",
    input: text.slice(0, 8000)
  });

  return response.data[0].embedding;
}

export async function storeEmbedding(
  userId: string,
  contentType: ContentType,
  contentId: string,
  embedding: number[]
) {
  if (!isDatabaseConfigured()) return;

  const db = getDb();
  const embeddingStr = `[${embedding.join(",")}]`;

  await db.execute(sql`
    INSERT INTO content_embeddings (user_id, content_type, content_id, embedding)
    VALUES (${userId}, ${contentType}, ${contentId}, ${embeddingStr}::vector)
    ON CONFLICT (user_id, content_type, content_id)
    DO UPDATE SET embedding = ${embeddingStr}::vector, updated_at = NOW()
  `);
}

export async function searchSimilar(
  userId: string,
  queryEmbedding: number[],
  options?: { limit?: number; contentType?: ContentType }
): Promise<{ contentId: string; contentType: string; score: number }[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const limit = options?.limit ?? 10;
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const typeFilter = options?.contentType
    ? sql`AND ce.content_type = ${options.contentType}`
    : sql``;

  const results = await db.execute(sql`
    SELECT
      ce.content_id,
      ce.content_type,
      1 - (ce.embedding <=> ${embeddingStr}::vector) AS score
    FROM content_embeddings ce
    WHERE ce.user_id = ${userId}
    ${typeFilter}
    ORDER BY score DESC
    LIMIT ${limit}
  `);

  return (results.rows as EmbeddingRow[]).map((row) => ({
    contentId: String(row.content_id),
    contentType: String(row.content_type),
    score: Number(row.score)
  }));
}

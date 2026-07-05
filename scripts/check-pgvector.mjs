import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query("CREATE EXTENSION IF NOT EXISTS vector");
  console.log("pgvector extension created successfully");
} catch (e) {
  console.log("FAILED:", e.message);
}

const res = await client.query(
  "SELECT extname FROM pg_extension WHERE extname = 'vector'"
);
console.log("Has vector extension:", res.rows.length > 0);

const typeRes = await client.query(
  "SELECT typname FROM pg_type WHERE typname = 'vector'"
);
console.log("Has vector type:", typeRes.rows.length > 0);

await client.end();

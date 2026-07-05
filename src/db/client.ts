import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

let pool: Pool | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return normalizePgConnectionUrl(databaseUrl);
}

export function getPgPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on("error", (err) => {
      console.error("Unexpected pool error:", err);
    });
  }

  return pool;
}

export function getDb() {
  if (!database) {
    database = drizzle(getPgPool(), { schema });
  }

  return database;
}

function normalizePgConnectionUrl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get("sslmode");
    const needsLibpqCompatibility =
      sslMode && ["prefer", "require", "verify-ca"].includes(sslMode);

    if (
      needsLibpqCompatibility &&
      !url.searchParams.has("uselibpqcompat") &&
      !url.searchParams.has("sslcert")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
}
